const express = require("express");
const router = express.Router({ mergeParams: true });
const { Pool, Client } = require("pg");
const client_config = require("../config/client");
const dataModel = require("../db/dataModel");
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
    console.log("dataModel.jwt: ", dataModel.jwt);
    console.log("dataModel.currentLogin: ", dataModel.currentLogin);
    // =========================== Get CURRENT LOGIN & currentLoginType start =========================
    let currentLogin = dataModel.currentLogin;
    getCurrentType(currentLogin, "currentLoginType");
    console.log("currentLoginType", dataModel.currentLoginType);
    // =========================== Get CURRENT LOGIN & currentLoginType end ===========================
    // =========================== Get CURRENT SHOW & currentShowType start ===========================
    let currentShow;
    if (dataModel.currentShow === null) {
      // when initial launch on the app
      dataModel.currentShow = currentLogin; // always gets data along with user_uuid
      getCurrentType(dataModel.currentShow, "currentShowType");
    } else {
      // from second launch on the app
      // check if the params.uuid is from org or user, if not user case, continue on to if block
      let { rows } = await client.query(
        `${dataModel.userList.findAll.query} WHERE u.uuid = $1`,
        [req.params.uuid]
      );
      dataModel.currentShow = rows[0]; // store in dataModel only the rows
      dataModel.currentShowType = "user";
      if (
        dataModel.currentLoginType === "superadmin" &&
        typeof dataModel.currentShow === "undefined"
      ) {
        // this is org's case. if there's no data found from the query above,
        // the previously picked one should be org. Then, get all the org's users data IN AN ARRAY.
        let { rows } = await client.query(
          `${dataModel.userList.findAll.query} WHERE o.uuid = $1`,
          [req.params.uuid]
        );
        dataModel.currentShow = rows[0];
        dataModel.currentShowType = "admin";
      }
    }
    currentShow = dataModel.currentShow; // get my currentShow FOR INDEX
    console.log("currentShow: ", currentShow);
    console.log("currentShowType: ", dataModel.currentShowType);
    // ========================== Get CURRENT SHOW & currentShowType end ===========================
    // ========================== Get Orglist & UserList start =============================
    let resOrgList, resUserList;
    let resPie;
    if (dataModel.currentLoginType === "superadmin") {
      resOrgList = await client.query(dataModel.orgList.findAll.query);
      resUserList = await client.query(
        dataModel.userList.findAllForAdmin.query,
        [currentShow.o_id]
      );
      // fetch top 10 votes' rows in sharedroutes table for pie graph
      resPie = await client.query(dataModel.pie.query);
    } else if (dataModel.currentLoginType === "admin") {
      resUserList = await client.query(
        dataModel.userList.findAllForAdmin.query,
        [currentLogin.o_id]
      );
    }
    // ========================== Get Orglist & UserList end =============================
    // ========================== DASHBOARD CONTENTS start ===============================
    // fetch the number cards data that belongs to the account
    for await (let card of dataModel.cards[`for${dataModel.currentShowType}`]) {
      let resCard;
      if (dataModel.currentShowType === "superadmin") {
        resCard = await client.query(card.query);
      } else if (dataModel.currentShowType === "admin") {
        resCard = await client.query(card.query, [currentShow.o_id]);
      } else if (dataModel.currentShowType === "user") {
        console.log("user card ----");
        resCard = await client.query(card.query, [currentShow.uuid]);
      }
      card.number = resCard.rowCount;
    }
    // resBar = await client.query(dataModel.bar.find)
    // ========================== DASHBOARD CONTENTS end =============================
    let data = {
      currentLogin: currentLogin,
      currentLoginType: dataModel.currentLoginType,
      cards: dataModel.cards[`for${dataModel.currentShowType}`]
    };
    if (typeof resOrgList != "undefined") data["orgs"] = resOrgList.rows;
    if (typeof resUserList != "undefined") data["users"] = resUserList.rows;
    if (typeof resPie != "undefined") {
      data["pie"] = resPie.rows;
      data["pieData"] = dataModel.pie;
    }
    // console.log("req.user: ", req.user);
    console.log("req.params: ", req.params);
    console.log("================ dashboard pg ends ===============");
    res.render("dashboard", data);
  } catch (ex) {
    // await client.query('ROLLBACK')
    console.log(`something went wrong ${ex}`);
  } finally {
    await client.release();
    console.log("Client disconnected");
  }
});

function getCurrentType(data, key) {
  if (data.superadmin === true && data.admin === true) {
    // TODO: prompt and get input by asking which one of superadmin and user the user wants
    dataModel[key] = "superadmin";
  } else if (data.superadmin === false && data.admin === true) {
    // TODO: prompt and get input by asking which one of org and user the user wants
    dataModel[key] = "admin";
  } else {
    dataModel[key] = "user";
  }
}

router.get("/dashboard/:uuid/:user_uuid", async function(req, res) {
  const client = await pool.connect();
  try {
    let resOrgList;
    // fetch the account's organisation data, and check if it's superadmin.
    // TODO: later connect this with db.query > const query = client.query.bind(client);
    // TODO: this, yet, is only for organization logins including superadmin and orgs, but not users' logins.
    const thisOrg = await client.query(
      "SELECT uuid, id, name, language, img, active, superadmin FROM public.organisations WHERE uuid = $1",
      [req.params.uuid]
    );
    if (thisOrg.rows[0].superadmin === false) {
      dataModel.currentLoginType = "org";
    } else {
      dataModel.currentLoginType = "superadmin";
    }
    console.log(dataModel.currentLoginType);

    // fetch the number cards data that belongs to the account
    for await (let card of dataModel.cards[
      `for${dataModel.currentLoginType}`
    ]) {
      let resCard;
      dataModel.currentLoginType === "superadmin"
        ? (resCard = await client.query(card.query))
        : (resCard = await client.query(card.query, [thisOrg.rows[0].id]));
      card.number = resCard.rowCount;
    }

    // fetch top 10 votes' rows in sharedroutes table for pie graph
    const resPie = await client.query(dataModel.pie[0].query);

    // fetch organisations' list in accordance with the account's currentLogintype
    // TODO: make this session-able and change it to if (this session's id != superadmin && ~~~)
    if (dataModel.currentLoginType === "org") {
      resOrgList = await client.query(dataModel.orgList.findOne.query, [
        req.params.uuid
      ]);
    } else {
      resOrgList = await client.query(dataModel.orgList.findAll.query);
    }
    // fetch users' list that belongs only to the specific(uuid) org account
    resUserList = await client.query(dataModel.userList.findAllForOrg.query, [
      req.params.uuid
    ]);
    console.log("resUserList", resUserList);

    let data = {
      loginType: dataModel.currentLoginType,
      cards: dataModel.cards[`for${dataModel.currentLoginType}`],
      pie: resPie.rows,
      pieData: dataModel.pie[0],
      orgs: resOrgList.rows,
      users: resUserList.rows
    };
    console.log("req.user: ", req.user);
    console.log("req.params: ", req.params);
    res.render("dashboard", data);
  } catch (ex) {
    // await client.query('ROLLBACK')
    console.log(`something went wrong ${ex}`);
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
      `${roworgid.toString()}_${dataModel.names[index]}_${rowid.toString()}`,
      rowid
    ]);
    index++;
  }
  res.redirect("/dashboard/5cce22c0-8bac-4662-b52c-cfa0504ec987");
});

// for (let i = 0; i < resOrgList.rows.length; i++) {
//   if (resOrgList.rows[i].uuid === req.params.uuid) {
//     break;
//   }
// }

// router.get("/dashboard_org/:uuid", async function(req, res) {
//   const client = await pool.connect();
//   try {
//     state = "orgAdmin";
//     for await (let card of dataModel.cards) {
//       // queries
//       if (card.auth === "orgAdmin") {
//         let resCard = await client.query(card.query);
//         card.number = resCard.rowCount;
//       }
//     }

//     const resOrgList = await client.query(dataModel.listOrg);

//     // const resOrg = await client.query("");
//     // let orgName;
//     for (let i = 0; i < resOrgList.rows.length; i++) {
//       if (resOrgList.rows[i].uuid === req.params.uuid) {
//         break;
//       }
//     }
//     res.render("dashboard_org", {
//       state: state,
//       cards: dataModel.cards,
//       orgs: resOrgList.rows
//       // org: resOrg.rows
//     });
//   } catch (ex) {
//     console.log(`something went wrong ${ex}`);
//   } finally {
//     await client.release();
//     console.log("Client disconnected");
//   }
// });

// router.get("/dashboard_org/:id", async function(req, res) {
//   try {
//     //   const dataModel = {
//     //     "version": "0.2.0",
//     //     "array": [
//     //         {
//     //             "type": "node",
//     //             "request": "launch",
//     //             "name": "Launch Program",
//     //             "program": "${workspaceFolder}\\app.js"
//     //         }
//     //     ]
//     // };
//     await client.connect();
//     console.log("Connected successfully");
//     const noOfOrgLogInToday = await client.query(
//       "select orgid, count(orgid) from public.log_login where date(client_timestamp) = '2017-01-28' group by orgid"
//     );
//     console.table(noOfOrgLogInToday.rows);
//     res.render("dashboard_org", { dataModelData: noOfOrgLogInToday.rowCount });
//   } catch (ex) {
//     console.log(`something went wrong ${ex}`);
//   } finally {
//     await client.end();
//     console.log("Client disconnected");
//   }
// });

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
