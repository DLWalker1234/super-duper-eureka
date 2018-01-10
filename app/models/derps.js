const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const utils = require("../../lib/utils");

//  Getters and Setters
const getTags = tags => tags.join(",");

const setTags = tags => tags.split(",");

// Derp Schema
const DerpSchema = new Schema({
  body: { type: String, default: "", trim: true, maxlength: 280},
  user: { type: Schema.ObjectId, ref: "User" },
  comments: [
    {
      body: { type: String, default: "", maxlength: 280},
      user: { type: Schema.ObjectId, ref: "User" },
      commenterName: { type: String, default: "" },
      commenterPicture: { type: String, default: ""},
      createdAt: { type: Date, default: Date.now }
    }
  ],
  tags: { type: [], get: getTags, set: setTags },
  favorites: [{ type: Schema.ObjectId, ref: "User" }],
  favoriters: [{ type: Schema.ObjectId, ref: "User" }],
  favoritesCount: Number,
  createdAt: { type: Date, default: Date.now }
});

// Pre save hook
DerpSchema.pre("save", function(next) {
  if (this.favorites) {
    this.favoritesCount = this.favorites.length;
  }
  if (this.favorites) {
    this.favoriters = this.favorites;
  }
  next();
});

// Make sure derp is not empty
DerpSchema.path("body").validate(
  body => body.length > 0,
  "Derp body cannot be blank"
);

DerpSchema.virtual("_favorites").set(function(user) {
  if (this.favorites.indexOf(user._id) === -1) {
    this.favorites.push(user._id);
  } else {
    this.favorites.splice(this.favorites.indexOf(user._id), 1);
  }
});

DerpSchema.methods = {
  uploadAndSave: function(images, callback) {
    const self = this;
    if (!images || !images.length) {
      return this.save(callback);
    }
    imager.upload(
      images,
      (err, cdnUri, files) => {
        if (err) {
          return callback(err);
        }
        if (files.length) {
          self.image = { cdnUri: cdnUri, files: files };
        }
        self.save(callback);
      },
      "article"
    );
  },
  addComment: function(user, comment, cb) {
    if (user.name) {
      this.comments.push({
        body: comment.body,
        user: user._id,
        commenterName: user.name,
        commenterPicture: user.github.avatar_url,
      });
      this.save(cb);
    } else {
      this.comments.push({
        body: comment.body,
        user: user._id,
        commenterName: user.username,
        commenterPicture: user.github.avatar_url,
      });

      
      this.save(cb);
    }
  },

  removeComment: function(commentId, cb) {
    let index = utils.indexof(this.comments, { id: commentId });
    if (~index) {
      this.comments.splice(index, 1);
    } else {
      return cb("not found");
    }
    this.save(cb);
  }
};


DerpSchema.statics = {
  // Load derps
  load: function(id, callback) {
    this.findOne({ _id: id })
      .populate("user", "name username provider github")
      .populate("comments.user")
      .exec(callback);
  },
  // List derps
  list: function(options) {
    const criteria = options.criteria || {};
    return this.find(criteria)
      .populate("user", "name username provider github")
      .sort({ createdAt: -1 })
      .limit(options.perPage)
      .skip(options.perPage * options.page);
  },
  // List derps
  limitedList: function(options) {
    const criteria = options.criteria || {};
    return this.find(criteria)
      .populate("user", "name username")
      .sort({ createdAt: -1 })
      .limit(options.perPage)
      .skip(options.perPage * options.page);
  },
  // Derps of User
  userDerps: function(id, callback) {
    this.find({ user: ObjectId(id) }).toArray().exec(callback);
  },

  // Count the number of derps for a specific user
  countUserDerps: function(id, callback) {
    return this.find({ user: id })
              .count()
              .exec(callback);
  },

  // Count the total app derps for home page.
  countTotalDerps: function() {
    return this.find({})
               .count();
  }
};

mongoose.model("Derp", DerpSchema);
