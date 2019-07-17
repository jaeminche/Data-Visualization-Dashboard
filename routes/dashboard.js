const express = require("express");
const router = express.Router({ mergeParams: true });
const bodyParser = require("body-parser");
const { Pool, Client } = require("pg");
const client_config = require("../config/client");
const basic_config = require("../config/basic_config");
const Chart = require("chart.js");
const vm = require("../db/viewmodel");
const c = require("../db/control");
const { UpdateChart } = require("../db/updateChart");
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
    c.resetState("card");
    c.resetState("chart");
    // vm.today = "'2017-01-26'";
    vm.today = "'2017-06-08'";
    vm.stateFlag = "0001";
    console.log("================ dashboard pg starts ===============");
    // console.log("m.jwt: ", m.jwt);
    console.log("m.currentLogin: ", vm.currentLogin);
    // *========================================
    // *| Set current LOGIN & currentLoginType |
    // *========================================
    vm.stateFlag = "0010";
    c.setCurrentType(vm.currentLogin, "currentLoginType");
    // console.log("currentLoginType", m.currentLoginType);
    // *========================================
    // *| Set current SHOW & currentShowType |
    // *========================================
    if (vm.currentShow === null) {
      // when initial launch on the app
      vm.stateFlag = "0020";
      vm.currentShow = vm.currentLogin; // always gets data along with user_uuid
      c.setCurrentType(vm.currentShow, "currentShowType");
    } else {
      // from second launch on the app
      // check if the params.uuid is from org or user, if not the case of user, try fetching res with params.o.uuid in the next if-block.
      vm.stateFlag = "0030";
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
    // *=======================================
    // * Set ORGLIST & USERLIST start |
    // *=======================================
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
        /*
        // Only when showType, fetch top 10 votes' rows in sharedroutes table for pie graph
        if (vm.currentShowType === "superadmin") {
          vm.stateFlag = "0115";
          resPie = await client.query(vm.pie.query);
          vm.resPie = resPie.rows;
        }
        */
        break;
      case "admin":
        vm.stateFlag = "0120";
        resUserList = await client.query(vm.userList.findAllForAdmin.query, [
          vm.currentLogin.o_id
        ]);
        vm.resUserList = resUserList.rows;
        break;
    }

    // *=======================================
    // *| BAR - start |
    // *=======================================
    let usersDailyAvgThisMonth;
    if (typeof vm.resUserList != "undefined") {
      vm.stateFlag = "0150";
      let resBar;
      let sumAllUsers = 0;
      for await (let user of vm.resUserList) {
        // get accumulated data for one user for the last 30 days
        resBar = await client.query(vm.bar.findOne.query, [user.id]);
        timeCycledInMilSec = c.getTimeCycledInMilSec(resBar.rows);
        // *===================================
        // *| CARD(w/out query)
        // *| USERS' DAILY AVERAGE THIS MONTH |
        // *===================================
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

    // *=======================================
    // *| TABLE - start |
    // *=======================================
    // let orgsDailyAvgThisMonth;
    if (typeof vm.resOrgList != "undefined") {
      vm.stateFlag = "0155";
      let resTableCol1, resTableCol2, average;
      // let sumAllOrgs = 0;
      console.log("=====vm.resOrgList: ", vm.resOrgList);
      for await (let org of vm.resOrgList) {
        // get accumulated data for one org for the last 30 days
        resTableCol1 = await client.query(vm.table.col1.query, [org.id]);
        resTableCol2 = await client.query(vm.table.col2.query, [org.id]);
        vm.stateFlag = "0156";

        timeCycledInMilSec = c.getTimeCycledInMilSec(resTableCol2.rows);
        // *===================================
        // *| CARD(w/out query)
        // *| org' DAILY AVERAGE THIS MONTH |
        // *===================================
        // org.dpTime = c.convMilSecToFin(timeCycledInMilSec);
        org.days = resTableCol1.rowCount;
        org.dpTime = c.convToMin(timeCycledInMilSec);
        average = org.dpTime / org.days;
        org.average = average > 0 ? average : "0";
        // org.dpMonthlyAvgTCycled = c.convMilSecToFin(timeCycledInMilSec / 30);
        // sumAllOrgs = sumAllOrgs + timeCycledInMilSec;
      }
      vm.stateFlag = "0160";
      // console.log("sumAllOrgs: ", sumAllOrgs);
      // orgsDailyAvgThisMonth = sumAllOrgs / vm.resOrgList.length / 30;
      // vm.average.admin_monthly.o_id = vm.currentShow.o_id;
      // vm.average.admin_monthly.orgsDailyAvgThisMonth = c.convMilSecToFin(
      // orgsDailyAvgThisMonth
      // );
      vm.stateFlag = "0170";
      // console.log(vm.average.admin_monthly.orgsDailyAvgThisMonth);
    }

    // *=========================================
    // *| CARD(only w/ query)
    // *| defines card.number
    // *=========================================
    vm.stateFlag = "0200";
    let forChart = false;
    // !updates directly the cards' numbers in this case
    await c.findCardsAndGetResOrUpdateCardsNo(client, forChart);

    // *========================================
    // *| DEFAULT CHART, LOOP OVER CARDS |
    // *========================================
    vm.stateFlag = "0201";
    forChart = true;
    let foundCardsAndRes = await c.findCardsAndGetResOrUpdateCardsNo(
      client,
      forChart
    );
    // foundCardsAndRes = { cardObjs: [{}, {}], resRowArrs: [[], []]}
    vm.stateFlag = "0215";
    let period = foundCardsAndRes.cardObjs[0].period; // you need only one period data because there's one xAxis
    // TODO: check if firstDay must be passed in as param here.
    let firstDay = await c.getFirstDayOfWeek(client, period);
    console.log("foundCardsAndRes.resRowArrs: ", foundCardsAndRes.resRowArrs);
    await c.updateVM_chart(
      "default",
      foundCardsAndRes.cardObjs, //[{}, {}]
      foundCardsAndRes.resRowArrs, //[[], []]
      period, //""
      firstDay
    );
    // vm.cards.areForChart = true;
    // for await (let card of vm.cards[`for${vm.currentShowType}`]) {
    //   let resChart, period, yAxisTickMark;
    //   if (card.isDefaultForChart) {
    //     period = card.period;
    //     yAxisTickMark = card.yAxisTickMark;
    //     if (vm.currentShowType === "superadmin") {
    //       resChart = await client.query(card.query);
    //     } else if (vm.currentShowType === "admin") {
    //       resCard = await client.query(card.query, [vm.currentShow.o_id]);
    //     } else if (vm.currentShowType === "user") {
    //       resChart = await client.query(card.query, [vm.currentShow.id]);
    //     }

    // await c.createBarChart(
    //   "card",
    //   resChart.rows,
    //   period,
    //   yAxisTickMark,
    //   c.getFirstDayOfWeek(period)
    // );
    //     vm.stateFlag = "0308";
    //     console.log(vm.stateFlag);
    //     break; // !MUST GET ONLY ONE default (OR/OTHERWISE, the FIRST) set of data in the vm.cards object because it's default.
    //     // TODO: idRedirectedForChartQuery

    //     // tempChartDataForDefaultCard = c.checkCardForDefaultChartAndStoreData(
    //     //   card,
    //     //   resChart
    //     // );
    //     // if (tempChartDataForDefaultCard.exists) {
    //     //   chartDataForDefaultCard = tempChartDataForDefaultCard;
    //     //   if (forChart === true) {
    //     //     chartDataForDefaultCard.period = period;
    //     //     chartDataForDefaultCard.yAxisTickMark = yAxisTickMark;
    //     //   }
    //     // }
    //     // console.log("chartDataForDefaultCard: ", chartDataForDefaultCard);
    //   }
    // }

    vm.stateFlag = "0301";
    console.log(vm.stateFlag);
    // c.createBarChart(
    //   chartDataForDefaultCard.reqFrom,
    //   chartDataForDefaultCard.resChart,
    //   chartDataForDefaultCard.period,
    //   chartDataForDefaultCard.yAxisTickMark,
    //   c.getFirstDayOfWeek(chartDataForDefaultCard.period)
    // );
    // *=======================================
    // *| AREA-CHART - start |
    // *=======================================

    // console.log("resChart: ", resChart);

    // if (
    //   typeof resChart != "undefined" &&
    //   typeof resChart[0].packet_generated != "undefined"
    // ) {
    //   vm.stateFlag = "0300";
    //   c.createBarChart(resChart, calendarType);
    // }
    console.log("vm.state: ", vm.state);
    // resBar = await client.query(m.bar.find)
    // *=======================================
    // *| PASS IN DATA
    // *=======================================
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
    typeof basic_config != "undefined"
      ? (data["basic_config"] = basic_config)
      : (data["basic_config"] = { product_name: "Company" });
    if (typeof vm.resPie != "undefined") {
      data["pie"] = vm.resPie;
      data["pieData"] = vm.pie;
    }
    // console.log("req.user: ", req.user);
    // console.log("req.params: ", req.params);
    // console.log("================ dashboard pg ends ===============");
    vm.pgload++;
    vm.stateFlag = "0320";
    console.log(
      "===================================================data.orgs:",
      data.orgs
    );

    res.render("dashboard", data);
  } catch (ex) {
    // await client.query('ROLLBACK')
    console.log(`something went wrong ${ex} at ${vm.stateFlag} `);
    vm.currentShow = null;
    setTimeout(function redirect() {
      res.redirect(`/dashboard/${req.params.uuid}`);
    }, 5000);
  } finally {
    await client.release();
    console.log("Client disconnected");
  }
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
