const express = require("express");
const router = express.Router();
const { Pool, Client } = require("pg");
const client_config = require("../config/client");

const client = new Client(client_config);

router.get("/", async function(req, res) {
  try {
    await client.connect();
    console.log("Connected successfully");
    const results = await client.query("select * from sharedroutes");
    console.table(results.rows);
    let userDistance = 0;
    results.rows.forEach(function(dataset) {
      if (dataset.user_id === 1) {
        userDistance += dataset.distance;
      }
    });
    res.render("index", { retrievedData: userDistance });
    // res.render("index", { retrievedData: results.rows });
  } catch (ex) {
    console.log(`something went wrong ${ex}`);
  } finally {
    await client.end();
    console.log("Client disconnected");
  }
});

module.exports = router;
