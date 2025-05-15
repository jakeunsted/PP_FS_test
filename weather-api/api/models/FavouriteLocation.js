/**
 * FavouriteLocation.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    user: {
      model: 'user',
      required: true,
      description: 'The user who added this location to favorites'
    },
    cityName: {
      type: 'string',
      required: true,
      description: 'Name of the city'
    },
    latitude: {
      type: 'number',
      required: true,
      description: 'Latitude coordinate of the location'
    },
    longitude: {
      type: 'number',
      required: true,
      description: 'Longitude coordinate of the location'
    },
    country: {
      type: 'string',
      allowNull: true,
      description: 'Country code of the location'
    }
  },

};

