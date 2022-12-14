const db = require("../../database.js");
const Joi = require("joi");
const auth = require("../lib/middleware");
const { doesNotThrow } = require("assert");

const addNewComment = (comment, article_id, done) => {
  let date = Date.now();

  const sql =
    "INSERT INTO comments (comment_text, date_published, article_id) VALUES (?,?,?)";
  let values = [comment.comment_text, date, article_id];

  db.run(sql, values, function (err) {
    if (err) return done(err);

    return done(null, this.lastID);
  });
};

const getAllComments = (done) => {
  const results = [];

  db.each(
    "SELECT * FROM comments WHERE article_id =?",
    [],
    (err, row) => {
      if (err) console.log("Something isn't right" + err);
      results.push({
        comment_text: row.comment_text,
        comment_id: row.comment_id,
        article_id: row.article_id,
        date_published: new Date(row.date_published).toLocaleDateString(),
      });
    },
    (err, num_rows) => {
      return done(err, num_rows, results);
    }
  );
};

const deleteComment = (id, done) => {
  let query = "DELETE FROM comments WHERE comment_id=?";

  db.run(query, [id], (err) => {
    if (err) return done(err);
    return done(null);
  });
};

module.exports = {
  getAllComments: getAllComments,
  addNewComment: addNewComment,
  deleteComment: deleteComment,
};
