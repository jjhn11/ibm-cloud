<script setup>
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { computed } from 'vue';

const userStore = useUserStore();
const router = useRouter();

const userProfile = computed(() => userStore.user);

async function logout() {
  await userStore.logout();
  router.push({ name: 'login' });
}

function navigateTo(route) {
  router.push({ name: route });
}
</script>

<template>
  <v-app-bar app class="px-15">
    <v-row class="align-center" no-gutters>
      <v-col cols="4" class="d-flex align-center">
          <div class="icon-background rounded-lg pa-1">
            <v-icon size="30" color="white">mdi-account-supervisor-outline</v-icon>
          </div>
        
        <v-toolbar-title class="ml-3">
          <span class="font-weight-bold">Social Connect</span>
        </v-toolbar-title>
      </v-col>

      <v-col cols="2" class="d-flex align-center" @click="navigateTo('home')" style="cursor: pointer;">
          <v-icon>mdi-home-outline</v-icon>
          <span class="ml-3">Inicio</span>
      </v-col>

      <v-col cols="2" class="d-flex align-center">
        <v-badge content="3" color="error">
          <v-icon>mdi-chat-outline</v-icon>
        </v-badge>
          <p class="ml-3">Mensajes</p>
      </v-col>

    </v-row>
    
  
    <v-spacer />
    <v-menu transition="fade-transition">
      <template #activator="{ props }"> 
        <div v-bind="props" class="avatar-wrapper">
          <v-avatar size="40" color="primary">
            <v-img :src="userProfile.photoUrl" alt="Perfil" cover />
          </v-avatar>
          <v-icon size="16" class="menu-indicator">mdi-menu-down</v-icon>
        </div>
      </template>

      <v-list density="compact">
        <v-list-item title="Perfil" prepend-icon="mdi-account-circle" @click="navigateTo('profile')"/>
        
        <v-list-item title="Configuración" prepend-icon="mdi-cog-outline" />
        <v-divider />
        <v-list-item title="Cerrar sesión" prepend-icon="mdi-logout" @click="logout"/>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<style scoped>
.icon-background {
  background-color: black; /* Primary color */
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.profile-trigger {
  min-width: 0;
}

.avatar-wrapper {
  position: relative;
  display: inline-flex;
}

.menu-indicator {
  position: absolute;
  right: -2px;
  bottom: -2px;
  background-color: #ffffff;
  border-radius: 50%;
  padding: 2px;
  color: #1976d2;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}
</style>
