const express = require("express");
const router = express.Router({ mergeParams: true });
const { Pool, Client } = require("pg");
const client_config = require("../config/client");
const m = require("../db/dataModel");
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
  try {
    console.log("================ dashboard pg starts ===============");
    // console.log("m.jwt: ", m.jwt);
    console.log("m.currentLogin: ", m.currentLogin);
    // =========== Set CURRENT LOGIN & currentLoginType start ===========
    c.setCurrentLoginType();
    // console.log("currentLoginType", m.currentLoginType);
    // =========== Set CURRENT SHOW & currentShowType start =============
    if (m.currentShow === null) {
      // when initial launch on the app
      m.currentShow = m.currentLogin; // always gets data along with user_uuid
      c.setCurrentType(m.currentShow, "currentShowType");
    } else {
      // from second launch on the app
      // check if the params.uuid is from org or user, if not the case of user, continue on to the if's block
      let { rows } = await client.query(
        `${m.userList.findAll.query} WHERE u.uuid = $1`,
        [req.params.uuid]
      );
      m.currentShow = rows[0]; // store in m only the rows
      m.currentShowType = "user";
      if (
        m.currentLoginType === "superadmin" &&
        typeof m.currentShow === "undefined"
      ) {
        // this is org's case. if there's no data found from the query above,
        // the previously picked one should be org. Then, get all the org's users data IN AN ARRAY.
        let { rows } = await client.query(
          `${m.userList.findAll.query} WHERE o.uuid = $1`,
          [req.params.uuid]
        );
        m.currentShow = rows[0];
        m.currentShowType = "admin";
      }
    }
    console.log("currentShow: ", m.currentShow);
    console.log("currentShowType: ", m.currentShowType);
    // ========== Set Orglist & UserList start =================
    let resOrgList, resUserList, resPie;
    switch (m.currentLoginType) {
      case "superadmin":
        resOrgList = await client.query(m.orgList.findAll.query);
        resUserList = await client.query(m.userList.findAllForAdmin.query, [
          m.currentShow.o_id
        ]);
        m.resOrgList = resOrgList.rows;
        m.resUserList = resUserList.rows;
        // fetch top 10 votes' rows in sharedroutes table for pie graph
        resPie = await client.query(m.pie.query);
        m.resPie = resPie.rows;
        break;
      case "admin":
        resUserList = await client.query(m.userList.findAllForAdmin.query, [
          m.currentLogin.o_id
        ]);
        m.resUserList = resUserList.rows;
        break;
      // default:
      //   break;
    }
    // ========== DASHBOARD CONTENTS - CARD - start ==========
    // fetch the number cards data that belongs to the account
    for await (let card of m.cards[`for${m.currentShowType}`]) {
      let resCard;
      let totalCyclMilliSec;
      if (m.currentShowType === "superadmin") {
        resCard = await client.query(card.query);
      } else if (m.currentShowType === "admin") {
        resCard = await client.query(card.query, [m.currentShow.o_id]);
      } else if (m.currentShowType === "user") {
        console.log("user card ----");
        totalCyclMilliSec = 0;
        resCard = await client.query(card.query, [m.currentShow.uuid]);
        console.log("resCard: ", resCard.rows);

        for (let i = 0; i < resCard.rows.length; i++) {
          if (resCard.rows[i].start_cycling != null) {
            let cyclMilliSec = c.getTimeDiff(
              resCard.rows[i].packet_generated,
              resCard.rows[i].start_cycling
            );
            totalCyclMilliSec = totalCyclMilliSec + cyclMilliSec;
          }
        }
      }
      if (card.cyclingTimeCal === true) {
        card.number = c.convertMillisec(totalCyclMilliSec);
      } else {
        card.number = resCard.rowCount;
      }
    }
    // resBar = await client.query(m.bar.find)
    // ======================== DASHBOARD CONTENTS - CARD - end ==========================
    let data = {
      currentLogin: m.currentLogin,
      currentLoginType: m.currentLoginType,
      currentShow: m.currentShow,
      currentShowType: m.currentShowType,
      cards: m.cards[`for${m.currentShowType}`]
    };
    if (typeof m.resOrgList != "undefined") data["orgs"] = m.resOrgList;
    if (typeof m.resUserList != "undefined") data["users"] = m.resUserList;
    if (typeof m.resPie != "undefined") {
      data["pie"] = m.resPie;
      data["pieData"] = m.pie;
    }
    // console.log("req.user: ", req.user);
    console.log("req.params: ", req.params);
    console.log("================ dashboard pg ends ===============");
    m.pgload++;
    res.render("dashboard", data);
  } catch (ex) {
    // await client.query('ROLLBACK')
    console.log(`something went wrong ${ex}`);
    m.currentShow = null;
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
      `${roworgid.toString()}_${m.names[index]}_${rowid.toString()}`,
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
