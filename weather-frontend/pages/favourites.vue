<template>
  <v-container>
    <v-row v-if="favouritesStore.loading">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </v-col>
    </v-row>

    <v-row v-else-if="favouritesStore.error">
      <v-col cols="12">
        <v-alert type="error" variant="tonal">
          {{ favouritesStore.error }}
        </v-alert>
      </v-col>
    </v-row>

    <v-row v-else-if="!favouritesStore.favourites.length">
      <v-col cols="12" class="text-center">
        <v-alert type="info" variant="tonal">
          You haven't added any locations to your favourites yet.
        </v-alert>
      </v-col>
    </v-row>

    <!-- Favourites Grid -->
    <v-row v-else>
      <v-col 
        v-for="favourite in favouritesStore.favourites" 
        :key="favourite.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card v-if="weatherData[favourite.id]" class="h-100">
          <v-card-title class="d-flex justify-space-between align-center">
            <span>{{ favourite.cityName }}</span>
            <v-btn
              icon="mdi-heart"
              variant="text"
              color="pink"
              @click="removeFavourite(favourite)"
              title="Remove from favourites"
            ></v-btn>
          </v-card-title>
          <v-card-text>
            <div class="text-h5">{{ weatherData[favourite.id].temperature }}°C</div>
            <div class="text-subtitle-1">{{ weatherData[favourite.id].condition }}</div>
          </v-card-text>
        </v-card>
        <v-card v-else class="h-100">
          <v-card-text class="text-center">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth';
import { useFavouritesStore } from '../stores/favourites';
import { useRuntimeConfig } from 'nuxt/app';
import { ref, onMounted } from 'vue';

interface WeatherData {
  temperature: number;
  condition: string;
}

const authStore = useAuthStore();
const favouritesStore = useFavouritesStore();
const config = useRuntimeConfig();
const weatherData = ref<Record<string, WeatherData>>({});

async function fetchWeatherForFavourite(favourite: any) {
  try {
    const response = await $fetch<WeatherData>(`${config.public.apiBase}/weather`, {
      params: {
        latitude: favourite.latitude,
        longitude: favourite.longitude
      }
    });
    weatherData.value[favourite.id] = response;
  } catch (error) {
    console.error(`Error fetching weather for ${favourite.cityName}:`, error);
  }
}

async function removeFavourite(favourite: any) {
  if (!authStore.isLoggedIn) return;
  
  try {
    const userId = authStore.user!.id;
    await favouritesStore.removeFavourite(userId, favourite.id);
    delete weatherData.value[favourite.id];
  } catch (error) {
    console.error('Error removing favourite:', error);
  }
}

async function loadFavourites() {
  if (!authStore.isLoggedIn) return;
  
  try {
    const userId = authStore.user!.id;
    await favouritesStore.fetchFavourites(userId);
    
    // Fetch weather for each favourite
    for (const favourite of favouritesStore.favourites) {
      await fetchWeatherForFavourite(favourite);
    }
  } catch (error) {
    console.error('Error loading favourites:', error);
  }
}

onMounted(() => {
  loadFavourites();
});
</script>