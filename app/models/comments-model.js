const db = require("../../database.js");
const Joi = require("joi");
const auth = require("../lib/middleware");
const { doesNotThrow } = require("assert");
const filter = require("bad-words");
const articles = require("../models/articles-model.js");

const addNewComment = (comment, article_id, done) => {
  let date = Date.now();

  const sql =
    "INSERT INTO comments (comment_text, date_published, article_id) VALUES (?,?,?)";
  let values = [(comment.comment_text), date, article_id];

  db.run(sql, values, function (err) {
    if (err) return done(err, null);

    return done(null, this.lastID);
  });
};

const getAllComments = (article_id, done) => {
  const results = [];

  db.each(
    "SELECT * FROM comments WHERE article_id=?",
    [article_id],
    (err, row) => {
      if (err) console.log("Something isn't right" + err);
      results.push({
        comment_text: row.comment_text,
        comment_id: row.comment_id,
        date_published: new Date(row.date_published).toLocaleDateString(),
      });
    },
    (err) => {
      
      return done(err, results);
    }
  );
};

const getSingleComment = (id, done) => {
  const sql = "SELECT * FROM comments WHERE comment_id=?"

  db.get(sql, [id], (err, row) => {
    if (err) return done(err)
    if(!row) return done(404)

    return done(null, {
      comment_id: row.comment_id,
      date_published: new Date(row.date_published).toLocaleDateString(),
     comment_text: row.comment_text, 

    })
  })
}

const deleteComment = (id, done) => {
  const sql = "DELETE FROM comments WHERE comment_id=?";

  db.run(sql, [id], (err) => {

    return done(err);
  })
};

module.exports = {
  getAllComments: getAllComments,
  addNewComment: addNewComment,
  deleteComment: deleteComment,
  getSingleComment: getSingleComment
};
