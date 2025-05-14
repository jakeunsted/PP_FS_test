<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card>
          <v-card-title class="text-center">Login</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="handleLogin">
              <v-text-field
                v-model="email"
                label="Email"
                type="email"
                required
                prepend-inner-icon="mdi-email"
              ></v-text-field>
              <v-text-field
                v-model="password"
                label="Password"
                type="password"
                required
                prepend-inner-icon="mdi-lock"
              ></v-text-field>
              <v-alert v-if="errorMessage" type="error" dense class="mb-4">
                {{ errorMessage }}
              </v-alert>
              <v-btn type="submit" color="primary" block :loading="loading">Login</v-btn>
            </v-form>
          </v-card-text>
          <v-card-actions class="justify-center">
            <p>
              Don't have an account? <nuxt-link to="/register">Register here</nuxt-link>
            </p>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router'; // or #imports for Nuxt 3 auto-import
import { useRuntimeConfig } from 'nuxt/app';

const email = ref('');
const password = ref('');
const errorMessage = ref<string | null>(null);
const loading = ref(false);
const router = useRouter();
const config = useRuntimeConfig(); // To get API base URL

async function handleLogin() {
  loading.value = true;
  errorMessage.value = null;
  try {
    // IMPORTANT: For session-based auth, $fetch needs `credentials: 'include'`
    // to send cookies. This might require specific setup for $fetch or using
    // a custom fetch instance.
    // By default, $fetch might not send cookies cross-origin unless configured.
    // For testing, ensure your Sails API's CORS allows credentials and the origin.
    const response = await $fetch<{ message: string; user: any }>(`${config.public.apiBase}/auth/login`, {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value,
      },
      // If $fetch doesn't automatically handle credentials for cross-origin:
      // headers: { 'Content-Type': 'application/json' },
      // credentials: 'include', // This might not be a direct option for $fetch,
                               // investigate how Nuxt's $fetch handles this or use native fetch / Axios.
                               // For same-origin (if Nuxt proxies API calls), it's simpler.
    });

    console.log('Login successful:', response.user);
    // authStore.setUser(response.user); // Example with Pinia
    // authStore.isLoggedIn = true;
    router.push('/'); // Redirect to homepage or dashboard
  } catch (error: any) {
    console.error('Login error:', error);
    if (error.data && error.data.error) {
      errorMessage.value = error.data.error;
    } else {
      errorMessage.value = 'Login failed. Please try again.';
    }
  } finally {
    loading.value = false;
  }
}
</script>