//Author- Najeam Mehanmal 7457195
// import dependencies
const express = require("express");
const path = require("path");
const { check, validationResult } = require("express-validator");
const { RSA_PSS_SALTLEN_DIGEST } = require("constants");
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

//Setup the DATABASE MODEL  for the user Collection - Admin user

const Admin = mongoose.model("Admin", {
  username: String,
  password: String
});

//Setup the DATABASE MODEL for the PagesPosts Collection - Admin user

const PagesPosts = mongoose.model("PagesPosts", {
  pagePostTitle: String,
  slugOfPage: String,
  imageName: String,
  textInput: String
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

// ----------------- Directories ---------------


// beta blogs

myApp.get("/adminpanel", function(req, res) {
  if (req.session.userLoggedIn) {
    PagesPosts.find({}).exec((err, pagesPosts) => {
      // console.log(admin);
      res.render("adminpanel", { pagesPosts: pagesPosts, admin: "admin" });
    });
  } else {
    res.redirect("/login"); // need to send pagesPosts
  }
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
  let textInput = req.body.newTextInput;

  console.log(pagePostTitle);
  console.log(slugOfPage);
  console.log(textInput);
  console.log(image);

  let pageData = {
    pagePostTitle,
    slugOfPage,
    textInput,
    imageName
  };

  let myadminPanel = new PagesPosts(pageData);
  myadminPanel.save().then(function() {
    console.log("New pagepost created!");
  });

  PagesPosts.find({}).exec((err, pagesPosts) => {
    res.render("newsuccess", {
      pageData,
      message: "Successful Add! Return to Admin Panel",
      admin: "admin",
      pagesPosts
    });
  });
});

// Get request for each link that gets uploaded in the dropdown

// Login page - Get
myApp.get("/login", function(req, res) {
  PagesPosts.find({}).exec((err, pagesPosts) => {
    // console.log(pagesPosts)
    res.render("login", { pagesPosts: pagesPosts, admin: "" }); // need to send pagesPosts as blank
  });
});

// Login page - Post
myApp.post("/login", function(req, res) {
  let userInput = req.body.username;
  let passwordInput = req.body.password;

  // console.log(userInput);
  // console.log(passwordInput);

  PagesPosts.find({}).exec((err, pagesPosts) => {
    // console.log(pagesPosts)
    Admin.findOne({ username: userInput, password: passwordInput }).exec(
      function(err, admin) {
        // console.log(admin);
        //log any errors
        console.log("Error: " + err);
        console.log("Admin: " + admin);
        if (admin) {
          //store the username in session and set logged as true
          req.session.username = admin.username;
          req.session.userLoggedIn = true;

          //redirect user to the dashboard - blog page
          res.redirect("/adminPanel");
        } else {
          //display error if the user info is incorrect,

          res.render("login", {
            admin: "",
            pagesPosts: pagesPosts,
            error: "Sorry Login Failed, please try again"
          });
        }
      }
    );
  });
});

//Logout page - Get

myApp.get("/logout", (req, res) => {
  //End username session an set logged in false
  req.session.username = "";
  req.session.userLoggedIn = false;
  PagesPosts.find({}).exec((err, pagesPosts) => {
    // console.log(pagesPosts)
    let admin = "";
    res.render("login", {
      pagesPosts: pagesPosts,
      error: "You have succesfully logged out",
      admin: ""
    });
  });
});

myApp.get("/:slugOfPage", (req, res) => {
  PagesPosts.findOne({ slugOfPage: req.params.slugOfPage }).exec(
    (err, pagePost) => {
      console.log(pagePost);
      PagesPosts.find({}).exec((err, pagesPosts) => {
        res.render("home", { pagePost, pagesPosts, admin: "admin" });
      });
    }
  );
});

//Delete Page

myApp.get("/delete/:id", function(req, res) {
  //anything defined after : is a variable
  if (req.session.username) {
    //Delete
    let objid = req.params.id;
    PagesPosts.find({}).exec((err, pagesPosts) => {
      // console.log(pagesPosts)
      let admin = "";

      PagesPosts.findByIdAndDelete({ _id: objid }).exec((err, pagePost) => {
        console.log("Error: " + err);
        console.log("PagePost: " + pagePost);
        if (pagePost) {
          res.render("delete", {
            message: "Successfully Deleted..Return to Admin Panel!!",
            admin: "admin",
            pagesPosts
          });
        } else {
          res.render("delete", {
            message: "Sorry, record not deleted...!!",
            admin: "admin",
            pagesPosts
          });
        }
      });
    });
  } else {
    res.redirect("/login");
  }
});

// Edit Page
myApp.get("/edit/:id", function(req, res) {
  //anything defined after : is a variable
  if (req.session.username) {
    //Edit
    let objid = req.params.id;
    PagesPosts.find({}).exec((err, pagesPosts) => {
      PagesPosts.findOne({ _id: objid }).exec((err, pagePost) => {
        console.log("Error: " + err);
        console.log("PagePost: " + pagePost);
        if (pagePost) {
          res.render("edit", { pagePost, pagesPosts, admin: "admin" });
        } else {
          res.send("No order found with this id...1");
        }
      });
    });
  } else {
    res.redirect("/login");
  }
});

//Edit page post request

myApp.post("/edit/:id", function(req, res) {
  console.log(req.files);
  let imageName = req.files.myImage.name;
  let image = req.files.myImage;
  let imagePath = "public/contact_images/" + imageName;
  image.mv(imagePath, function(err) {
    console.log(err);
  });
  let pagePostTitle = req.body.newPagePostTitle;
  let slugOfPage = req.body.newSlugPageTitle;
  let textInput = req.body.newTextInput;

  console.log(pagePostTitle);
  console.log(slugOfPage);
  console.log(image);
  console.log(textInput);

  let pageData = {
    pagePostTitle,
    slugOfPage,
    textInput,
    imageName
  };

  //we are updating

  let id = req.params.id;

  PagesPosts.findOne({ _id: id }, (err, pagePost) => {
    pagePost.pagePostTitle = pagePostTitle;
    pagePost.slugOfPage = slugOfPage;
    pagePost.textInput = textInput;

    pagePost.imageName = imageName;
    pagePost.save();
    PagesPosts.find({}).exec((err, pagesPosts) => {
      res.render("editsuccess", {
        pageData,
        message: "Success",
        pagesPosts,
        admin: "admin"
      });
    });
  });
});

//open up the ports, http protocol

// Confirmation output domain name displayed in terminal screen
myApp.listen(8080);
console.log("Application started ... listening on port 8080!"); // Open URL in Browser: http:localhost:8080
