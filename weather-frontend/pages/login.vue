<template>
  <v-container fluid class="min-h-screen p-0 m-0">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="10" md="8" lg="6" xl="4">
        <v-card class="pa-sm-6 pa-md-8 mt-10" elevation="3">
          <v-card-title class="text-h4 font-weight-bold text-center mb-2 primary--text">
            Login
          </v-card-title>
          <v-card-subtitle class="text-center mb-6">
            Sign in to your account
          </v-card-subtitle>

          <v-form @submit.prevent="handleLogin">
            <v-text-field
              :model-value="email"
              @update:model-value="email = $event"
              label="Email address"
              type="email"
              required
              variant="filled"
              class="mb-3"
              persistent-placeholder
              autocomplete="email"
            ></v-text-field>
            <v-text-field
              :model-value="password"
              @update:model-value="password = $event"
              label="Password"
              type="password"
              required
              variant="filled"
              class="mb-3"
              persistent-placeholder
              autocomplete="current-password"
            ></v-text-field>

            <v-alert
              v-if="errorMessage"
              type="error"
              dense
              dismissible
              class="mb-3"
            >
              {{ errorMessage }}
            </v-alert>

            <v-btn
              type="submit"
              color="primary"
              block
              size="large"
              :loading="loading"
              :disabled="loading"
              class="mt-1"
            >
              {{ loading ? 'Logging in...' : 'Login' }}
            </v-btn>

            <div class="text-center mt-4">
              <p class="text-body-2">
                Don't have an account?
                <NuxtLink to="/register" class="text-primary text-decoration-none">
                  Register here
                </NuxtLink>
              </p>
            </div>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
// @ts-ignore
import { useRouter, navigateTo } from '#imports';
import { useRuntimeConfig } from 'nuxt/app';
import { useAuthStore } from '../stores/auth';

const email = ref('');
const password = ref('');
const errorMessage = ref<string | null>(null);
const loading = ref(false);
const config = useRuntimeConfig();
const authStore = useAuthStore();
const router = useRouter();

async function handleLogin() {
  loading.value = true;
  errorMessage.value = null;
  try {
    const response = await $fetch<{ message: string; user: any }>(`${config.public.apiBase}/auth/login`, {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value,
      },
      credentials: 'include',
    });

    console.log('Login successful:', response.user);
    await authStore.setUser(response.user);
    
    try {
      console.log('Attempting navigation...');
      await navigateTo('/', { replace: true });
      console.log('Navigation completed');
    } catch (navigationError) {
      console.error('Navigation error:', navigationError);
      try {
        console.log('Falling back to router.push...');
        await router.push('/');
        console.log('Router push completed');
      } catch (fallbackError) {
        console.error('Fallback navigation error:', fallbackError);
        errorMessage.value = 'Login successful but failed to redirect. Please try refreshing the page.';
      }
    }
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