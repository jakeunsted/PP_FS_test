/**
 * FavouriteLocationController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const FavouriteLocation = require('../models/FavouriteLocation');

module.exports = {
  /**
   * Add a location to a user's favourites.
   * POST /api/favourites
   * Body: { userIdentifier: 'string', cityName: 'string', latitude: number, longitude: number, country?: 'string' }
   */
  create: async function (req, res) {
    try {
      const { userIdentifier, cityName, latitude, longitude, country } = req.allParams();

      if (!userIdentifier || !cityName || typeof latitude === 'undefined' || typeof longitude === 'undefined') {
        return res.badRequest('Missing required parameters: userIdentifier, cityName, latitude, longitude.');
      }

      // Optional: Check for duplicates before creating
      const existingFavourite = await FavouriteLocation.findOne({
        userIdentifier,
        latitude,
        longitude,
      });

      if (existingFavourite) {
        // You could return the existing one, or an error indicating it's already a favourite.
        return res.status(409).json({ message: 'This location is already in your favourites.', favourite: existingFavourite });
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
      return res.serverError(err);
    }
  },

  /**
   * Get all favourite locations for a specific user.
   * GET /api/favourites?userIdentifier=:userIdentifier
   */
  find: async function (req, res) {
    try {
      const userIdentifier = req.param('userIdentifier');
      if (!userIdentifier) {
        return res.badRequest('userIdentifier query parameter is required.');
      }

      const favourites = await FavouriteLocation.find({ userIdentifier });
      return res.ok(favourites);
    } catch (err) {
      return res.serverError(err);
    }
  },

  /**
   * Remove a location from a user's favourites.
   * DELETE /api/favourites/:id?userIdentifier=:userIdentifier
   * We use userIdentifier in query to ensure a user can only delete their own favourites.
   */
  destroy: async function (req, res) {
    try {
      const favouriteId = req.param('id');
      const userIdentifier = req.param('userIdentifier'); // Crucial for security

      if (!userIdentifier) {
        return res.badRequest('userIdentifier query parameter is required for deletion.');
      }
      if (!favouriteId) {
        return res.badRequest('Favourite ID is required for deletion.');
      }

      const deletedFavourite = await FavouriteLocation.destroyOne({
        id: favouriteId,
        userIdentifier: userIdentifier, // Ensure the favourite belongs to the user
      });

      if (!deletedFavourite) {
        return res.status(404).json({ message: 'Favourite not found or you do not have permission to delete it.' });
      }

      return res.ok({ message: 'Favourite removed successfully.', id: favouriteId });
    } catch (err) {
      return res.serverError(err);
    }
  },
};
