// const { doesNotThrow } = require("assert");
const crypto = require("crypto");

const db = require("../../database");

const getHash = function (password, salt) {
  console.log(password);
  return crypto
    .pbkdf2Sync(password, salt, 100000, 256, "sha256")
    .toString("hex");
};

const create = (user, done) => {
  console.log(user);
  const salt = crypto.randomBytes(64);
  const hash = getHash(user.password, salt);

  const sql =
    "INSERT INTO users (first_name, last_name, email, password, salt) VALUES (:first_name, :last_name, :email, :password, :salt)";
  let values = [
    user.first_name,
    user.last_name,
    user.email,
    hash,
    salt.toString("hex"),
  ];

  db.run(sql, values, function (err) {
    if (err) return done(err);

    return done(false, this.lastID);
  });
};

const authenticateUser = (email, password, done) => {
  const sql = "SELECT user_id, password, salt FROM users WHERE email =?";

  db.get(sql, [email], (err, row) => {
    if (err) return done(err);
    if (!row) return done(404);

    if (row.salt === null) row.salt = "";

    let salt = Buffer.from(row.salt, "hex");

    if (row.password === getHash(password, salt)) {
      return done(false, row.user_id);
    } else {
      return done(404);
    }
  });
};

const getToken = (id, done) => {
  const sql = "SELECT session_token FROM users WHERE user_id =?";

  db.get(sql, [id], (err, row) => {
    if (err) return done(err);

    return done(false, row.session_token);
  });
};

const setToken = (id, done) => {
  let token = crypto.randomBytes(16).toString("hex");

  const sql = "UPDATE users SET session_token =? WHERE user_id =?";

  db.run(sql, [token, id], (err) => {
    return done(err, token);
  });
};

const removeToken = (Token, done) => {
  const sql = "UPDATE9 users SET session_token =null WHERE session_token=?";
};

const getIdFromToken = (Token, done) => {
  const sql = "SELECT user_id FROM users WHERE session_token=?";
  const params = [token];
};

const isAuthenticated = function (req, res, next) {
  let token = req.get("X-Authorization");

  users.getIdFromToken(token, (err, id) => {
    if (err || id === null) {
      return res.sendStatus(401);
    }
    next();
  });
};

const getAllUsers = (done) => {
  const results = [];

  db.each(
    "SELECT * FROM users",
    [],
    (err, row) => {
      if (err) console.log("Something isn't right" + err);
      results.push({
        user_id: user_id,
        first_name: first_name,
        last_name: last_name,
        email: email,
      });
    },
    (err, num_rows) => {
      return done(err, num_rows, results);
    }
  );
};

const users = (module.exports = {
  create: create,
  isAuthenticated: isAuthenticated,
  getIdFromToken: getIdFromToken,
  authenticateUser: authenticateUser,
  setToken: setToken,
  removeToken: removeToken,
  getToken: getToken,
  getAllUsers: getAllUsers,
});
