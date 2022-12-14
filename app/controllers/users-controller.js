const Joi = require("joi");
const users = require("../models/users-model.js");
const PasswordValidator = require("password-validator");
const db = require("../../database.js");
const emailValidator = require("email-validator");

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
    "first_name": Joi.string().required(),
    "last_name": Joi.string().required(),
    "email": Joi.string().required(),
    "password": Joi.string()
      .pattern(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/)
      .required(),
  });
  console.log(schema.validate(req.body));

  const { error } = schema.validate(req.body);

  console.log(error, 1);

  if (error) return res.status(400).send(error.details[0].message);

  let user = Object.assign({}, req.body);

  if(!emailValidator.validate(user["email"]) || user["password"].length <= 7){
    return res.status(400).send("email must be valid & password must be least 7 characters");
  }
  if(!emailValidator.validate(user["email"]) || user["password"].length >= 30){
    return res.status(400).send("email must be valid & password must be less than 30 characters characters");
  }
  

  users.create(user, (error, id) => {
    if (error) {
      console.log(error, 2);
      return res.sendStatus(500);
    }
    return res.status(201).send({ user_id: id });
  });
};

const getAll = (req, res, next) => {
  users.getAllUsers((err, num_rows, results) => {
    if (err) return res.sendStatus(500);

    return res.status(200).send(results);
  });
};

const login = (req, res) => {
  // validate user with email and password
  const schema = Joi.object({
    "email": Joi.string().required(),
    "password": Joi.string().required(),
  })

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let email = req.body.email;
  let password = req.body.password;

  users.authenticateUser(email, password, (err, id) => {
    // log error
    if(err === 404) {
      // if failed to authenticate
      return res.status(400).send("Invalid email/password supplied");
    }
    if(err) return res.sendStatus(500)

      users.getToken(id, function (err, token) {
        if (err) return res.sendStatus(500);
        /// return existing token if already set (don't modify tokens)
        if (token) {
          return res.status(200).send({ user_id: id, session_token: token });
        } else {
          // create token for user if no token set
          users.setToken(id, function (err, token) {
            if (err) return res.sendStatus(500);
            return res.status(200).send({ user_id: id, session_token: token });
          });
        }
      }
  )}
  )};

const logout = (req, res) => {
  let token = req.get("X-Authorization");

  users.removeToken(token, (err) => {
    if (err) {
      console.log(err);
      return res.sendStatus(401);
      
    } else {
      console.log("Successfully logged out");
      return res.sendStatus(200);
    }
  });
};

module.exports = {
  authUser: authUser,
  create: create,
  getAll: getAll,
  login: login,
  logout: logout,
};
