const express = require("express");
const router = express.Router();
const { Pool, Client } = require("pg");
const client_config = require("../config/client");

const pool = new Pool(client_config);
// const client = new Client(client_config);
pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

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
router.get("/dashboard_super/:id", async function(req, res) {
  const client = await pool.connect();
  try {
    const result = {
      cards: [
        {
          name: "NO. OF ORGANIZATIONS LOGGED IN TODAY",
          number: 0,
          color: "primary",
          fa: "sign-in-alt"
        },
        {
          name: "NO. OF ORGANIZATIONS LOGGED IN THIS MONTH",
          number: 0,
          color: "success",
          fa: "sign-in-alt"
        },
        {
          name: "TOTAL NO. OF ORGANIZATIONS",
          number: 0,
          color: "info",
          fa: "users"
        },
        {
          name: "TOTAL NO. OF USERS",
          number: 0,
          color: "warning",
          fa: "user"
        }
      ]
    };

    // queries
    const noOfOrgLogInToday = await client.query(
      "select orgid, count(orgid) from public.log_login where date(client_timestamp) = '2017-01-29' group by orgid"
    );
    const noOfOrgLogInAll = await client.query(
      "select orgid, count(orgid) from public.log_login group by orgid"
    );
    const noOfOrg = await client.query("SELECT * FROM public.organisations");
    const noOfUser = await client.query("SELECT * FROM public.users");
    const cards = [noOfOrgLogInToday, noOfOrgLogInAll, noOfOrg, noOfUser];
    result.cards.forEach((card, index) => {
      return (result.cards[index].number = cards[index].rowCount);
    });
    // result.cards.noOfOrgLogInToday = noOfOrgLogInToday.rowCount;
    // result.cards.noOfOrgLogInAll = noOfOrgLogInAll.rowCount;
    // result.cards.noOfOrg = noOfOrg.rowCount;
    // result.cards.noOfUser = noOfUser.rowCount;
    console.log("result: ", result.cards);
    res.render("dashboard_super", { cards: result.cards });
  } catch (ex) {
    console.log(`something went wrong ${ex}`);
  } finally {
    await client.release();
    console.log("Client disconnected");
  }
});

// router.get("/dashboard_org/:id", async function(req, res) {
//   try {
//     //   const result = {
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
//     res.render("dashboard_org", { retrievedData: noOfOrgLogInToday.rowCount });
//   } catch (ex) {
//     console.log(`something went wrong ${ex}`);
//   } finally {
//     await client.end();
//     console.log("Client disconnected");
//   }
// });

module.exports = router;
