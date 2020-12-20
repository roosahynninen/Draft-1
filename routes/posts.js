// Author: Roosa Hynninen
// Web applications final project

/////////////////////////////////////////////////////////////

// something general about this file

// req.params.<something> gets content passed to method when calling
// them from views

// req.body.<something> gets content from input fields

// all data is updated, fecthed, deleted, etc... from mongodb
// "current" username is exception and it's saved globally in the program

/////////////////////////////////////////////////////////////

//importing/requiring libraries
var express = require("express");
var router = express.Router();
const { sanitizeBody } = require("express-validator");

var MongoClient = require("mongodb").MongoClient;
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

/////////////////////////////////////////////////////////////

// URL for MongoDB
var url =
  "mongodb+srv://rhynnine:Kissa888!@cluster0.unrpb.mongodb.net/WhatADay?retryWrites=true&w=majority";

// /////////////////////////////////////////////////////////////

// // connecting to database with mongoose
mongoose
  .connect(url, { useNewUrlParser: true })
  .then(() => console.log("Connection Successful"))
  .catch((err) => console.log(err));

mongoose.connection
  .once("open", function () {
    console.log("Connection made!");
  })
  .on("error", function (error) {
    console.log("Connection not succesfull", error);
  });

///////////////////////////////////////////////////////////

// // connecting to database with mongoose
mongoose
  .connect(url, { useNewUrlParser: true })
  .then(() => console.log("Connection Successful"))
  .catch((err) => console.log(err));

mongoose.connection
  .once("open", function () {
    console.log("Connection made!");
  })
  .on("error", function (error) {
    console.log("Not good :(", error);
  });

///////////////////////////////////////////////////////////

// creating all used schemas for MongoDB
var postSchema = new mongoose.Schema({
  postId: String,
  personLoggedIn: String,
  personPost: String,
  date: String
});

var commentSchema = new mongoose.Schema({
  commentedPost: String,
  commentor: String,
  commentsForPost: String,
  date: String
});

var userSchema = new mongoose.Schema({
  username: String,
  password: String
});

var postIdTrackerSchema = new mongoose.Schema({
  name: String,
  id: Number
});

var requestIdTrackerSchema = new mongoose.Schema({
  name: String,
  id: Number
});

var friendSchema = new mongoose.Schema({
  name: String,
  friendWith: String
});

var requestFriendSchema = new mongoose.Schema({
  requestId: String,
  asker: String,
  target: String
});

/////////////////////////////////////////////////////////////

// creating variables which can be used when updating, deleting,
// fetching... data from database

var Post = mongoose.model("Post", postSchema);
var Comment = mongoose.model("Comment", commentSchema);
var User = mongoose.model("User", userSchema);
var postTracker = mongoose.model("Id", postIdTrackerSchema);
var requestTracker = mongoose.model("rid", requestIdTrackerSchema);
var Friend = mongoose.model("Friend", friendSchema);
var Request = mongoose.model("Request", requestFriendSchema);

/////////////////////////////////////////////////////////////

// method for accepting friend requests
// :requestID and :friendName catches variables/info from view
router.post("/acceptRequest/:requestID/:friendName", function (req, res, next) {
  // creating new friend  (user + friendName)
  var kaveri1 = Friend({
    name: userName,
    friendWith: req.params.friendName
  }).save(function (err) {
    if (err) throw err;
  });

  // creating new friend (friendName + user)
  var kaveri1 = Friend({
    name: req.params.friendName,
    friendWith: userName
  }).save(function (err) {
    if (err) throw err;
  });

  // deleting friend request because they are now friends
  Request.find({}, function (err, postID) {
    if (err) throw err;
    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("database");
      var deletethis = req.params.requestID;

      dbo
        .collection("requests")
        .deleteOne({ requestId: req.params.requestID }, function (err, obj) {
          if (err) throw err;
          console.log(obj);
        });
    });
  });

  // rendering mypage with updated data (new friends, request deleted)
  Post.find({}, function (err, data3) {
    if (err) throw err;
    Comment.find({}, function (err, data4) {
      if (err) throw err;
      Request.find({}, function (err, data5) {
        if (err) throw err;
        Friend.find({}, function (err, data8) {
          if (err) throw err;
          res.redirect("/posts/mypage?");
        });
      });
    });
  });
});

/////////////////////////////////////////////////////////////

// method for sending friend request
router.post("/addFriend", function (req, res, next) {
  var counter = 0;
  Friend.find({}, function (err, data) {
    if (err) throw err;
    User.find({}, function (err, data2) {
      if (err) throw err;
      Post.find({}, function (err, data3) {
        if (err) throw err;
        Comment.find({}, function (err, data4) {
          if (err) throw err;
          Request.find({}, function (err, data5) {
            if (err) throw err;
            var local_name = req.body.content;

            for (var j = 0; j < data2.length; j++) {
              if (data2[j].username === local_name) {
                counter = counter + 1;
                for (var i = 0; i < data.length; i++) {
                  if (
                    data[i].name === userName &&
                    data[i].friendWith === local_name
                  ) {
                    counter = counter + 1;
                  }
                }
              }
            }

            // if searched friend is not found from database
            if (counter === 0) {
              var msg = "*" + local_name + " is not user of Naamakirja";
              res.render("mypage", {
                title: userName,
                post_list: data3,
                comment_list: data4,
                user_list: data5,
                message_f: msg,
                friend_list: data,
                peukku: "no"
              });
            }

            // creating new friendRequest to database
            // if found name founded from database and
            // person not your friend yet
            if (counter === 1) {
              requestTracker.find({}, function (err, data6) {
                if (err) throw err;
                var pyynto1 = Request({
                  requestId: data6[0].id,
                  asker: userName,
                  target: local_name
                }).save(function (err) {
                  if (err) throw err;
                  updateRequestId();
                  console.log("Request sent!");
                });
              });

              var msg = "*Friend request to " + local_name + " sent";
              res.render("mypage", {
                title: userName,
                post_list: data3,
                comment_list: data4,
                user_list: data5,
                message_f: msg,
                friend_list: data,
                peukku: "yes"
              });
            }
            // if person is already your friend
            else {
              var msg = "*" + local_name + " is already your friend";
              res.render("mypage", {
                title: userName,
                post_list: data3,
                comment_list: data4,
                user_list: data5,
                message_f: msg,
                friend_list: data,
                peukku: "no"
              });
            }
          });
        });
      });
    });
  });
});

/////////////////////////////////////////////////////////////

// rendering posts.pug view
router.get("/", function (req, res, next) {
  Post.find({}, function (err, data) {
    if (err) throw err;
    Comment.find({}, function (err, data2) {
      if (err) throw err;
      User.find({}, function (err, data3) {
        if (err) throw err;
        Friend.find({}, function (err, data8) {
          if (err) throw err;
          res.render("posts", {
            title: userName,
            post_list: data,
            comment_list: data2,
            user_list: data3,
            friend_list: data8
          });
        });
      });
    });
  });
});

/////////////////////////////////////////////////////////////

// rendering feedBy.pug view
// :page is catching info from which view person is trying to make search
router.post("/filter/:page", function (req, res, next) {
  Post.find({}, function (err, data) {
    if (err) throw err;
    Comment.find({}, function (err, data2) {
      if (err) throw err;
      var local_name = req.body.personName;
      console.log("Postaukset: " + local_name);
      var counter = 0;
      Friend.find({}, function (err, data8) {
        if (err) throw err;
        for (var i = 0; i < data8.length; i++) {
          if (
            data8[i].name === userName &&
            data8[i].friendWith === local_name
          ) {
            counter = counter + 1;
          }
        }
        // rendering wanted posts
        if (counter !== 0) {
          res.render("feedBy", {
            title: userName,
            post_list: data,
            comment_list: data2,
            friend_list: data8,
            person: local_name
          });
        }
        // if person is not your friend = errro message
        else {
          Post.find({}, function (err, data) {
            if (err) throw err;
            Comment.find({}, function (err, data2) {
              if (err) throw err;
              Request.find({}, function (err, data5) {
                if (err) throw err;
                Friend.find({}, function (err, data8) {
                  if (err) throw err;
                  var msg =
                    "Could't find '" + local_name + "' from your friends";
                  // if user tried to search person from posts.pug view
                  // then rendering back to posts.pug
                  if (req.params.page === "feed") {
                    res.render("posts", {
                      title: userName,
                      post_list: data,
                      comment_list: data2,
                      message: msg,
                      friend_list: data8
                    });
                  }
                  // if user tried to search person from feedBy.pug view
                  // then rendering back to feedBy.pug
                  else {
                    Friend.find({}, function (err, data8) {
                      if (err) throw err;
                      res.render("feedBy", {
                        title: userName,
                        post_list: data,
                        comment_list: data2,
                        friend_list: data8,
                        message: msg
                      });
                    });
                  }
                });
              });
            });
          });
        }
      });
    });
  });
});

/////////////////////////////////////////////////////////////

// creating id object, only needed once so commented out
// just updating id in the object later

// var post1 = postTracker({
//   name: "postCounter",
//   id: -1
// }).save(function(err) {
//   if (err) throw err;
//   console.log("postTrcaker added");
// });

/////////////////////////////////////////////////////////////

// creating requestTracker object, only needed once so commented out
// just updating id in the object later

// var requets1 = requestTracker({
//   name: "requestCounter",
//   id: -1
// }).save(function(err) {
//   if (err) throw err;
//   console.log("requestTracker added");
// });

/////////////////////////////////////////////////////////////

// updating request id once new request is made,
// function is called from relevant methods
function updateRequestId() {
  requestTracker.find({}, function (err, requestID) {
    if (err) throw err;
    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("database");
      var newval = requestID[0].id + 2;

      dbo
        .collection("rids")
        .updateOne(
          { name: "requestCounter" },
          { $set: { id: newval } },
          function (err, result) {
            console.log(result);
          }
        );
    });
  });
}

/////////////////////////////////////////////////////////////

// updating post id once new post is made,
// function is called from relevant methods
function updatePostId() {
  postTracker.find({}, function (err, postID) {
    if (err) throw err;
    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("database");
      var newval = postID[0].id + 1;

      dbo
        .collection("ids")
        .updateOne({ name: "postCounter" }, { $set: { id: newval } }, function (
          err,
          result
        ) {
          console.log(result);
        });
    });
  });
}

/////////////////////////////////////////////////////////////

// method for creating and saving new posts
router.post("/create/:page", sanitizeBody("*").trim().escape(), function (
  req,
  res,
  next
) {
  var local_post = req.body.content;
  var howBig = local_post.length;
  console.log("stringin pituus: " + howBig);
  console.log("We got content: " + local_post);

  // creating date when post is made
  let date_ob = new Date();
  let date = ("0" + date_ob.getDate()).slice(-2);
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  let year = date_ob.getFullYear();
  let hours = date_ob.getHours() + 2;
  let minutes = date_ob.getMinutes();
  let seconds = date_ob.getSeconds();

  console.log(
    year +
      "-" +
      month +
      "-" +
      date +
      " " +
      hours +
      ":" +
      minutes +
      ":" +
      seconds
  );
  var time =
    year +
    "-" +
    month +
    "-" +
    date +
    " " +
    hours +
    ":" +
    minutes +
    ":" +
    seconds;

  // if post is over 1000 characters
  // error message is rendered to user
  if (howBig > 1000) {
    Post.find({}, function (err, data) {
      if (err) throw err;
      Comment.find({}, function (err, data2) {
        if (err) throw err;
        Request.find({}, function (err, data5) {
          if (err) throw err;
          Friend.find({}, function (err, data8) {
            if (err) throw err;
            var takeThis =
              "Your post is now " +
              howBig +
              " characters long and it should less than 40.";
            res.redirect("/posts/mypage?");
          });
        });
      });
    });
  }
  // if post is under 1000 characters
  // post will be saved
  else {
    postTracker.find({}, function (err, postID) {
      if (err) throw err;
      var postaus1 = Post({
        postId: postID[0].id,
        personLoggedIn: userName,
        personPost: local_post,
        date: time
      }).save(function (err) {
        if (err) throw err;
        console.log("post added!");
      });
      updatePostId();
    });
    Post.find({}, function (err, data3) {
      if (err) throw err;
      Comment.find({}, function (err, data4) {
        if (err) throw err;
        Request.find({}, function (err, data5) {
          if (err) throw err;
          Friend.find({}, function (err, data8) {
            if (err) throw err;
            res.redirect("/posts/mypage?");
          });
        });
      });
    });
  }
});

/////////////////////////////////////////////////////////////

var id = 0;
var userName = "";

// method for log in
// checks if username is in database
// checks if username and password matches
router.post(
  "/login",
  sanitizeBody("*").trim().escape(),

  function (req, res, next) {
    var user_Name = req.body.user;
    var user_Password = req.body.userpassword;
    userName = user_Name;

    User.find({}, function (err, data) {
      if (err) throw err;
      var userOrNot = 0;
      for (var i = 0; i < data.length; i++) {
        if (data[i].username === userName) {
          if (data[i].password === user_Password) {
            userOrNot++;
          }
        }
      }

      if (userOrNot === 0) {
        res.render("index", {
          title: "Naamakirja",
          message: "*You don't have user yet or username/password incorrect"
        });
      } else {
        res.redirect("/posts");
      }
    });
  }
);

/////////////////////////////////////////////////////////////

// method for logout
// renders just index.pug 'starting' view
router.post("/logout", function (req, res, next) {
  res.render("index", { title: "What A Day!" });
});

/////////////////////////////////////////////////////////////

//  method for saving comments
// :postId is catching which post user wants to comment
// :page is catching the view from which view user made the comment
router.post(
  "/writeComment/:postId/:page",
  sanitizeBody("*").trim().escape(),
  function (req, res, next) {
    var local_comment = req.body.commentContent;
    console.log("we got comment!" + local_comment);

    // creating date when comment was made
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours() + 2;
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();

    console.log(
      year +
        "-" +
        month +
        "-" +
        date +
        " " +
        hours +
        ":" +
        minutes +
        ":" +
        seconds
    );
    var time =
      year +
      "-" +
      month +
      "-" +
      date +
      " " +
      hours +
      ":" +
      minutes +
      ":" +
      seconds;

    var kommentti1 = Comment({
      commentedPost: req.params.postId,
      commentor: userName,
      commentsForPost: local_comment,
      date: time
    }).save(function (err) {
      if (err) throw err;
      console.log("comment added!");
    });
    if (req.params.page === "feed") {
      res.redirect("/posts");
    }

    if (req.params.page === "mypage") {
      res.redirect("/posts/mypage?");
    } else {
      Post.find({}, function (err, data) {
        if (err) throw err;
        Comment.find({}, function (err, data2) {
          if (err) throw err;
          Friend.find({}, function (err, data8) {
            if (err) throw err;
            res.render("feedBy", {
              title: userName,
              post_list: data,
              comment_list: data2,
              friend_list: data8,
              person: req.params.page
            });
          });
        });
      });
    }
  }
);

/////////////////////////////////////////////////////////////

// method for deleting posts
// :postId gets wanted post from view
router.post("/delete/:postId", sanitizeBody("*").trim().escape(), function (
  req,
  res,
  next
) {
  Post.find({}, function (err, postID) {
    if (err) throw err;
    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("database");
      var deletethis = req.params.postId;
      console.log("id. " + req.params.postId);

      dbo
        .collection("posts")
        .deleteOne({ postId: req.params.postId }, function (err, obj) {
          if (err) throw err;
          console.log(obj);
        });
    });
  });
  res.redirect("/posts/mypage?");
});

/////////////////////////////////////////////////////////////

// method for removing friends
// :name gets user who is requesting remove
// :friendname gets friends name who user wants to remove
router.post(
  "/deleteFriend/:name/:friendname",
  sanitizeBody("*").trim().escape(),
  function (req, res, next) {
    Friend.find({}, function (err, postID) {
      if (err) throw err;
      MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("database");
        var delete1 = req.params.name;
        var delete2 = req.params.friendname;
        console.log("name: " + req.params.name);
        console.log("friend: " + req.params.friendname);

        dbo
          .collection("friends")
          .deleteOne(
            { name: req.params.name, friendWith: req.params.friendname },
            function (err, obj) {
              if (err) throw err;
              console.log(obj);
            }
          );

        dbo
          .collection("friends")
          .deleteOne(
            { name: req.params.friendname, friendWith: req.params.name },
            function (err, obj) {
              if (err) throw err;
              console.log(obj);
            }
          );
      });
    });
    res.redirect("/posts/mypage?");
  }
);

/////////////////////////////////////////////////////////////

// method for rendering mypage
router.get("/mypage", function (req, res, next) {
  Post.find({}, function (err, data) {
    if (err) throw err;
    Comment.find({}, function (err, data2) {
      if (err) throw err;
      Request.find({}, function (err, data5) {
        if (err) throw err;
        console.log(data);
        Friend.find({}, function (err, data8) {
          if (err) throw err;
          res.render("mypage", {
            title: userName,
            post_list: data,
            comment_list: data2,
            user_list: data5,
            friend_list: data8
          });
        });
      });
    });
  });
});

/////////////////////////////////////////////////////////////

// method for creating new username and password
router.post("/signup", sanitizeBody("*").trim().escape(), function (
  req,
  res,
  next
) {
  var local_user = req.body.user2;
  var local_password = req.body.userpassword2;
  var local_password2 = req.body.userpassword3;
  console.log("We got content: " + local_user);
  console.log("We got content: " + local_password);
  console.log("We got content: " + local_password2);

  if (local_password === local_password2) {
    var kayttaja1 = User({
      username: local_user,
      password: local_password
    }).save(function (err) {
      if (err) throw err;
      console.log("User added");
    });
    console.log("You may now log in");
    res.render("index", {
      title: "What A Day!",
      message2: "You may now log in"
    });
  } else {
    console.log("wrong password");
    res.render("index", {
      title: "What A Day!",
      message: "Please make sure to type password correctly twice"
    });
  }
});

/////////////////////////////////////////////////////////////

module.exports = router;
