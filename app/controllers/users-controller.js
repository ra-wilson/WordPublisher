const Joi = require('joi')

const authUser = (req, res) => {
users.authenticateUser(req.body.email, req.body.password, (err, id) => {
    if (err === 404) return res.status(400).send("Invalid email or password")
    if (err) return res.sendStatus(500)

    users.getToken(id, (err, token) => {
        if (err) return res.sendStatus(500)

        if (token){
            return res.status(200).send({user_id: id, session_token: token})
        }else{
            users.setToken(id, (err, token) => {
                if (err) return res.sendStatus(500)
                return res.status(200).send({user_id: id, session_token: token})
            })
        }      
    })
})
}

const create = (req, res) => {
    users.create(req.body.email, req.body.password, (err, id) => {
        const schema = Joi.object({
            "first_name": Joi.string().required(),
            "last_name": Joi.string().required(),
            "email": Joi.text().required(),
            "password": Joi.text().required()
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
        if (err === 404) return res.status(400).send("Failed to add user")
        users.authenticateUser(req.body.email, req.body.password);
    })
}

const getAll = (req, res) => {

    users.getAllUsers((err, num_rows, results) => {
        if (err) return res.sendStatus(500);
   
        return res.status(200).send(results)
    })

}


users.login = (req, res) => {
    if(!validator.isValidSchema(req.body, 'components.schemas.LoginUser')){
        log.warn(`users.controller.login: bad request ${JSON.stringify(req.body)}`);
        res.status(400).send('Bad Request - request must match the spec');
      } else{
        let email = req.body.email;
        let password = req.body.password;
    
        users.authenticate(email, password, function(err, id){
            //console.log(err, id);
            if(err){
                log.warn("Failed to authenticate: " + err);
                res.status(400).send('Invalid email/password supplied');
            } else {
                users.getToken(id, function(err, token){
                    /// return existing token if already set (don't modify tokens)
                    if (token){
                        return res.send({id: id, token: token});
                    } else {
                        // but if not, complete login by creating a token for the user
                        users.setToken(id, function(err, token){
                            res.send({id: id, token: token});
                        });
                    }
                });
            }
        });
      }
}

module.exports = {
    authUser: authUser,
    create: create,
    getAll, getAll
};   