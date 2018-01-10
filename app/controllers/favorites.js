// Make Favorite
exports.create = (req, res) => {
  const derp = req.derp;
  derp._favorites = req.user;
  derp.save(err => {
    if (err) {
      return res.send(400);
    }
    res.send(201, {});
  });
};

// Delete Favorite
exports.destroy = (req, res) => {
  const derp = req.derp;

  derp._favorites = req.user;
  derp.save(err => {
    if (err) {
      return res.send(400);
    }
    res.send(200);
  });
};
