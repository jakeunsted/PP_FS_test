<template>
  <v-container fluid class="min-h-screen p-0 m-0">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="10" md="8" lg="6" xl="4">
        <v-card class="pa-sm-6 pa-md-8 mt-10" elevation="3">
          <v-card-title class="text-h4 font-weight-bold text-center mb-2 primary--text">
            Weather Search
          </v-card-title>
          <v-card-subtitle class="text-center mb-6">
            Search for current weather and forecasts.
          </v-card-subtitle>

          <v-form @submit.prevent="performSearch">
            <v-text-field
              v-model="searchQuery"
              label="Enter city name (e.g., London, Tokyo)"
              variant="solo-filled"
              density="comfortable"
              prepend-inner-icon="mdi-magnify"
              clearable
              autofocus
              class="mb-3"
              hide-details="auto"
              :rules="[rules.required]"
            ></v-text-field>
            <v-btn
              type="submit"
              color="primary"
              block
              size="large"
              :disabled="!searchQuery.trim() || loading"
              :loading="loading"
              class="mt-1"
            >
              Search Weather
            </v-btn>
          </v-form>

          <div class="mt-6">
            <v-alert v-if="searchError" type="error" dense dismissible v-model="showErrorAlert">
              {{ searchError }}
            </v-alert>

            <div v-if="weatherData" class="mt-4">
              <WeatherCard :weather-data="weatherData" />
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRuntimeConfig } from 'nuxt/app';
import WeatherCard from '../components/WeatherCard.vue';

const authStore = useAuthStore();
const config = useRuntimeConfig(); // To get API base URL
const searchQuery = ref('');
const loading = ref(false);
const searchError = ref<string | null>(null);
const showErrorAlert = ref(false);

interface WeatherInfo {
  city: string;
  latitude: number;
  longitude: number;
  temperature: number;
  condition: string;
}
const weatherData = ref<WeatherInfo | null>(null);

const rules = {
  required: (value: string) => !!value.trim() || 'City name is required.',
};

watch(searchError, (newValue) => {
  showErrorAlert.value = !!newValue;
});

async function performSearch() {
  if (!searchQuery.value.trim()) {
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
      body: JSON.stringify({ cityName: searchQuery.value.trim() })
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
      condition: weatherInfo.condition
    };
  } catch (error: any) {
    console.error('Search error:', error);
    searchError.value = `Could not find weather for "${searchQuery.value}". Please try another city.`;
  } finally {
    loading.value = false;
  }
}

import { onMounted } from 'vue';
onMounted(async () => {
  if (!authStore.isLoggedIn) {
    await authStore.fetchCurrentUser();
  }
});
</script>

<style scoped>
/* Removed fill-height class as it's no longer needed */
</style>