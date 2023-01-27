const Joi = require("joi");
const comments = require("../models/comments-model.js");
const articles = require("../models/articles-model.js");

const getAll = (req, res) => {
  let article_id = parseInt(req.params.article_id);
  comments.getAllComments(article_id, (err, results) => {
    if (err) return res.sendStatus(500);

    return res.status(200).send(results);
  });
};

const create = (req, res) => {
  let article_id = parseInt(req.params.article_id);

  articles.getArticle(article_id, (err, result) => {
    if (err === 404) return res.sendStatus(404);
    if (err) return res.sendStatus(500);

    const schema = Joi.object({
      comment_text: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);

    if (error) return res.status(400).send(error.details[0].message);

    let comment = Object.assign({}, req.body);

    comments.addNewComment(comment, article_id, (err, id) => {
      if (err) {
        return res.sendStatus(500);
      }
      return res.status(201).send({ comment_id: id });
    });
  });
};

const getComment = (req, res) => {
  let comment_id = parseInt(req.params.comment_id);

  comments.getSingleComment(comment_id, (err, result) => {
    if (err === 404) {
      return res.sendStatus(404);
    }
    return res.status(200).send(result);
  });
};

const deleteComment = (req, res) => {

  let comment_id = parseInt(req.params.comment_id);

  comments.getSingleComment(comment_id, (err, result) => {
    if (err === 404) return res.sendStatus(404);
    if (err) return res.sendStatus(500);

    comments.deleteComment(comment_id, (err) => {
      if (err) return res.sendStatus(500);
      return res.sendStatus(200).send("Comment deleted");
    });
  });
};

module.exports = {
  getAll: getAll,
  create: create,
  deleteComment: deleteComment,
  getComment: getComment,
};
