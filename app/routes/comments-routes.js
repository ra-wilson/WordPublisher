const comments = require('../controllers/comments-controller.js');
const auth = require("../lib/middleware");

module.exports = function(app){

    app.route("/articles/:article_id/comments")
    .get(comments.getAll)
    .post(comments.create)
    .delete(auth.isAuthenticated, comments.deleteComment);
    
};