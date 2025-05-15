import { ref } from 'vue';
import { useRuntimeConfig } from 'nuxt/app';

export interface WeatherInfo {
  city: string;
  latitude: number;
  longitude: number;
  temperature: number;
  humidity: number; // percentage
  cloudCover: number; // percentage
  condition: string;
}

export function useWeatherSearch() {
  const config = useRuntimeConfig();
  const loading = ref(false);
  const searchError = ref<string | null>(null);
  const showErrorAlert = ref(false);
  const weatherData = ref<WeatherInfo | null>(null);

  const rules = {
    required: (value: string) => !value || !value.trim() ? 'City name is required.' : true,
  };

  async function performSearch(searchQuery: string) {
    if (!searchQuery.trim()) {
      searchError.value = 'Please enter a city name.';
      return;
    }
    loading.value = true;
    searchError.value = null;
    weatherData.value = null;

    try {
      // First, geocode the city name
      const geocodeResponse = await fetch(`${config.public.apiBase}/geocode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cityName: searchQuery.trim() })
      });

      if (!geocodeResponse.ok) {
        throw new Error('City not found');
      }

      const locationData = await geocodeResponse.json();

      // Then, fetch the weather data
      const weatherResponse = await fetch(`${config.public.apiBase}/weather?latitude=${locationData.latitude}&longitude=${locationData.longitude}`);
      
      if (!weatherResponse.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const weatherInfo = await weatherResponse.json();

      weatherData.value = {
        city: locationData.city,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        temperature: weatherInfo.temperature,
        humidity: weatherInfo.humidity,
        cloudCover: weatherInfo.cloudCover,
        condition: weatherInfo.condition
      };
    } catch (error: any) {
      console.error('Search error:', error);
      searchError.value = `Could not find weather for "${searchQuery}". Please try another city.`;
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    searchError,
    showErrorAlert,
    weatherData,
    rules,
    performSearch
  };
} 