const express = require("express"),
  path = require("path"),
  bodyParser = require("body-parser"),
  { Pool, Client } = require("pg"),
  client_config = require("./config/client"),
  app = express();

// requiring routes
const sharedRoutes = require("./routes/sharedroutes");

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
// app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/", sharedRoutes);

app.listen(3000, function() {
  console.log("server started on port 3000");
});
