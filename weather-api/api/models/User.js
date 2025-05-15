/**
 * User.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const bcrypt = require('bcryptjs');

module.exports = {

  attributes: {
    id: {
      type: 'string',
      columnName: '_id',
      autoIncrement: true
    },
    email: {
      type: 'string',
      required: true,
      unique: true,
      isEmail: true,
      maxLength: 200,
      example: 'Jake.unsted@example.com'
    },
    password: {
      type: 'string',
      required: true,
      description: 'Securely hashed representation of the user\'s login password.',
      protect: true,
      example: '2$28a8eabna301089103-13948134nad'
    },
    fullName: {
      type: 'string',
      maxLength: 120,
      example: 'Mary Sue van der McHenst'
    },
    favoriteLocations: {
      collection: 'favouritelocation',
      via: 'user'
    },
  },

  beforeCreate: async function (valuesToSet, proceed) {
    if (valuesToSet.password) {
      try {
        const hashedPassword = await bcrypt.hash(valuesToSet.password, 10);
        valuesToSet.password = hashedPassword;
      } catch (err) {
        return proceed(err);
      }
    }
    return proceed();
  },

};

