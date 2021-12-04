//Author- Najeam Mehanmal 7457195
// import dependencies
const express = require("express");
const path = require("path");
const { check, validationResult } = require("express-validator");
// const { RSA_PSS_SALTLEN_DIGEST } = require('constants')

let myApp = express();
myApp.use(express.urlencoded({ extended: true }));

//set path to the public folders and views folder

myApp.set("views", path.join(__dirname, "views"));
myApp.use(express.static(__dirname + "/public"));

myApp.set("view engine", "ejs");

// set up database connection

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/betablog", {
  // path of database and libraries want to use for our database
  useNewUrlParser: true,
  useUnifiedTopology: true
}); // Path of Database

//Setup the model for the user Collection - admin

const Admin = mongoose.model("Admin", {
  username: String,
  password: String
});

//Get Express Session

const session = require("express-session");

// Setup Session
myApp.use(
  session({
    secret: "superrandomsecret",
    resave: false, //resave means that session will be refreshed, session not resumed again
    saveUninitialized: true
  })
);

// home page root directory
myApp.get("/", function(req, res) {
  res.render("home"); //no need to add.ejs extension to the command.
});

// beta blogs

myApp.get("/betablog", function(req, res) {
  res.render("betablog"); //no need to add.ejs extension to the command.
});

// Login page - Get
myApp.get("/login", function(req, res) {
  res.render("login");
});

// Login page - Post

myApp.post("/login", function(req, res) {
  let userInput = req.body.username;
  let passwordInput = req.body.password;

  //console.log(userInput);
  //console.log(passwordInput);

  Admin.findOne({ username: userInput, password: passwordInput }).exec(function(
    err,
    admin
  ) {
    //log any errors
    console.log("Error: " + err);
    console.log("Admin: " + admin);
    if (admin) {
      //store the username in session and set logged as true
      req.session.username = admin.username;
      req.session.userLoggedIn = true;

      //redirect user to the dashboard - blog page
      res.redirect("adminPanel");
    } else {
      //display error if the user info is incorrect,
      res.render("login", { error: "Sorry Login Failed, please try again" });
    }
  });
});





//open up the ports, http protocol

// Confirmation output domain name displayed in terminal screen
myApp.listen(8080);
console.log("Application started ... listening on port 8080!"); // Open URL in Browser: http:localhost:8080
