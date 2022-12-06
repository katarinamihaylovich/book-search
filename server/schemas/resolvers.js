const { AuthenicationError } = require('apollo-server-express');
const { User } = require('../models');
const {signToken} = require('../utils/auth');

const resolvers = {
    Query: {
       me: async (parent, args, context) => {
        if (context.user) {
            const user = await User.findOne({ _id: context.user._id })
            return user;
        }
        throw new AuthenicationError("You are not logged in.")
       }, 
    },

    Mutation: {
        createUser: async (parent, { username, email, password}) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user);
            return {token, user};
        },
        login: async (parent, {email, password}) => {
            const user = await User.findOne({email});

            if (!user) {
                throw new AuthenicationError("Your email is incorrect.")
            }

            const realPassword = await user.isCorrectPassword(password);

            if (!realPassword) {
                throw new AuthenicationError("Your password is incorrect");
            }

            const token = signToken(user);
            return { token, user };
        },
        saveBook: async (parent, {bookData}, context) => {
            if (context.user) {
                const updateUser = await User.findByIdAndUpdate(
                    {_id: context.user._id},
                    {$push: {savedBooks: bookData }},
                    {new: true}
                )

                return updateUser;
            }
            throw new AuthenicationError("Login error.")
        },
        removeBook: async (parent, {bookId}, context) => {
            if (context.user) {
                console.log(bookId);
                const updateUser = await User.findOneAndUpdate(
                    {_id: context.user._id},
                    {$pull: { savedBooks: {bookId}}},
                    {new: true}
                )
                return updateUser;
            }
            throw new AuthenicationError("Login error.")
        }
    }
}

module.exports = resolvers;
