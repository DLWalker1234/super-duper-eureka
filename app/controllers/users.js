const Mongoose = require("mongoose");
const Derp = Mongoose.model("Derp");
const User = Mongoose.model("User");
const Analytics = Mongoose.model("Analytics");

exports.signin = (req, res) => {};

exports.authCallback = (req, res) => {
  res.redirect("/");
};

exports.login = (req, res) => {
  res.render("pages/login", {
    title: "Login",
    message: req.flash("error")
  });
};

exports.signup = (req, res) => {
  res.render("pages/login", {
    title: "Sign up",
    user: new User()
  });
};

exports.logout = (req, res) => {
  req.logout();
  res.redirect("/login");
};

exports.session = (req, res) => {
  res.redirect("/");
};

exports.create = (req, res, next) => {
  const user = new User(req.body);
  user.provider = "local";
  user.save()
    .catch( error => {
      return res.render("pages/login", { errors: err.errors, user: user });
    })
    .then( () => {
      return req.login(user);
    })
    .then( () => {
      return res.redirect("/");
    })
    .catch( error => {
      return next(error);
    });
}

exports.list = (req, res) => {
  const page = (req.params.page > 0 ? req.params.page : 1) - 1;
  const perPage = 5;
  const options = {
    perPage: perPage,
    page: page,
    criteria: {github: { $exists: true}},
  };
  let users, count;
  User.list(options)
    .then( result => {
      users = result;
      return User.count();
    })
    .then( result => {
      count = result;
      res.render("pages/user-list", {
        title: "List of Users",
        users: users,
        page: page + 1,
        pages: Math.ceil(count / perPage)
      });
    })
    .catch( error => {
      return res.render("pages/500");
    });
}

exports.show = (req, res) => {
  const user = req.profile;
  const reqUserId = user._id;
  const userId = reqUserId.toString();
  const page = (req.params.page > 0 ? req.params.page : 1) - 1;
  const options = {
    perPage: 100,
    page: page,
    criteria: { user: userId }
  };
  let derps, derpCount;
  let followingCount = user.following.length;
  let followerCount = user.followers.length;

  Derp.list(options)
    .then( result => {
      derps = result;
      return Derp.countUserDerps(reqUserId);
    })
    .then( result => {
      derpCount = result;
      res.render("pages/profile", {
        title: "Derps from " + user.name,
        user: user,
        derps: derps,
        derpCount: derpCount,
        followerCount: followerCount,
        followingCount: followingCount
      });
    })
    .catch( error => {
      return res.render("pages/500");
    })
}

exports.user = (req, res, next, id) => {
  User.findOne({ _id: id }).exec((err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(new Error("failed to load user " + id));
    }
    req.profile = user;
    next();
  });
};

exports.showFollowers = (req, res) => {
  showFollowers(req, res, "followers");
};

exports.showFollowing = (req, res) => {
  showFollowers(req, res, "following");
};

function showFollowers(req, res, type) {
  let user = req.profile;
  let followers = user[type];
  let derpCount;
  let followingCount = user.following.length;
  let followerCount = user.followers.length;
  let userFollowers = User.find({ _id: { $in: followers } }).populate(
    "user",
    "_id name username github"
  );

  Derp.countUserDerps(user._id)
    .then( result => {
      derpCount = result;
      userFollowers.exec((err, users) => {
        if (err) {
          return res.render("pages/500");
        }
        res.render("pages/followers", {
          user: user,
          followers: users,
          derpCount: derpCount,
          followerCount: followerCount,
          followingCount: followingCount
        });
      });
    })
}
