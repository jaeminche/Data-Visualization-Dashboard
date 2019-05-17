const express = require("express"),
  path = require("path"),
  bodyParser = require("body-parser"),
  { Pool, Client } = require("pg"),
  client_config = require("./config/client"),
  app = express();

// requiring routes
const indexRoutes = require("./routes/index");
const dashboardRoutes = require("./routes/dashboard");
const sharedroutesRoutes = require("./routes/sharedroutes");
// const log_login = require("./routes/log_login"),
//   log_startcycling = require("./routes/log_startcycling"),
//   log_cycling = require("./routes/log_cycling"),
//   log_cycling_packets = require("./routes/log_cycling_packets"),
//   log_events = require("./routes/log_events"),
//   langchange = require("./routes/langchange"),
//   organisations = require("./routes/organisations"),
//   users = require("./routes/users"),
//   startlocations = require("./routes/startlocations"),
//   sharedroutes_polularity_k = require("./routes/sharedroutes_polularity_k"),
//   routes = require("./routes/routes"),
//   osm_edges = require("./routes/osm_edges"),
//   osm_nodes = require("./routes/osm_nodes"),
//   rawrmp = require("./routes/rawrmp");

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
// app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/", indexRoutes);
app.use("/", sharedroutesRoutes);
app.use("/", dashboardRoutes);
// app.use("/", log_login);
// app.use("/", log_startcycling);
// app.use("/", log_cycling);
// app.use("/", log_cycling_packets);
// app.use("/", log_events);
// app.use("/", langchange);
// app.use("/", organisations);
// app.use("/", users);
// app.use("/", startlocations);
// app.use("/", sharedroutes_polularity_k);
// app.use("/", routes);
// app.use("/", osm_edges);
// app.use("/", osm_nodes);
// app.use("/", rawrmp);

app.listen(3000, function() {
  console.log("server started on port 3000");
});
