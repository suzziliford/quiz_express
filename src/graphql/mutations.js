const { GraphQLString, GraphQLID, GraphQLList, GraphQLNonNull } = require('graphql')
const { User, Quiz, Question } = require('../models')
const bcrypt = require('bcrypt');
const { createJwtToken } = require('../util/auth');
const { QuestionInputType } = require('./types');

const register = {
    type: GraphQLString,
    description: 'Register a new user',
    args: {
        username: {type: GraphQLString},
        email: {type: GraphQLString},
        password: {type: GraphQLString}
    },
    async resolve(parent, args){
        const checkUser = await User.findOne({ email: args.email })
        if (checkUser){
            throw new Error("User with this email address already exists")
        }

        const {username, email, password} = args;

        const passwordHash = await bcrypt.hash(password, 10);

        const user = new User({username, email, password: passwordHash})

        await user.save();

        const token = createJwtToken(user);
        console.log(token)
        return token
    } 
}


const login = {
    type: GraphQLString,
    description: "Log a user in with email and password",
    args: {
        email: {type: GraphQLString},
        password: {type: GraphQLString}
    },
    async resolve(parent, args){
        // Get user from data base based on the email
        const user = await User.findOne({ email: args.email })
        //get the hashed password from the use or set it to an empty string if no user
        const hashedPassword = user?.password ||""
        // returns a boolean if the passwords match
        const correctPassword = await bcrypt.compare(args.password, hashedPassword);
        // if no user of bad password
        if (!user || !correctPassword){
            throw new Error('Invalid Credentials')
        }
        // credential our used bia token
        const token = createJwtToken(user);
        return token
    }
}

const createQuiz = {
    type: GraphQLString,
    description: "Create a new quiz with questions",
    args: {
        title: { type: GraphQLString },
        description: {type: GraphQLString },
        userId: { type: GraphQLID },
        questions: { type: new GraphQLNonNull (new GraphQLList(QuestionInputType)) }
    },
    async resolve(parent, args){
        // Generate a slug for our quiz based on title
        let slugify = args.title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
        /* 
        add a random integer to the end of the slug, check that the slug does not already exist
        if it does, generate a new slug number
        */
       let fullSlug;
       let existingQuiz;
       do {
        let slugId = Math.floor(Math.random() * 10000);
        fullSlug - `${slugify}-${slugId}`;

        existingQuiz = await Quiz.findOne({ slug: fullSlug });
       } while (existingQuiz)

       const quiz = new Quiz({
        title: args.title,
        slug: fullSlug,
        description: args.description,
        userId: args.userId
       })

       quiz.save();
       // loop through all of the questionInputs and create a new Question instance with quiz.id
       for (let question of args.questions){
            // Craete new Question instance with questioninput data nad quaiz id from recently created quiz
            const newQuestion = new Question({
                title: question.title, 
                correctAnswer: question.correctAnswer,
                order: question.order,
                quizId: quiz.id
            })
            //save to the database
            newQuestion.save()
       }

       return quiz.slug
    }
}

module.exports = {
    register,
    login,
    createQuiz,
}