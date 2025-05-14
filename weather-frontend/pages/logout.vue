<template></template>

<script setup>
// @ts-ignore
import { definePageMeta } from '#imports'

definePageMeta({
  layout: 'auth'
})

const authStore = useAuthStore()
authStore.logout()
navigateTo('/login')
</script>