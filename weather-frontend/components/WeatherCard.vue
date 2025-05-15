<template>
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
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth';

interface WeatherInfo {
  city: string;
  latitude: number;
  longitude: number;
  temperature: number;
  condition: string;
}

const props = defineProps<{
  weatherData: WeatherInfo;
}>();

const authStore = useAuthStore();

async function toggleFavourite() {
  if (!props.weatherData) return;
  if (!authStore.isLoggedIn) {
    // Prompt to login or handle guest identifier
    return;
  }

  const userIdentifier = authStore.isLoggedIn ? authStore.user!.id : '';
  console.log('Toggling favourite for:', props.weatherData.city, 'User ID:', userIdentifier);
}
</script> 