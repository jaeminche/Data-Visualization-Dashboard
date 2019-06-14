const express = require("express");
const router = express.Router({ mergeParams: true });
// const passport = require("passport");
// const User = require("../models/user");
const { Pool, Client } = require("pg");
const client_config = require("../config/client");
const m = require("../db/dataModel");
const c = require("../db/control");
const v = require("../db/view");
const db = require("../db/index");

const pool = new Pool(client_config);
// const client = new Client(client_config);

pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

// root route
router.get("/", function(req, res) {
  res.redirect("/loggedin");
});

// loggedin route
// when deployment,
router.get("/logged_in_as/:id", async function(req, res) {
  const client = await pool.connect();
  let resLoggedInUser;
  try {
    c.init_login_show();
    resLoggedInUser = await client.query(
      "SELECT u.name, u.id, u.uuid as uuid, u.admin, o.name as o_name, u.organisation as o_id, o.uuid as o_uuid, o.superadmin FROM public.users u LEFT JOIN organisations o ON organisation = o.id WHERE u.id =  $1",
      [req.params.id]
    );
    if (resLoggedInUser.rowCount === 0)
      throw `Could not find user id ${
        req.params.id
      } in the database. Try another number!`;
  } catch (ex) {
    // await client.query('ROLLBACK')
    console.log(`something went wrong : ${ex}`);
  } finally {
    await client.release();
    console.log("Client disconnected");
  }

  let uuid = resLoggedInUser.rows[0].uuid;
  let o_id = resLoggedInUser.rows[0].o_id;
  let admin = resLoggedInUser.rows[0].admin;
  m.currentLogin = resLoggedInUser.rows[0];
  const date = new Date();
  m.jwt.u = JSON.parse(req.params.id);
  m.jwt.o = o_id;
  m.jwt.a = admin;
  m.jwt.d = date.toUTCString();
  let token = m.jwt;
  console.log(token);
  console.log("currentLogin: ", resLoggedInUser.rows[0]);
  console.log("================logged page ends ===============");

  res.render("headerForLoggedinTBD", { token: token, uuid: uuid });
});

router.get("/dashboard/mydashboard/:uuid", async function(req, res) {
  // init only the currentShow, keeping the current login
  m.currentShow = null;
  m.pgload = 1;
  res.redirect(`/dashboard/${req.params.uuid}`);
});

// =========================
// AUTH ROUTES
// =========================

// handling login logic
// router.post("/login", passport.authenticate("local"), function(req, res) {
//   // If this function gets called, authentication was successful.
//   // `req.user` contains the authenticated user.
//   if (req.user === superadmin) {
//     res.redirect("/dashboard_super/" + req.user.uuid);
//   } else if (req.user === org) {
//     res.redirect("/dashboard_org/" + req.user.uuid);
//   } else {
//     res.redirect("/dashboard_user/" + req.user.uuid);
//   }
// });

// logout route
router.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/login");
});

// middleware
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

module.exports = router;
