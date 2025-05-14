const axios = require('axios');

module.exports = {
  async getWeather(req, res) {
    try {
      const { latitude, longitude } = req.query;
      
      if (!latitude || !longitude) {
        return res.badRequest('Latitude and longitude are required');
      }

      // Call Open-Meteo API
      const response = await axios.get(`https://api.open-meteo.com/v1/forecast`, {
        params: {
          latitude,
          longitude,
          current: 'temperature_2m,weather_code',
          timezone: 'auto'
        }
      });

      const { current } = response.data;
      
      // Map weather codes to conditions
      const weatherConditions = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Depositing rime fog',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        71: 'Slight snow',
        73: 'Moderate snow',
        75: 'Heavy snow',
        77: 'Snow grains',
        80: 'Slight rain showers',
        81: 'Moderate rain showers',
        82: 'Violent rain showers',
        85: 'Slight snow showers',
        86: 'Heavy snow showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with slight hail',
        99: 'Thunderstorm with heavy hail'
      };

      const weatherData = {
        temperature: current.temperature_2m,
        condition: weatherConditions[current.weather_code] || 'Unknown'
      };

      return res.ok(weatherData);
    } catch (error) {
      sails.log.error('Weather fetch error:', error);
      return res.serverError('Failed to fetch weather data');
    }
  },

  async geocode(req, res) {
    try {
      const { cityName } = req.body;
      
      if (!cityName) {
        return res.badRequest('City name is required');
      }

      // Call Open-Meteo Geocoding API
      const response = await axios.get(`https://geocoding-api.open-meteo.com/v1/search`, {
        params: {
          name: cityName,
          count: 1,
          language: 'en',
          format: 'json'
        }
      });

      if (!response.data.results || response.data.results.length === 0) {
        return res.notFound('City not found');
      }

      const { name, latitude, longitude, country } = response.data.results[0];
      
      return res.ok({
        city: name,
        latitude,
        longitude,
        country
      });
    } catch (error) {
      sails.log.error('Geocoding error:', error);
      return res.serverError('Failed to geocode city');
    }
  }
}; 