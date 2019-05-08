const express = require("express"),
  path = require("path"),
  bodyParser = require("body-parser"),
  { Pool, Client } = require("pg"),
  client_config = require("./config/client"),
  app = express();

const client = new Client(client_config);
// client = new Client();

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
// app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function(req, res) {
  client
    .connect()
    .then(() => console.log("Connected successfully"))
    .then(() => client.query("select * from sharedroutes"))
    // .then(results => console.log(results.rows))
    .then(results => res.render("index", { retrievedData: results.rows }))
    .catch(e => console.log(e))
    .finally(() => client.end());
});

app.listen(3000, function() {
  console.log("server started on port 3000");
});
