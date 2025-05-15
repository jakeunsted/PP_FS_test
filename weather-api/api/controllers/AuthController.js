/**
 * AuthController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const bcrypt = require('bcryptjs');

module.exports = {
  /**
   * Register a new user
   * POST /api/auth/register
   * Params: email, password, fullName (optional)
   */
  register: async function (req, res) {
    try {
      const { email, password, fullName } = req.allParams();

      if (!email || !password) {
        return res.badRequest({ error: 'Email and password are required.' });
      }

      // Password validation
      if (password.length < 8) {
        return res.badRequest({ error: 'Password must be at least 8 characters long.' });
      }

      const newUser = await User.create({ email, password, fullName }).fetch();

      req.session.userId = newUser.id;
      req.session.userEmail = newUser.email;

      // Return user info (excluding password)
      const userResponse = { ...newUser };
      delete userResponse.password;

      return res.status(201).json({
        message: 'User registered and logged in successfully.',
        user: userResponse
      });

    } catch (err) {
      if (err.name === 'UsageError') {
        if (err.code === 'E_UNIQUE') {
          return res.status(409).json({ error: 'Email address is already taken.' });
        }
        return res.badRequest({ error: err.message });
      }
      sails.log.error('Registration error:', err);
      return res.serverError({ error: 'Failed to register user.' });
    }
  },

  /**
   * Log in an existing user
   * POST /api/auth/login
   * Params: email, password
   */
  login: async function (req, res) {
    try {
      const { email, password } = req.allParams();

      if (!email || !password) {
        return res.badRequest({ error: 'Email and password are required.' });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      // User authenticated, create a session
      req.session.userId = user.id;
      req.session.userEmail = user.email;

      // Return user info (excluding password)
      const userResponse = { ...user };
      delete userResponse.password;

      return res.ok({
        message: 'Login successful.',
        user: userResponse
      });

    } catch (err) {
      sails.log.error('Login error:', err);
      return res.serverError({ error: 'Failed to login.' });
    }
  },

  /**
   * Log out the current user
   * POST /api/auth/logout
   */
  logout: async function (req, res) {
    if (!req.session.userId) {
      return res.ok({ message: 'You are not logged in.' });
    }
    req.session.destroy((err) => {
      if (err) {
        sails.log.error('Logout error:', err);
        return res.serverError({ error: 'Failed to logout.' });
      }
      return res.ok({ message: 'Logout successful.' });
    });
  },

  /**
   * Get the current logged-in user's details (if any)
   * GET /api/auth/me
   */
  me: async function (req, res) {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated. No active session.' });
    }
    try {
      const user = await User.findOne({ id: req.session.userId });
      if (!user) {
        req.session.destroy();
        return res.status(401).json({ error: 'User not found for current session. Session terminated.' });
      }

      const userResponse = { ...user };
      delete userResponse.password;
      return res.ok({ user: userResponse });

    } catch (err) {
      sails.log.error('Error fetching current user (/me):', err);
      return res.serverError({ error: 'Failed to retrieve user details.' });
    }
  }
};
