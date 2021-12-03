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

//Setup the model for the coolection - admin

const Admin = mongoose.model('Admin', {
  username: String,
  password: String
});


//Get Express Session

const session = require('express-session')

// Setup Session
myApp.use(session({
  secret: 'superrandomsecret',
  resave: false,  //resave means that session will be refreshed, session not resumed again
  saveUninitialized : true 
}));


// home page root directory
myApp.get("/", function(req, res) {
  res.render("form"); //no need to add.ejs extension to the command.
});


//open up the ports, http protocol

// Confirmation output domain name displayed in terminal screen
myApp.listen(8080);
console.log("Application started ... listening on port 8080!"); // Open URL in Browser: http:localhost:8080