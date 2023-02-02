const { Console } = require('console');
const jwt = require('jsonwebtoken')
const { nextTick } = require("process");

const unprotectedRoutes = [
    "/auth/register",
    "/auth/login",
    "/graphql"
];

const authenticate = async (req, res, next) => {


    const token = req.cookies?.jwtToken || ""

    try{
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.verifiedUser = verified.user;
        console.log(req);
        next()
    } catch(err){
        
        if (unprotectedRoutes.includes(req.path)){
            next();
        } else {
            res.redirect("/auth/login")
        };
    }

};

module.exports = { authenticate }