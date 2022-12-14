const Joi = require("joi");
const articles = require("../models/articles-model.js");

const getAll = (req, res) => {
  articles.getAllArticles((err, num_rows, results) => {
    if (err) return res.sendStatus(500);

    return res.status(200).send(results);
  });
};

const create = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().required(),
    author: Joi.string().required(),
    article_text: Joi.string().required(),
  });
  console.log(schema.validate(req.body));

  const { error } = schema.validate(req.body);

  console.log(error);

  if (error) return res.status(400).send(error.details[0].message);

  let article = Object.assign({}, req.body);

  articles.addArticle(article, (error, id) => {
    if (error) return res.sendStatus(500);
    return res.status(201).send({ article_id: id });
  });
};

const getOne = (req, res) => {
  let article_id = parseInt(req.params.article_id);

  articles.getArticle(article_id, (err, result) => {
    if (err === 404) {
      console.log(err);
      return res.sendStatus(404);
    }
    if (err) return res.sendStatus(500);

    return res.status(200).send(result);
  });
};

const editArticle = (req, res) => {
  let article_id = parseInt(req.params.article_id);

  articles.getArticle(article_id, (err, result) => {
    if (err === 404) {
      console.log(err);
      return res.sendStatus(404);
    }
    if (err) return res.sendStatus(500);

    // console.log(article_id, "here");
    // return res.sendStatus(200);
    const schema = Joi.object({
      title: Joi.string(),
      article_text: Joi.string(),
      author: Joi.string(),
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    if (req.body.hasOwnProperty("author")) {
      result.author = req.body.author;
    }
    if (req.body.hasOwnProperty("title")) {
      result.title = req.body.title;
    }
    if (req.body.hasOwnProperty("article_text")) {
      result.article_text = req.body.article_text;
    }
    articles.editArticle(article_id, result, (err, id) => {
      if (err === 404) return res.sendStatus(404);

      if (err) return res.sendStatus(500);

      return res.status(200).send({ article_id: id + "has been edited." });
    });
  });
};

const deleteArticle = (req, res, next) => {
  let article_id = parseInt(req.params.article_id);

  articles.getArticle(article_id, (err, result) => {
    if (err === 404) return res.sendStatus(404);
    if (err) return res.sendStatus(500);
    return res.status(200);
  });

  articles.deleteArticle(article_id, (err, id) => {
    if (err === 404) return res.sendStatus(404);
    if (err) return res.sendStatus(500);
    return res.sendStatus(200).send("Article deleted");
  });
};

module.exports = {
  getAll: getAll,
  create: create,
  getOne: getOne,
  editArticle: editArticle,
  deleteArticle: deleteArticle,
};
