const Joi = require("joi");
const comment = require("../models/comments-model.js");
const articles = require("../models/articles-model.js");

const getAll = (req, res) => {
  comment.getAllComments((err, num_rows, results) => {
    if (err) return res.sendStatus(500);

    return res.status(200).send(results);
  });
};

const create = (req, res, next) => {
  let article_id = parseInt(req.params.article_id);

  articles.getArticle(article_id, (err, result) => {
    if (err === 404) return res.sendStatus(404);
    if (err) return res.sendStatus(500);
  });

  console.log("here", article_id);
  const schema = Joi.object({
    comment_text: Joi.string().required(),
  });
  console.log(schema.validate(req.body));

  const { error } = schema.validate(req.body);

  console.log(error);

  if (error) return res.status(400).send(error.details[0].message);

  let comment = Object.assign({}, req.body);

  comment.addNewComment(comment, article_id, (err, id) => {
    if (err) return res.sendStatus(500);
    return res.status(201).send({ comment_id: id });
  });
};

const deleteComment = (req, res, next) => {
  let id = parseInt(req.params.article_id);
  if (!validator.isValidId(id)) return res.sendStatus(404);

  comment.deleteComment(comment_id, id, function (err) {
    if (err) {
      return res.sendStatus(500);
    }

    return res.sendStatus(200).send("Comment deleted");
  });
};

module.exports = {
  getAll: getAll,
  create: create,
  deleteComment: deleteComment,
};
