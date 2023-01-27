const { doesNotThrow } = require("assert");
const crypto = require("crypto");
const auth = require("../lib/middleware");

const db = require("../../database.js");

const getHash = function(password, salt) {
  console.log(password);
  return crypto
    .pbkdf2Sync(password, salt, 100000, 256, "sha256")
    .toString("hex");
};

const create = (user, done) => {

  const salt = crypto.randomBytes(64);
  const hash = getHash(user.password, salt);

  const sql =
    "INSERT INTO users (first_name, last_name, email, password, salt) VALUES (?,?,?,?,?)";
  let values = [
    user.first_name,
    user.last_name,
    user.email,
    hash,
    salt.toString("hex"),
  ];

  db.run(sql, values, function (err) {
    if (err) return done(err);

    return done(null, this.lastID);
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
  

  db.get(
    "SELECT session_token FROM users WHERE user_id =?",
    [id],
    function (err, row){
      if(row && row.session_token){
        return done(null, row.session_token);
      }
      else{
    return done(null, null);
      }
  })
};

const setToken = (id, done) => {
  let token = crypto.randomBytes(16).toString("hex");

  const sql = "UPDATE users SET session_token =? WHERE user_id =?";


  db.run(sql, [token, id], (err) => {
    "UPDATE users SET session_token =? WHERE user_id =?"
    {return done(err, token)};
  });
};

const removeToken = (token, done) => {

  let query = "UPDATE users SET session_token =null WHERE session_token=?";

  db.run(query, [token], (err) => {
 
    return done(err, "Logged out");
  });
};


const getIdFromToken = (token, done) => {
  if (token === undefined || token === null) {
    return done(true, null);
  } else {
    db.get(
      "SELECT user_id FROM users WHERE session_token=?",
      [token],
      function (err, row) {
        if(err) return done(err);
        if(!row) return done(404);

        return done(null, row.user_id);

        // if (row) return done(null, row.user_id);
        // console.log(err);
        // return done(null);
      }
    );
  }
};


const getAllUsers = (done) => {
  const results = [];

  db.each(
    "SELECT * FROM users",
    [],
    (err, row) => {
      if (err) console.log("Something isn't right" + err);
      results.push({
        user_id: row.user_id,
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email,
      });
    },
    (err, num_rows) => {
      return done(err, num_rows, results);
    }
  );
};

const users = (module.exports = {
  create: create,
  //   isAuthenticated: isAuthenticated,
  getIdFromToken: getIdFromToken,
  authenticateUser: authenticateUser,
  setToken: setToken,
  removeToken: removeToken,
  getToken: getToken,
  getAllUsers: getAllUsers,
});
