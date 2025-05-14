import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();

  const protectedRoutes = ['/'];
  const publicRoutes = ['/login', '/register'];

  if (protectedRoutes.includes(to.path) && !authStore.isLoggedIn) {
    return navigateTo('/login');
  }

  if (publicRoutes.includes(to.path) && authStore.isLoggedIn) {
    return navigateTo('/');
  }
});