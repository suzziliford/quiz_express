const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const { connectDB } = require('./src/db');
const { graphqlHTTP } = require('express-graphql');
const schema = require('./src/graphql/schema');
const { authenticate } = require('./src/middleware/auth')
const cookieParser = require('cookie-parser');

//execute the connectDB funtion to connect to our database
connectDB();

// Basic Middleware
const myLogger = function(req, res, next){
    console.log('MyLogger Middleware')
    console.log(req.path);
    next()
}

//call the app
app.use(myLogger);

// Add Cookie Parser middleware before the authenticate
app.use(cookieParser());

// Add authentication middleware to the app
app.use(authenticate);


app.use('/graphql', graphqlHTTP ({
    schema,
    graphiql: true
}))

app.set('view engine', 'ejs')
//Update the location of the folder for the res.render to use
app.set('views', path.join(__dirname, 'src/templates/views'))

// setup middleware to parse form data and add to req body
app.use(express.urlencoded({ extended: true }));


const initRoutes = require('./src/routes');
initRoutes(app);

app.listen(port, () => {
    console.log(`Server is listening on port${port}`);
});
