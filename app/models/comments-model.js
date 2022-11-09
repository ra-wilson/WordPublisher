 const Joi = require('Joi');
 const comments = require('../models/comments-model');


    const create = (req, res, next) => {
        const schema = Joi.object({
            author: Joi.string().required(),
            comment_text: Joi.string().required,
            article_text: Joi.text().required(),


        });
        console.log(schema.validate(req.body));
    
        const { error } = schema.validate(req.body);
         
        console.log(error);
    
        if (error) return res.status(400).send(error.details[0].message);
        
        let article = Object.assign({}, req.body);
    
        item.addNewArticle(article, (error, id) => {
            if (error) return res.sendStatus(500);
            return res.status(201).send({article_id: id})
        })
    } 

    const getAll = (req, res, next) => {
        
    }
    