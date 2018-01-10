// ## Derp Controller
const mongoose = require("mongoose");
const Derp = mongoose.model("Derp");
const User = mongoose.model("User");

exports.derpList = (req, res) => {
  const page = (req.params.page > 0 ? req.params.page : 1) - 1;
  const perPage = 15;
  const options = {
    perPage: perPage,
    page: page
  };
  let derps, count;
  Derp.limitedList(options)
    .then( result => {
      derps = result;
      return Derp.count();
    })
    .then( result => {
      count = result;
      return res.send(derps);
    })
    .catch( error => {
      return res.render("pages/500");
    });
}

exports.usersList = (req, res) => {
  const page = (req.params.page > 0 ? req.params.page : 1) - 1;
  const perPage = 15;
  const options = {
    perPage: perPage,
    page: page
  };
  let users, count;
  User.list(options)
    .then( result => {
      users = result;
      return User.count();
    })
    .then( result => {
      count = result;
      return res.send(users);
    })
    .catch( error => {
      return res.render("pages/500");
    });
}
