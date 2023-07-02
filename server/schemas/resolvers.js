const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (_, __, context) => {
      if (context.user) {
        // User is authenticated, return the user object
        return User.findOne({ _id: context.user._id });
      }
      throw new AuthenticationError('Not authenticated');
    },
  },
  Mutation: {
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('Invalid credentials');
      }

      const correctPassword = await user.isCorrectPassword(password);

      if (!correctPassword) {
        throw new AuthenticationError('Invalid credentials');
      }

      const token = signToken(user);

      return {        token,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          bookCount: user.bookCount,
          savedBooks: user.savedBooks,
        }
    };
    },
    addUser: async (_, { username, email, password }) => {
      const user = await User.create({ username, email, password });

      if (!user) {
        throw new Error('Something went wrong');
      }

      const token = signToken(user);

      return { token, user };
    },
    saveBook: async (_, { input }, context) => {
        if (context.user) {
          const updatedUser = await User.findOneAndUpdate(
            { _id: context.user._id },
            { $addToSet: { savedBooks: input } },
            { new: true, runValidators: true }
          );
          return updatedUser;
        }
      
        throw new AuthenticationError('Not authenticated');
      }
,      
    removeBook: async (_, { bookId }, context) => {
      if (context.user) {

        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );

        return updatedUser;
      }

      throw new AuthenticationError('Not authenticated');
    },
  },
  User: {
    bookCount: (parent) => {
      return parent.savedBooks.length;
    },
  },
};

module.exports = resolvers;
