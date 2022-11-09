const Joi = require("joi");
const articles = require("../models/articles-model.js");

const getAll = (req, res) => {
  
        articles.getAllArticles((err, num_rows, results) => {
            if (err) return res.sendStatus(500);
       
            return res.status(200).send(results)
        })
    }
 
    const create = (req, res) => {
        const schema = Joi.object({
            "title": Joi.string().required(),
            "author": Joi.string().required(),
            "article_text": Joi.string().required()
        });
        console.log(schema.validate(req.body));
    
        const { error } = schema.validate(req.body);
         
        console.log(error);
    
        if (error) return res.status(400).send(error.details[0].message);
    
        let article = Object.assign({}, req.body);
    
        articles.addArticle(article, (error, id) => {
            if (error) return res.sendStatus(500);
            return res.status(201).send({article_id: id})
        })
    } 
    
    const getOne = (req, res) => {
        let article_id = parseInt(req.params.article_id);
    
        articles.getArticle(article_id, (err ,result) => {
            if (err == 404) {
                console.log(err)
                return res.sendStatus(404)

            }

                
            return res.status(200).send(result);
        })

        
    
    
    
    } 

    const editArticle = (req, res, next) => {
        let article_id = parseInt(req.params.article_id);

        articles.getArticle(article_id, (err, result) => {
            if(err === 404) return res.sendStatus(404);
            if (err) return res.sendStatus(500);

            const schema = Joi.object({
                "title": Joi.string(),
                "article_text": Joi.string(),
                "author": Joi.string()
            })

            const { error } = schema.validate(req.body);
            if(error) return res.status(400).send(error.details[0].message);

            if(req.body.hasOwnProperty("title")){
                result.title = req.body.title
            }
            if(req.body.hasOwnProperty("article_text")){
                result.article_text = req.body.article_text
            }
            if(req.body.hasOwnProperty("author")){
                result.author = req.body.author
            }
            articles.editArticle(article_id, result, (err, id) => {
                if (err){
                    console.log(err)
                    return res.sendStatus(500)
                }
            })
        })
    }

    const deleteArticle = (req, res, next) => {
        let id = parseInt(req.params.article_id);
        if (!validator.isValidId(id)) return res.sendStatus(404);
    
        users.check_user_exists(id, function(err, result){
            if(err){
                log.warn(`articles-controller.deleteArticle: ${JSON.stringify(err)}`);
                return res.sendStatus(404); 
            }
    
            let token = req.get(config.get('authToken'));
            users.getIdFromToken(token, function(err, _id){
                if(err){
                    log.warn(`articles-controller.deleteArticle: ${JSON.stringify(err)}`);
                    return res.sendStatus(500); 
                }
                
                articles.deleteArticle(_id, id, function(err){
                    if(err){
                        log.warn(`articles-controller.deleteArticle: ${JSON.stringify(err)}`);
                        return res.sendStatus(500); 
                    }
    
                    return res.sendStatus(200);
                })
    
            });
        });
    }


    module.exports = {
        getAll: getAll,
        create: create,
        getOne: getOne,
        editArticle: editArticle,
        deleteArticle: deleteArticle
    };   
