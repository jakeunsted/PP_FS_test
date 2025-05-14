<template>
  <v-container fluid class="fill-height pa-0 ma-0" style="background-color: #f0f2f5;"> <v-row align="center" justify="center" class="fill-height">
      <v-col cols="12" sm="10" md="8" lg="6" xl="4">
        <v-card class="pa-sm-6 pa-md-8" elevation="3">
          <div class="text-right mb-n2" v-if="authStore.isLoggedIn">
            <v-chip small color="primary" outlined @click="router.push('/favourites')">
              <v-icon start icon="mdi-heart"></v-icon>
              Favourites
            </v-chip>
          </div>
          <v-card-title class="text-h4 font-weight-bold text-center mb-2 primary--text">
            Weather Search
          </v-card-title>
          <v-card-subtitle v-if="authStore.user" class="text-center mb-6">
            Welcome, {{ authStore.user.fullName || authStore.user.email }}!
          </v-card-subtitle>
          <v-card-subtitle v-else class="text-center mb-6">
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
              <v-card outlined>
                <v-card-title class="d-flex justify-space-between align-center">
                  <span>Weather for {{ weatherData.city }}</span>
                  <v-btn icon="mdi-heart-outline" variant="text" color="pink" @click="toggleFavourite" title="Add to favourites">
                    </v-btn>
                </v-card-title>
                <v-list-item>
                  <v-list-item-title class="text-h5">{{ weatherData.temperature }}°C</v-list-item-title>
                  <v-list-item-subtitle>{{ weatherData.condition }}</v-list-item-subtitle>
                  </v-list-item>
                </v-card>
            </div>
          </div>

          <div class="text-center mt-8" v-if="authStore.isLoggedIn">
            <v-btn @click="handleLogout" color="grey" variant="text">
              <v-icon start icon="mdi-logout"></v-icon>Logout
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const router = useRouter();

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
    const geocodeResponse = await fetch('/api/geocode', {
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
    const weatherResponse = await fetch(`/api/weather?latitude=${locationData.latitude}&longitude=${locationData.longitude}`);
    
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

async function toggleFavourite() {
  if (!weatherData.value) return;
  if (!authStore.isLoggedIn && !authStore.guestUserIdentifier) {
    // Prompt to login or handle guest identifier
    searchError.value = "Please login to save favourites, or enable guest favourites.";
    return;
  }

  const userIdentifier = authStore.isLoggedIn ? authStore.user!.id : authStore.getSetGuestIdentifier();
  console.log('Toggling favourite for:', weatherData.value.city, 'User/Guest ID:', userIdentifier);
  // TODO: Implement API call to POST /api/favourites
  // body: { userIdentifier, cityName, latitude, longitude, country (optional) }
  // Handle success/error, update UI to show if it's favourited
}

async function handleLogout() {
  await authStore.logout();
  // Middleware should handle redirect, or you can force it:
  // router.push('/login');
}

// Attempt to fetch user if navigating directly to this page and state isn't hydrated
// The auth plugin should handle this on initial load, but this is a safety net for direct nav / refresh.
import { onMounted } from 'vue';
onMounted(async () => {
  if (process.client && !authStore.isLoggedIn) {
    await authStore.fetchCurrentUser();
    // If still not logged in after fetch, the middleware should kick in on next interaction or if it re-runs
  }
});
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}
/* Add any additional styling if needed */
</style>