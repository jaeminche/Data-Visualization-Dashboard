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
  try {
    // TODO: later connect this with db.query > const query = client.query.bind(client);
    let resOrgList;
    const { rows } = await client.query(
      "SELECT uuid, id, name, language, img, active, superadmin FROM public.organisations WHERE uuid = $1",
      [req.params.uuid]
    );
    if (rows[0].superadmin === false) {
      dataModel.loginType = "org";
    } else {
      dataModel.loginType = "superadmin";
    }
    console.log(dataModel.loginType);

    for await (let card of dataModel.cards) {
      if (card.auth.includes(dataModel.loginType)) {
        const resCard = await client.query(card.query);
        card.number = resCard.rowCount;
      }
    }

    const resPie = await client.query(dataModel.pie[0].query);

    // if (req.user.id === req.params.uudi)
    if (dataModel.loginType === "org") {
      resOrgList = await client.query(dataModel.orgList.findOne.query, [
        req.params.uuid
      ]);
    } else {
      resOrgList = await client.query(dataModel.orgList.findAll.query);
    }
    // for (let i = 0; i < resOrgList.rows.length; i++) {
    //   if (resOrgList.rows[i].uuid === req.params.uuid) {
    //     break;
    //   }
    // }
    let data = {
      loginType: dataModel.loginType,
      cards: dataModel.cards,
      pie: resPie.rows,
      pieData: dataModel.pie[0],
      orgs: resOrgList.rows
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
