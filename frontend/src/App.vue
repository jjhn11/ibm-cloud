<script setup>
import { useUserStore } from '@/stores/userStore';
import { RouterView, useRoute } from 'vue-router';
import { computed } from 'vue';
import AppBar from '@/components/AppBar.vue';

const userStore = useUserStore();
const route = useRoute();

const isLoginView = computed(() => route.name === 'login' || route.name === 'register');

async function initApp() {

  const userStore = useUserStore();
  if (!userStore.isAuthenticated) {
    return;
  }
  await userStore.fetchCurrentUser(); // fills user if session cookie is valid
}

initApp();
</script> 

<template>
  <v-app>
    <AppBar v-if="!isLoginView" />
    <v-main>
        <RouterView />
    </v-main>
  </v-app>
</template>

<style scoped>

</style>
