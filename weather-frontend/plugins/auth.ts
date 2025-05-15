import { useAuthStore } from '../stores/auth';
import type { Pinia } from 'pinia';

export default defineNuxtPlugin(async (nuxtApp) => {
  // Only run on client-side
  if (import.meta.client) {
    const authStore = useAuthStore(nuxtApp.$pinia as Pinia);
    if (!authStore.isLoggedIn) {
      await authStore.fetchCurrentUser();
    }
  }
});