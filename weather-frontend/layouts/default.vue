<template>
  <v-app>
    <v-app-bar color="primary">
      <v-app-bar-title>Weather App</v-app-bar-title>
      
      <v-spacer></v-spacer>
      
      <v-btn to="/" text>Home</v-btn>
      <v-btn to="/favourites" text>Favourites</v-btn>
      
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn
            icon
            v-bind="props"
          >
            <v-icon>mdi-account</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="handleLogout">
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
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