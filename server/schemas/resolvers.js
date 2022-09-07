const { User } = require('../models');
const { signToken } = require('../utils/auth');
const { AuthenticationError } = require("apollo-server-express");

const resolvers = {
    Query: {
        me: async (_, args, { req }) => {
            if (!req.userId) {
                return null;
            }
        },
        Mutation: {
            addUser: async (parent, args) => {
                const user = await User.create(args);
                const token = signToken(user);

                return { token, user };
            },
            login: async (parent, {email, password}) => {
                const user = await User.findOne({ email });

                if (!user) {
                    throw new Error('User not found!');
                }
                const correctPw = await user.isCorrectPassword(password);

                if (!correctPw) {
                    throw new AuthenticationError('Incorrect password!');
                }
                const token = signToken(user);
                return { token, user };
            },
            saveBook: async (parent, {bookId, authers, description, title, image, link}, context) => {
                if (context.user) {
                    const updatedUser = await User.findByIdAndUpdate(
                        { _id: context.user.id },
                        { $addToSet: { savedBooks: {bookId, authors, description, title, image, link}}},
                        { new: true }
                    ).populate('savedBooks');

                    return updatedUser;
                }
                throw new AuthenticationError('Login first!');
            },
            removeBook: async (parent, args, context) => {
                if (context.user) {
                    const updatedUser = await User.findByIdAndUpdate(
                        {_id: context.user,_id },
                        { $addToSet: { savedBooks: args.book }},
                        { new: true }
                    );
                    return updatedUser;
                }
                throw new AuthenticationError("Login first!");
            }
            
        }

    }
};

module.exports = resolvers;