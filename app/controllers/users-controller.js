const Joi = require("joi");
const users = require("../models/users-model.js");
const db = require("../../database.js");

const authUser = (req, res) => {
  users.authenticateUser(req.body.email, req.body.password, (err, id) => {
    if (err === 404) return res.status(400).send("Invalid email or password");
    if (err) return res.sendStatus(500);

    users.getToken(id, (err, token) => {
      if (err) return res.sendStatus(500);

      if (token) {
        return res.status(200).send({ user_id: id, session_token: token });
      } else {
        users.setToken(id, (err, token) => {
          if (err) return res.sendStatus(500);
          return res.status(200).send({ user_id: id, session_token: token });
        });
      }
    });
  });
};

const create = (req, res) => {
  const schema = Joi.object({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.string().required(),
  });
  console.log(schema.validate(req.body));

  const { error } = schema.validate(req.body);

  console.log(error);

  if (error) return res.status(400).send(error.details[0].message);

  let user = Object.assign({}, req.body);

  users.create(user, (error, id) => {
    if (error) {
      console.log(error);
      return res.sendStatus(500);
    }
    return res.status(201).send({ user_id: id });
  });
};

const getAll = (req, res) => {
  users.getAllUsers((err, num_rows, results) => {
    if (err) return res.sendStatus(500);

    return res.status(200).send(results);
  });
};

const login = (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  users.authenticateUser(email, password, function (err, id) {
    //console.log(err, id);
    if (err) {
      // log.warn("Failed to authenticate: " + err);
      return res.status(400).send("Invalid email/password supplied");
    } else {
      users.getToken(id, function (err, token) {
        if (err) return res.sendStatus(500);
        /// return existing token if already set (don't modify tokens)
        if (token) {
          return res.status(200).send({ id: id, token: token });
        } else {
          // but if not, complete login by creating a token for the user
          users.setToken(id, function (err, token) {
            if (err) return res.sendStatus(500);
            return res.status(200).send({ id: id, token: token });
          });
        }
      });
    }
  });
};

const logout = (req, res) => {
  let token = req.get("authToken");

  users.removeToken(token, function (err) {
    if (err) {
      return res.sendStatus(401);
    } else {
      return res.sendStatus(200);
    }
  });

  return null;
};

module.exports = {
  authUser: authUser,
  create: create,
  getAll: getAll,
  login: login,
  logout: logout,
};
