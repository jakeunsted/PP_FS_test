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

          <v-form @submit.prevent="handleSearch">
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
import { ref, watch, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useWeatherSearch } from '../composables/useWeatherSearch';

const authStore = useAuthStore();
const searchQuery = ref('');
const { loading, searchError, showErrorAlert, weatherData, rules, performSearch } = useWeatherSearch();

watch(searchError, (newValue) => {
  showErrorAlert.value = !!newValue;
});

async function handleSearch() {
  await performSearch(searchQuery.value);
}

onMounted(async () => {
  if (!authStore.isLoggedIn) {
    await authStore.fetchCurrentUser();
  }
});
</script>
