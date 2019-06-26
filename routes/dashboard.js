const express = require("express");
const router = express.Router({ mergeParams: true });
const bodyParser = require("body-parser");
const { Pool, Client } = require("pg");
const client_config = require("../config/client");
const Chart = require("chart.js");
const vm = require("../db/viewmodel");
const c = require("../db/control");
const v = require("../db/view");
const db = require("../db/index");

const pool = new Pool(client_config);
// const client = new Client(client_config);

pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

router.get("/dashboard/:uuid", async function(req, res) {
  const client = await pool.connect();
  // TODO: later connect this with db.query > const query = client.query.bind(client);
  vm.stateFlag = "0000";
  try {
    c.init();
    vm.stateFlag = "0001";
    console.log("================ dashboard pg starts ===============");
    // console.log("m.jwt: ", m.jwt);
    console.log("m.currentLogin: ", vm.currentLogin);
    // =========================================================
    // | Set CURRENT LOGIN & currentLoginType start |
    // =========================================================
    vm.stateFlag = "0010";
    c.setCurrentType(vm.currentLogin, "currentLoginType");
    // console.log("currentLoginType", m.currentLoginType);
    // =========================================================
    // | Set CURRENT SHOW & currentShowType start |
    // =========================================================
    if (vm.currentShow === null) {
      // when initial launch on the app
      vm.stateFlag = "0020";
      vm.currentShow = vm.currentLogin; // always gets data along with user_uuid
      c.setCurrentType(vm.currentShow, "currentShowType");
    } else {
      // from second launch on the app
      // check if the params.uuid is from org or user, if not the case of user, try fetching res with params.o.uuid in the next if-block.
      vm.stateFlag = "0025";
      let currentShow = await client.query(
        `${vm.userList.findAll.query} WHERE u.uuid = $1`,
        [req.params.uuid]
      );
      vm.currentShow = currentShow.rows[0]; // store in m only the rows
      vm.currentShowType = "user";
      if (
        vm.currentLoginType === "superadmin" &&
        typeof vm.currentShow === "undefined"
      ) {
        // this is org's case. if there's no data found from the query above,
        // the previously picked one should be org. Then, get all the org's users data IN AN ARRAY.
        vm.stateFlag = "0030";
        currentShow = await client.query(
          `${vm.userList.findAll.query} WHERE o.uuid = $1`,
          [req.params.uuid]
        );
        vm.currentShow = currentShow.rows[0];
        vm.currentShowType = "admin";
      }
    }
    console.log("currentShow: ", vm.currentShow);
    console.log("currentShowType: ", vm.currentShowType);
    // =========================================================
    // | Set ORGLIST & USERLIST start |
    // =========================================================
    let resOrgList, resUserList, resPie;
    vm.stateFlag = "0100";
    switch (vm.currentLoginType) {
      case "superadmin":
        vm.stateFlag = "0110";
        resOrgList = await client.query(vm.orgList.findAll.query);
        resUserList = await client.query(vm.userList.findAllForAdmin.query, [
          // TODO: for deployment, change the following line to m.currentLogin.o_id for superadmin's restricted authorization according to GDPR
          vm.currentShow.o_id
        ]);
        vm.resOrgList = resOrgList.rows;
        vm.resUserList = resUserList.rows;
        // Only when showType, fetch top 10 votes' rows in sharedroutes table for pie graph
        if (vm.currentShowType === "superadmin") {
          vm.stateFlag = "0115";
          resPie = await client.query(vm.pie.query);
          vm.resPie = resPie.rows;
        }
        break;
      case "admin":
        vm.stateFlag = "0120";
        resUserList = await client.query(vm.userList.findAllForAdmin.query, [
          vm.currentLogin.o_id
        ]);
        vm.resUserList = resUserList.rows;
        break;
      // default:
      //   break;
    }

    // =========================================================
    // | DASHBOARD CONTENTS - BAR - start |
    // =========================================================
    let usersDailyAvgThisMonth;
    if (typeof vm.resUserList != "undefined") {
      vm.stateFlag = "0150";
      let resBar;
      let sumAllUsers = 0;
      for await (let user of vm.resUserList) {
        // get accumulated data for one user for the last 30 days
        resBar = await client.query(vm.bar.findOne.query, [user.id]);
        timeCycledInMilSec = c.getTimeCycledInMilSec(resBar.rows);

        // =========================================================
        // | DASHBOARD - CARD(w/out query) - USERS' DAILY AVERAGE THIS MONTH |
        // =========================================================
        user.dpTime = c.convMilSecToFin(timeCycledInMilSec);
        user.timeCycledInMin = c.convToMin(timeCycledInMilSec);
        user.dpMonthlyAvgTCycled = c.convMilSecToFin(timeCycledInMilSec / 30);
        sumAllUsers = sumAllUsers + timeCycledInMilSec;
      }
      vm.stateFlag = "0160";
      console.log("sumAllUsers: ", sumAllUsers);
      usersDailyAvgThisMonth = sumAllUsers / vm.resUserList.length / 30;
      vm.average.admin_monthly.o_id = vm.currentShow.o_id;
      vm.average.admin_monthly.usersDailyAvgThisMonth = c.convMilSecToFin(
        usersDailyAvgThisMonth
      );
      vm.stateFlag = "0170";
      // console.log(vm.average.admin_monthly.usersDailyAvgThisMonth);
    }

    // =========================================================
    // | DASHBOARD CONTENTS - CARD(only w/ query) - start | defines card.number
    // =========================================================
    let resArea = undefined;
    let calendarType;
    vm.stateFlag = "0200";
    for await (let card of vm.cards[`for${vm.currentShowType}`]) {
      if (card.isCardShown) {
        let resCard, timeCycledInMilSec;
        switch (vm.currentShowType) {
          case "superadmin":
            vm.stateFlag = "0210";
            if (!!card.query) resCard = await client.query(card.query);
            break;
          case "admin":
            vm.stateFlag = "0220";
            if (!!card.query)
              resCard = await client.query(card.query, [vm.currentShow.o_id]);
            break;
          case "user":
            console.log("user card ----");
            if (!!card.query) {
              vm.stateFlag = "0230";
              resCard = await client.query(card.query, [vm.currentShow.id]);
              timeCycledInMilSec = c.getTimeCycledInMilSec(resCard.rows);
              if (
                card.isForLeftXaxis &&
                card.isDefaultForChart &&
                // TODO: delete the following line so the chart displays always no matter the data exists
                timeCycledInMilSec != 0
              ) {
                vm.stateFlag = "0240";
                resArea = resCard.rows;
                calendarType = card.periodTab;
              }
              // else if (
              //   card.name === "ACTIVE TIME THIS WEEK" &&
              //   timeCycledInMilSec != 0
              // ) {
              //   vm.tempResArea = resCard.rows;
              //   vm.tempCalendarType = card.periodTab;
              // }
            }
            break;
        }
        // if card.number should be resCard.rowCount, isForTimeCalc is set to false
        if (!!card.query && card.isForTimeCalc) {
          vm.stateFlag = "0250";
          card.number = c.convMilSecToFin(timeCycledInMilSec);
        } else if (!!card.query && !card.isForTimeCalc) {
          vm.stateFlag = "0260";
          card.number = resCard.rowCount;
        }
      }
    }

    // =========================================================
    // | DASHBOARD CONTENTS - AREA-CHART - start |
    // =========================================================
    // console.log("resArea: ", resArea);
    if (
      typeof resArea != "undefined" &&
      typeof resArea[0].packet_generated != "undefined"
    ) {
      vm.stateFlag = "0300";
      c.createBarChart(resArea, calendarType);
    }
    // console.log("TCL: vm.area.datasets", vm.area.datasets);
    // resBar = await client.query(m.bar.find)
    // =========================================================
    // | DASHBOARD CONTENTS - end |
    // =========================================================
    let data = {
      currentLogin: vm.currentLogin,
      currentLoginType: vm.currentLoginType,
      currentShow: vm.currentShow,
      currentShowType: vm.currentShowType,
      cards: vm.cards[`for${vm.currentShowType}`],
      vm: vm
    };
    vm.stateFlag = "0310";
    if (typeof vm.resOrgList != "undefined") data["orgs"] = vm.resOrgList;
    if (typeof vm.resUserList != "undefined") data["users"] = vm.resUserList;
    if (typeof vm.resPie != "undefined") {
      data["pie"] = vm.resPie;
      data["pieData"] = vm.pie;
    }
    // console.log("req.user: ", req.user);
    // console.log("req.params: ", req.params);
    // console.log("================ dashboard pg ends ===============");
    vm.pgload++;
    vm.stateFlag = "0320";
    res.render("dashboard", data);
  } catch (ex) {
    // await client.query('ROLLBACK')
    console.log(`something went wrong ${ex} at ${vm.stateFlag}`);
    vm.currentShow = null;
    setTimeout(function redirect() {
      res.redirect(`/dashboard/${req.params.uuid}`);
    }, 5000);
  } finally {
    await client.release();
    console.log("Client disconnected");
  }
});

router.post("/barchartforcard", async function(req, res) {
  console.log("card clicked=====================");
  const client = await pool.connect();
  vm.stateFlag = "0700";
  try {
    let resArea, showStatePosted;
    cardIdClickedOn = req.body.card_id;
    console.log("TCL: cardIdClickedOn", cardIdClickedOn);
    console.log("vm.currentShowType:", vm.currentShowType);

    vm.stateFlag = "0701";
    for await (let card of vm.cards[`for${vm.currentShowType}`]) {
      console.log("in for of loop and before if");
      console.log("card.id: ", typeof card.id);
      console.log("cardIdClickedOn: ", typeof cardIdClickedOn);
      // if (cardIdClickedOn.equals(card.id)) {
      //   console.log("finally in...");
      if (card.id == cardIdClickedOn) {
        console.log("finally in...");
        // showStatePosted = card.auth[card.auth.length - 1];
        // if (card.isForLeftXaxis) {
        if (card["cardIdRedirectedOnClickForQuery"] != null) {
          console.log(
            "in cardIdRedirectedOnClickForQuery!!",
            card.cardIdRedirectedOnClickForQuery
          );
          if (vm.currentShowType === "superadmin") {
            resArea = await client.query(
              getQueryFromRedirectedCard(card.cardIdRedirectedOnClickForQuery)
            );
          } else if (vm.currentShowType === "admin") {
            resArea = await client.query(
              getQueryFromRedirectedCard(card.cardIdRedirectedOnClickForQuery),
              [vm.currentShow.o_id]
            );
          } else if (vm.currentShowType === "user") {
            resArea = await client.query(
              getQueryFromRedirectedCard(card.cardIdRedirectedOnClickForQuery),
              [vm.currentShow.id]
            );
          }
        }
      }
    }
    function getQueryFromRedirectedCard(id) {
      for (let card of vm.cards[`for${vm.currentShowType}`]) {
        if (card.id === id) {
          return card.query;
        }
      }
    }

    vm.stateFlag = "0710";
    resArea = resArea.rows;
    console.log("TCL: forawait -> ###resArea", resArea);

    vm.stateFlag = "0600";
    let labels = [],
      data = [];

    resArea.map(set => {
      labels.push(set.date);
      data.push(set.count);
    });

    let result = { labels: labels, data: data };

    res.send(result);
  } catch (ex) {
    // await client.query('ROLLBACK')
    console.log(`something went wrong ${ex} at ${vm.stateFlag}`);
    vm.currentShow = null;
    // TODO: modify redirect destination
    setTimeout(function redirect() {
      res.redirect(`/dashboard/${req.params.uuid}`);
    }, 5000);
  } finally {
    await client.release();
    console.log("Client disconnected");
  }
});

router.post("/barchart", async function(req, res) {
  const client = await pool.connect();
  vm.stateFlag = "0500";
  try {
    let resArea;
    userPickedPeriodTab = req.body.periodTab;
    console.log("TCL: userPickedPeriodTab", userPickedPeriodTab);
    console.log("vm.currentShowType:", vm.currentShowType);

    vm.stateFlag = "0501";
    // let resArea = vm.tempResArea;
    let firstDayOfWeek;
    if (userPickedPeriodTab === "week") {
      firstDayOfWeek = await client.query(
        `select * from date_trunc('week', date(${vm.today}))`
      );
      firstDayOfWeek = firstDayOfWeek.rows[0].date_trunc;
    } else {
      firstDayOfWeek = "";
    }

    vm.stateFlag = "0510";
    // get response only from cards that correspond with user-picked period
    for await (let card of vm.cards[`for${vm.currentShowType}`]) {
      if (card.periodTab === userPickedPeriodTab) {
        if (card.isForLeftXaxis) {
          resArea = await client.query(card.query, [vm.currentShow.id]);
          resArea = resArea.rows;
        } else {
        }
        // break;
      }
    }

    vm.stateFlag = "0520";
    c.createBarChart(resArea, userPickedPeriodTab, firstDayOfWeek);

    vm.stateFlag = "0600";
    let labels = [],
      data = [];
    vm.area.datasets.forEach(dataset => {
      labels.push(dataset.label);
      data.push(dataset.time);
    });

    let result = { labels: labels, data: data };

    res.send(result);
  } catch (ex) {
    // await client.query('ROLLBACK')
    console.log(`something went wrong ${ex} at ${vm.stateFlag}`);
    vm.currentShow = null;
    // TODO: modify redirect destination
    setTimeout(function redirect() {
      res.redirect(`/dashboard/${req.params.uuid}`);
    }, 5000);
  } finally {
    await client.release();
    console.log("Client disconnected");
  }
});

router.get("/dashboard/usernameupdate", async function(req, res) {
  const client = await pool.connect();
  const { rows } = await client.query("select * from users");
  let index = 0;

  for await (let row of rows) {
    let rowid = row.id;
    let roworgid = row.organisation;
    client.query("UPDATE users SET name = $1 WHERE id = $2", [
      `${roworgid.toString()}_${vm.names[index]}_${rowid.toString()}`,
      rowid
    ]);
    index++;
  }
  res.redirect("/dashboard/5cce22c0-8bac-4662-b52c-cfa0504ec987");
});

module.exports = router;

// callback - checkout a client
// pool.connect((err, client, done) => {
//   if (err) throw err
//   client.query('SELECT * FROM users WHERE id = $1', [1], (err, res) => {
//     done()

//     if (err) {
//       console.log(err.stack)
//     } else {
//       console.log(res.rows[0])
//     }
//   })
// })
