// const { isBuffer } = require("util");
const db = require("../../database.js");
const Joi = require("joi");
const auth = require("../lib/middleware");
const comment = require("../models/comments-model.js");

const { doesNotThrow } = require("assert");

const addArticle = (article, done) => {
  let date = Date.now();

  const sql =
    "INSERT INTO articles (title, author, article_text, date_published, date_edited, created_by) VALUES (?,?,?,?,?,?)";
  let values = [
    article.title,
    article.author,
    article.article_text,
    date,
    date,
    1,
  ];

  db.run(sql, values, function (err) {
    if (err) return done(err);

    return done(null, this.lastID);
  });
};

const getAllArticles = (done) => {
  const results = [];

  db.each(
    "SELECT * FROM articles",
    [],
    (err, row) => {
      if (err) console.log("Something isn't right" + err);
      results.push({
        article_id: row.article_id,
        title: row.title,
        author: row.author,
        article_text: row.article_text,
        date_published: new Date(row.date_published).toLocaleDateString(),
        date_edited: new Date(row.date_edited).toLocaleDateString(),
      });
    },
    (err, num_rows) => {
      return done(err, num_rows, results);
    }
  );
};

const getArticle = (id, done) => {
  const sql = "SELECT * FROM articles WHERE article_id=?";

  db.get(sql, [id], (err, row) => {
    if (err) return done(err);
    if (!row) return done(404);

    return done(null, {
      article_id: row.article_id,
      title: row.title,
      author: row.author,
      article_text: row.article_text,
      date_published: new Date(row.date_published).toLocaleDateString(),
      date_edited: new Date(row.date_edited).toLocaleDateString(),
    });
  });
};

const editArticle = (id, article, done) => {
  const sql =
    "UPDATE articles SET title=?, author=?, article_text=? WHERE article_id=?";

  let values = [article.title, article.author, article.article_text, id];
  db.run(sql, values, function (err) {
    if (err) return done(err);

    return done(null, this.lastID, "Article successfully updated");
  });
};

const deleteArticle = (id, article, done) => {
  const sql = "DELETE FROM articles WHERE article_id=?";

  db.run(sql, function (err) {
    if (err) return done(err);
    console.log("Successfully deleted");
    return done(null, "Article successfully deleted");
  });
};

module.exports = {
  getAllArticles: getAllArticles,
  addArticle: addArticle,
  editArticle: editArticle,
  deleteArticle: deleteArticle,
  getArticle: getArticle,
};
