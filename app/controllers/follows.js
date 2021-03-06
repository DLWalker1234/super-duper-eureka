const mongoose = require("mongoose");
const User = mongoose.model("User");

exports.follow = (req, res) => {
  const user = req.user;
  const id = req.url.split("/")[2];
 

  const currentId = user.id;

  User.findOne({ _id: id }, function(err, user) {
    if (user.followers.indexOf(currentId) === -1) {
      user.followers.push(currentId);
    }
    user.save(err => {
      if (err) {
        console.log(err);
      }
    });
  });

  // logged in user
  User.findOne({ _id: currentId }, function(err, user) {
    if (user.following.indexOf(id) === -1) {
      user.following.push(id);
    }
    user.save(err => {
      if (err) {
        res.send(400);
      }
      res.send(201, {});
    });
  });
};
