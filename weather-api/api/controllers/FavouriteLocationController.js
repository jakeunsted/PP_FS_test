/**
 * FavouriteLocationController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  /**
   * Add a location to a user's favourites.
   * Expected route: POST /api/favourites
   * Expected body: {
   * userIdentifier: 'some-unique-id-for-the-user',
   * cityName: 'London',
   * latitude: 51.5074,
   * longitude: -0.1278,
   * country: 'GB'
   * }
   */
  create: async function (req, res) {
    try {
      const { userIdentifier, cityName, latitude, longitude, country } = req.allParams();

      if (!userIdentifier || !cityName || typeof latitude === 'undefined' || typeof longitude === 'undefined') {
        return res.badRequest('Missing required parameters: userIdentifier, cityName, latitude, and longitude are required.');
      }

      // Check if this location is already a favourite for this user
      const existingFavourite = await FavouriteLocation.findOne({
        userIdentifier,
        latitude,
        longitude,
      });

      if (existingFavourite) {
        return res.status(412).json({ message: 'This location is already in your favourites.', favourite: existingFavourite });
      }

      const newFavourite = await FavouriteLocation.create({
        userIdentifier,
        cityName,
        latitude,
        longitude,
        country,
      }).fetch();

      return res.status(201).json(newFavourite);
    } catch (err) {
      sails.log.error('Error in FavouriteLocationController.create:', err);
      return res.serverError(err);
    }
  },

  /**
   * Get all favourite locations for a specific user.
   * Expected route: GET /api/favourites?userIdentifier=:identifier
   */
  find: async function (req, res) {
    try {
      const userIdentifier = req.param('userIdentifier');
      if (!userIdentifier) {
        return res.badRequest('The "userIdentifier" query parameter is required.');
      }

      const favourites = await FavouriteLocation.find({ userIdentifier });
      return res.ok(favourites);
    } catch (err) {
      sails.log.error('Error in FavouriteLocationController.find:', err);
      return res.serverError(err);
    }
  },

  /**
   * Remove a location from a user's favourites.
   * Expected route: DELETE /api/favourites/:id?userIdentifier=:identifier
   * The :id is the ID of the favourite record itself.
   * The userIdentifier in the query is for an extra check to ensure a user only deletes their own items.
   */
  destroy: async function (req, res) {
    try {
      const favouriteId = req.param('id');
      const userIdentifier = req.param('userIdentifier'); // For verification

      if (!favouriteId) {
        return res.badRequest('Favourite ID (/:id) is required for deletion.');
      }
      if (!userIdentifier) {
        return res.badRequest('The "userIdentifier" query parameter is required for verification.');
      }

      const favouriteToRemove = await FavouriteLocation.findOne({ id: favouriteId, userIdentifier });

      if (!favouriteToRemove) {
        return res.status(404).json({ message: 'Favourite not found for this user or it does not exist.' });
      }

      await FavouriteLocation.destroyOne({ id: favouriteId });

      return res.ok({ message: 'Favourite removed successfully.', id: favouriteId });
    } catch (err) {
      sails.log.error('Error in FavouriteLocationController.destroy:', err);
      return res.serverError(err);
    }
  },
};
