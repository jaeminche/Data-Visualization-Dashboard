const express = require("express");
const router = express.Router();
// const { Pool, Client } = require("pg");

// const client = new Client({
//   user: "postgres",
//   password: "010207",
//   host: "localhost",
//   port: 5432,
//   database: "activ84health"
// });

// router.get("/", function(req, res) {
//   client
//     .connect()
//     .then(() => console.log("Connected successfully"))
//     .then(() => client.query("select * from sharedroutes"))
//     // .then(results => console.log(results.rows))
//     .then(results => res.render("index", { retrievedData: results.rows }))
//     .catch(e => console.log(e))
//     .finally(() => client.end());
// });
