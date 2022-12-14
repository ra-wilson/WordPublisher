const articles = require("../controllers/articles-controller.js");
const auth = require("../lib/middleware");
module.exports = function (app) {
  app
  .route("/articles")
  .get(articles.getAll)
  .post(auth.isAuthenticated, articles.create);

  app
    .route("/articles/:article_id")
    .get(articles.getOne)
    .patch(auth.isAuthenticated, articles.editArticle)
    .delete(auth.isAuthenticated, articles.deleteArticle);
};
