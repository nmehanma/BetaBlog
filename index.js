//Author- Najeam Mehanmal 7457195
// import dependencies
const express = require("express");
const path = require("path");
const { check, validationResult } = require("express-validator");
// const { RSA_PSS_SALTLEN_DIGEST } = require('constants')
const session = require("express-session");
const fileUpload = require("express-fileupload");

let myApp = express();
myApp.use(express.urlencoded({ extended: true }));

//set path to the public folders and views folder

myApp.set("views", path.join(__dirname, "views"));
myApp.use(express.static(__dirname + "/public"));

myApp.set("view engine", "ejs");


// ---------------

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

//Setup the model for the pagesposts Collection - admin

const PagesPosts = mongoose.model("PagesPosts", {
  pagePostTitle: String,
  slugOfPage: String,
  imageName: String
});

// -----------------------

//Get Express Session

// Setup Session
myApp.use(
  session({
    secret: "superrandomsecret",
    resave: false, //resave means that session will be refreshed, session not resumed again
    saveUninitialized: true
  })
);

// ----------------- Directories

// home page root directory
// myApp.get("/", function(req, res) {
//   PagesPosts.find({}).exec((err, pagesPosts) => {
//     res.render("home", { pagesPosts: pagesPosts });
//   });
// });

// beta blogs

myApp.get("/adminpanel", function(req, res) {
  PagesPosts.find({}).exec((err, pagesPosts) => {
    res.render("adminpanel", { pagesPosts: pagesPosts });
  });
});

//Support for file handling


myApp.use(fileUpload());

// Post request adminpanel

myApp.post("/adminpanel", function(req, res) {
  console.log(req.files);
  let imageName = req.files.myImage.name;
  let image = req.files.myImage;
  let imagePath = "public/contact_images/" + imageName;
  image.mv(imagePath, function(err) {
    console.log(err);
  });
  let pagePostTitle = req.body.newPagePostTitle;
  let slugOfPage = req.body.newSlugPageTitle;

  console.log(pagePostTitle);
  console.log(slugOfPage);
  console.log(image);

  let pageData = {
    pagePostTitle,
    slugOfPage,
    imageName
  };

  let myadminPanel = new PagesPosts(pageData);
  myadminPanel.save().then(function() {
    console.log("New pagepost created!");
  });

  PagesPosts.find({}).exec((err, pagesPosts) => {
    res.render("adminPanel", { pagesPosts: pagesPosts });
  });
});

// Get request for each link that gets uploaded in the dropdown

// Login page - Get
myApp.get("/login", function(req, res) {
  PagesPosts.find({}).exec((err, pagesPosts) => {
    res.render("login", { pagesPosts: pagesPosts });
  });
});

// Login page - Post

myApp.post("/login", function(req, res) {
  let userInput = req.body.username;
  let passwordInput = req.body.password;

  PagesPosts.find({}).exec((err, pagesPosts) => {
    { pagesPosts: pagesPosts };
  });

  // console.log(userInput);
  // console.log(passwordInput);

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
      res.render("login", { error: "Sorry Login Failed, please try again"});
    }
  });
});

myApp.get("/:slugOfPage", (req, res) => {
  PagesPosts.findOne({ slugOfPage: req.params.slugOfPage }).exec(
    (err, pagePost) => {
      console.log(pagePost);
      res.render("home", { pagePost: pagePost });
    }
  );
});


//open up the ports, http protocol

// Confirmation output domain name displayed in terminal screen
myApp.listen(8080);
console.log("Application started ... listening on port 8080!"); // Open URL in Browser: http:localhost:8080
