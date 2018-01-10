// Derp Controller
const createPagination = require('./analytics').createPagination;
const mongoose = require("mongoose");
const Derp = mongoose.model("Derp");
const User = mongoose.model("User");
const Analytics = mongoose.model("Analytics");
const _ = require("underscore");

exports.derp = (req, res, next, id) => {
  Derp.load(id, (err, derp) => {
    if (err) {
      return next(err);
    }
    if (!derp) {
      return next(new Error("Failed to load Derp" + id));
    }
    req.derp = derp;
    next();
  });
};

// Create a Derp
exports.create = (req, res) => {
  const derp = new Derp(req.body);
  derp.user = req.user;
  derp.uploadAndSave({}, err => {
    if (err) {
      res.render("pages/500", {error: err});
    } else {
      res.redirect("/");
    }
  });
};

// Update a derp
exports.update = (req, res) => {
  let derp = req.derp;
  derp = _.extend(derp, {"body": req.body.derp});
  derp.uploadAndSave({}, (err) => {
    if (err) {
      return res.render("pages/500", {error: err});
    }
    res.redirect("/");
  });
};

// Delete a derp
exports.destroy = (req, res) => {
  const derp = req.derp;
  derp.remove(err => {
    if (err) {
      return res.render("pages/500");
    }
    res.redirect("/");
  });
};

exports.index = (req, res) => {
  const page = (req.params.page > 0 ? req.params.page : 1) - 1;
  const perPage = 10;
  const options = {
    perPage: perPage,
    page: page
  };
  let followingCount = req.user.following.length;
  let followerCount = req.user.followers.length;
  let derps, derpCount, pageViews, analytics, pagination;
  User.countUserDerps(req.user._id).then(result => {
    derpCount = result;
  });
  Derp.list(options)
    .then(result => {
      derps = result;
      return Derp.countTotalDerps();
    })
    .then(result => {
      pageViews = result;
      pagination = createPagination(req, Math.ceil(pageViews/ perPage),  page+1);
      return Analytics.list({ perPage: 15 });
    })
    .then(result => {
      analytics = result;
      res.render("pages/index", {
        title: "List of Derps",
        derps: derps,
        analytics: analytics,
        page: page + 1,
        derpCount: derpCount,
        pagination: pagination,
        followerCount: followerCount,
        followingCount: followingCount,
        pages: Math.ceil(pageViews / perPage),
      });
    })
    .catch(error => {
      console.log(error);
      res.render("pages/500");
    });
}
