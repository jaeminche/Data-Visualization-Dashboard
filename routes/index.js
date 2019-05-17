const express = require("express");
const router = express.Router();
// const passport = require("passport");
// const User = require("../models/user");

// root route
router.get("/", function(req, res) {
  res.redirect("/login");
});

// login route
router.get("/login", function(req, res) {
  res.render("login");
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
