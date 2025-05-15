<template>
  <v-app>
    <v-app-bar color="primary">
      <v-app-bar-title>Weather App</v-app-bar-title>
      
      <v-spacer></v-spacer>
      
      <v-btn to="/" text>Home</v-btn>
      <v-btn v-if="authStore.isLoggedIn" to="/favourites" text>Favourites</v-btn>
      
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
          <template v-if="authStore.isLoggedIn">
            <v-list-item>
              <v-list-item-title class="text-subtitle-2">
                {{ authStore.user?.email }}
              </v-list-item-title>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item @click="handleLogout">
              <v-list-item-title>Logout</v-list-item-title>
            </v-list-item>
          </template>
          <template v-else>
            <v-list-item to="/login">
              <v-list-item-title>Login</v-list-item-title>
            </v-list-item>
            <v-list-item to="/register">
              <v-list-item-title>Register</v-list-item-title>
            </v-list-item>
          </template>
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