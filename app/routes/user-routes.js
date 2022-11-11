const users = require("../controllers/users-controller.js");

module.exports = function (app) {
  app.route("/users").get(users.getAll).post(users.create);

  app.route("/login").post(users.login);

  app.route("/logout").post(users.logout);
};
