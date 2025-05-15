<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card>
          <v-card-title class="text-center">Register</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="handleRegister">
              <v-text-field
                v-model="fullName"
                label="Full Name"
                prepend-inner-icon="mdi-account"
              ></v-text-field>
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
              <v-text-field
                v-model="confirmPassword"
                label="Confirm Password"
                type="password"
                required
                prepend-inner-icon="mdi-lock-check"
              ></v-text-field>
              <v-alert v-if="errorMessage" type="error" dense class="mb-4">
                {{ errorMessage }}
              </v-alert>
              <v-alert v-if="successMessage" type="success" dense class="mb-4">
                {{ successMessage }}
              </v-alert>
              <v-btn type="submit" color="primary" block :loading="loading">Register</v-btn>
            </v-form>
          </v-card-text>
          <v-card-actions class="justify-center">
            <p>
              Already have an account? <nuxt-link to="/login">Login here</nuxt-link>
            </p>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useRuntimeConfig } from 'nuxt/app';

const fullName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const loading = ref(false);
const router = useRouter();
const config = useRuntimeConfig();

async function handleRegister() {
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match.';
    return;
  }
  loading.value = true;
  errorMessage.value = null;
  successMessage.value = null;

  try {
    const response = await $fetch<{ message: string; user: any }>(`${config.public.apiBase}/auth/register`, {
      method: 'POST',
      body: {
        fullName: fullName.value,
        email: email.value,
        password: password.value,
      },
      credentials: 'include'
    });

    successMessage.value = response.message + " Redirecting to login...";
    setTimeout(() => {
      router.push('/login');
    }, 2000);

  } catch (error: any) {
    console.error('Registration error:', error);
    if (error.data && error.data.error) {
      errorMessage.value = error.data.error;
    } else {
      errorMessage.value = 'Registration failed. Please try again.';
    }
  } finally {
    loading.value = false;
  }
}
</script>