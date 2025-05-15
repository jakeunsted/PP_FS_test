<template></template>

<script setup>
const authStore = useAuthStore()
authStore.logout()
navigateTo('/login')
</script>