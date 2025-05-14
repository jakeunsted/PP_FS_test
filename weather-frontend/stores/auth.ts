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
    guestUserIdentifier: null as string | null,
  }),
  actions: {
    setUser(userData: User | null) {
      this.user = userData;
      this.isLoggedIn = !!userData;
      if (!userData) {
        // If logging out, clear guest identifier or handle as needed
        // this.guestUserIdentifier = null;
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
    // Generates or retrieves a guest identifier for non-logged-in users to save favourites
    getSetGuestIdentifier(): string {
      if (this.isLoggedIn && this.user) return this.user.id; // If logged in, use their actual ID

      if (import.meta.client) { // Ensure localStorage is available
        let guestId = localStorage.getItem('guestUserIdentifier');
        if (!guestId) {
          guestId = crypto.randomUUID(); // Simple UUID generation
          localStorage.setItem('guestUserIdentifier', guestId);
        }
        this.guestUserIdentifier = guestId;
        return guestId;
      }
      return this.guestUserIdentifier || 'default-guest';
    }
  },
});