<template>
  <v-card outlined>
    <v-card-title class="d-flex justify-space-between align-center">
      <span>Weather for {{ weatherData.city }}</span>
      <v-btn 
        :icon="isFavourite ? 'mdi-heart' : 'mdi-heart-outline'" 
        variant="text" 
        :color="isFavourite ? 'pink' : 'grey'" 
        @click="toggleFavourite" 
        :title="isFavourite ? 'Remove from favourites' : 'Add to favourites'"
      >
      </v-btn>
    </v-card-title>
    <v-list-item>
      <v-list-item-title class="text-h5">{{ weatherData.temperature }}°C</v-list-item-title>
      <v-list-item-subtitle>{{ weatherData.condition }}</v-list-item-subtitle>
      <v-list-item-subtitle>Cloud Cover: {{ weatherData.cloudCover }}%</v-list-item-subtitle>
      <v-list-item-subtitle>Humidity: {{ weatherData.humidity }}%</v-list-item-subtitle>
    </v-list-item>
  </v-card>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth';
import { useFavouritesStore } from '../stores/favourites';
import { navigateTo } from 'nuxt/app';
import { ref, onMounted } from 'vue';

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
const favouritesStore = useFavouritesStore();
const isFavourite = ref(false);

async function toggleFavourite() {
  if (!props.weatherData) return;
  if (!authStore.isLoggedIn) {
    navigateTo('/login');
    return;
  }

  try {
    const userId = authStore.user!.id;
    
    if (isFavourite.value) {
      const favourite = favouritesStore.favourites.find(fav => 
        fav.latitude === props.weatherData.latitude && 
        fav.longitude === props.weatherData.longitude
      );
      if (favourite) {
        await favouritesStore.removeFavourite(userId, favourite.id);
      }
    } else {
      await favouritesStore.addFavourite(userId, props.weatherData);
    }
    
    isFavourite.value = !isFavourite.value;
  } catch (error) {
    console.error('Error toggling favourite:', error);
  }
}

// Check if this location is already a favourite when the component mounts
async function checkIfFavourite() {
  if (!authStore.isLoggedIn || !props.weatherData) return;
  
  try {
    const userId = authStore.user!.id;
    await favouritesStore.fetchFavourites(userId);
    isFavourite.value = favouritesStore.isFavourite(props.weatherData);
  } catch (error) {
    console.error('Error checking favourite status:', error);
  }
}

onMounted(() => {
  checkIfFavourite();
});
</script> 