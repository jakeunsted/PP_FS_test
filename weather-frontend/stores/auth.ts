import { defineStore } from 'pinia';
import { useRuntimeConfig } from '#imports';
import { $fetch } from 'ofetch';

interface User {
  id: string;
  email: string;
  fullName?: string;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    isLoggedIn: false,
  }),
  actions: {
    setUser(userData: User | null) {
      this.user = userData;
      this.isLoggedIn = !!userData;
      if (!userData) {
        // logout
        this.logout();
      }
    },
    async fetchCurrentUser() {
      if (this.isLoggedIn) return;

      const config = useRuntimeConfig();
      try {
        const { user } = await $fetch<{ user: User }>(`${config.public.apiBase}/auth/me`, {
          credentials: 'include'
        });
        this.setUser(user);
      } catch (error) {
        this.setUser(null);
        console.warn('Not logged in or session expired.');
      }
    },
    async logout() {
      const config = useRuntimeConfig();
      try {
        await $fetch(`${config.public.apiBase}/auth/logout`, {
          method: 'POST',
          credentials: 'include'
        });
      } catch (error) {
        console.error('Error during logout API call:', error);
      } finally {
        this.setUser(null);
        // Navigate to login or home page
        const router = useRouter();
        router.push('/login');
      }
    },
  },
});