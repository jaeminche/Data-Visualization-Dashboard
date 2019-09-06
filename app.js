const express = require("express"),
  path = require("path"),
  bodyParser = require("body-parser"),
  { Pool, Client } = require("pg"),
  client_config = require("./config/client"),
  app = express();

// requiring routes
const indexRoutes = require("./routes/index");
const dashboardRoutes = require("./routes/dashboard");
const updatechartRoutes = require("./routes/updatechart");
const sharedroutesRoutes = require("./routes/sharedroutes");

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// app.use(function(req, res) {
//   // res.setHeader("Content-Type", "text/plain");
//   res.write("you posted:\n");
//   res.end(JSON.stringify(req.body, null, 2));
// });

app.use("/", indexRoutes);
app.use("/", dashboardRoutes);
app.use("/", updatechartRoutes);
app.use("/", sharedroutesRoutes);

app.listen(3000, function() {
  console.log("server started on port 3000");
});
