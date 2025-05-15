import { defineStore } from 'pinia';
import { useRuntimeConfig } from 'nuxt/app';

interface FavouriteLocation {
  id: string;
  user: string;
  cityName: string;
  latitude: number;
  longitude: number;
  country?: string;
}

interface WeatherInfo {
  city: string;
  latitude: number;
  longitude: number;
  temperature: number;
  condition: string;
}

export const useFavouritesStore = defineStore('favourites', {
  state: () => ({
    favourites: [] as FavouriteLocation[],
    loading: false,
    error: null as string | null,
  }),

  getters: {
    isFavourite: (state) => (weatherData: WeatherInfo) => {
      return state.favourites.some(fav => 
        fav.latitude === weatherData.latitude && 
        fav.longitude === weatherData.longitude
      );
    },
  },

  actions: {
    async fetchFavourites(userId: string) {
      const config = useRuntimeConfig();
      this.loading = true;
      this.error = null;

      try {
        const favourites = await $fetch<FavouriteLocation[]>(`${config.public.apiBase}/favourites`, {
          params: { userId },
          credentials: 'include'
        });
        this.favourites = favourites;
      } catch (error: any) {
        console.error('Error fetching favourites:', error);
        this.error = error.message || 'Failed to fetch favourites';
      } finally {
        this.loading = false;
      }
    },

    async addFavourite(userId: string, weatherData: WeatherInfo) {
      const config = useRuntimeConfig();
      this.loading = true;
      this.error = null;

      try {
        const newFavourite = await $fetch<FavouriteLocation>(`${config.public.apiBase}/favourites`, {
          method: 'POST',
          body: {
            userId,
            cityName: weatherData.city,
            latitude: weatherData.latitude,
            longitude: weatherData.longitude
          },
          credentials: 'include'
        });
        this.favourites.push(newFavourite);
        return true;
      } catch (error: any) {
        console.error('Error adding favourite:', error);
        this.error = error.message || 'Failed to add favourite';
        return false;
      } finally {
        this.loading = false;
      }
    },

    async removeFavourite(userId: string, cityName: string) {
      const config = useRuntimeConfig();
      this.loading = true;
      this.error = null;

      try {
        await $fetch(`${config.public.apiBase}/favourites/${cityName}`, {
          method: 'DELETE',
          params: { userId },
          credentials: 'include'
        });
        this.favourites = this.favourites.filter(fav => fav.cityName !== cityName);
        return true;
      } catch (error: any) {
        console.error('Error removing favourite:', error);
        this.error = error.message || 'Failed to remove favourite';
        return false;
      } finally {
        this.loading = false;
      }
    },

    clearFavourites() {
      this.favourites = [];
      this.error = null;
    }
  }
}); 