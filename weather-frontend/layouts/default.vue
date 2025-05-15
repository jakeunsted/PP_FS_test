<template>
  <v-app>
    <v-app-bar color="primary">
      <v-app-bar-title>Weather App</v-app-bar-title>
      
      <v-spacer></v-spacer>
      
      <v-btn to="/" text>Home</v-btn>
      <v-btn v-if="authStore.isLoggedIn" to="/favourites" text>Favourites</v-btn>
      
      <!-- Auth Button -->
      <v-btn
        v-if="authStore.isLoggedIn"
        @click="handleLogout"
      >
        Logout
      </v-btn>
      <v-btn
        v-else
        to="/login"
      >
        Login
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container>
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
}
</script> 