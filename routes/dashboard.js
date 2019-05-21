const express = require("express");
const router = express.Router();
const { Pool, Client } = require("pg");
const client_config = require("../config/client");
const dataModel = require("../public/js/dataModel");

const pool = new Pool(client_config);
// const client = new Client(client_config);
pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

router.get("/dashboard_super/:id", async function(req, res) {
  const client = await pool.connect();
  try {
    for await (let card of dataModel.cards) {
      // queries
      let resCard = await client.query(card.query);
      card.number = resCard.rowCount;
    }

    const resPie = await client.query(dataModel.pieQuery);

    res.render("dashboard_super", {
      cards: dataModel.cards,
      pie: resPie.rows,
      pieColors: dataModel.pieColors
    });
  } catch (ex) {
    console.log(`something went wrong ${ex}`);
  } finally {
    await client.release();
    console.log("Client disconnected");
  }
});

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
