/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {

  // Favourite Locations
  'POST /api/favourites': 'FavouriteLocationController.create',
  'GET /api/favourites': 'FavouriteLocationController.find',
  'DELETE /api/favourites/:id': 'FavouriteLocationController.destroy',

  // Authentication routes
  'POST /api/auth/register': 'AuthController.register',
  'POST /api/auth/login': 'AuthController.login',
  'POST /api/auth/logout': 'AuthController.logout',
  'GET /api/auth/me': 'AuthController.me',


};
