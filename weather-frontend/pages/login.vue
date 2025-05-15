<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Login</h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email" class="sr-only">Email address</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Password"
            />
          </div>
        </div>

        <div v-if="errorMessage" class="rounded-md bg-red-50 p-4">
          <div class="text-sm text-red-700">{{ errorMessage }}</div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <v-progress-circular
                indeterminate
                color="white"
                size="20"
                width="2"
              ></v-progress-circular>
            </span>
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>
        </div>

        <div class="text-center">
          <p class="text-sm text-gray-600">
            Don't have an account?
            <NuxtLink to="/register" class="font-medium text-indigo-600 hover:text-indigo-500">
              Register here
            </NuxtLink>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
// @ts-ignore
import { useRouter, navigateTo } from '#imports';
import { useRuntimeConfig } from 'nuxt/app';
import { useAuthStore } from '../stores/auth';
// @ts-ignore
import { definePageMeta } from '#imports'

definePageMeta({
  layout: 'auth'
})

const email = ref('');
const password = ref('');
const errorMessage = ref<string | null>(null);
const loading = ref(false);
const config = useRuntimeConfig(); // To get API base URL
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
    
    // Try using navigateTo instead of router.push
    try {
      console.log('Attempting navigation...');
      await navigateTo('/', { replace: true });
      console.log('Navigation completed');
    } catch (navigationError) {
      console.error('Navigation error:', navigationError);
      // Fallback to router.push if navigateTo fails
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