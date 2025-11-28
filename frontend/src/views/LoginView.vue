<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import backend from '@/config/axios.js';

const router = useRouter();
const loading = ref(true);
const error = ref(null);
const isAuthenticated = ref(false);

// Check authentication status
async function checkAuth() {
  loading.value = true;
  error.value = null;
  
  try {
    // Try to get current user from backend
    const response = await backend.get('/api/users/me');
    
    if (response.data?.user?.id) {
      isAuthenticated.value = true;
      // User is authenticated, redirect to protected page
      setTimeout(() => {
        router.push('/home');
      }, 1000);
    } else {
      isAuthenticated.value = false;
    }
  } catch (err) {
    if (err.response?.status === 401) {
      // Not authenticated, which is expected
      isAuthenticated.value = false;
    } else {
      // Actual error
      error.value = err.message || 'Failed to check authentication status';
      console.error('Auth check error:', err);
    }
  } finally {
    loading.value = false;
  }
}

// Redirect to backend login endpoint
function redirectToLogin() {
  // Store the protected test page as return destination
  const sendBackTo = '/home';
  
  // Redirect to backend login with sendBackTo parameter
  // After successful login, user will be redirected back to protected-test
  window.location.href = `http://localhost:3000/api/auth/login?sendBackTo=${encodeURIComponent(sendBackTo)}`;
}

onMounted(() => {
  checkAuth();
});
</script>

<template>
    <v-container class="fill-height d-flex align-center justify-center">

        <v-card class="text-center pa-6 rounded-xl mx-auto" elevation="5" style="max-width:420px; width:100%;">
            <div v-if="loading" class="loading">
               <v-card-title class="text-h5 font-weight-Medium">
                    Cargando...
                </v-card-title>
            </div>

            <div v-else-if="error" class="error-box">
                <v-card-title class="text-h5 font-weight-bold">
                    ❌ Error
                </v-card-title>
                <button @click="checkAuth">
                    Volver a intentar
                 </button>
            </div>

            <div v-else-if="!isAuthenticated">
                <div class="d-flex align-center mx-auto justify-center mb-8">
                    <v-avatar size="120" color="black" class="mb-4">
                        <v-icon size="80" color="white">mdi-account-group</v-icon>
                    </v-avatar>
                    <v-card-title class="text-h5 font-weight-bold">
                        SOCIAL CONNECT
                    </v-card-title>
                </div>

                <v-card-text>
                    <div class="d-flex align-center" style="gap:16px;">
                        <v-btn
                            class="text-none flex-grow-1"
                            variant="flat"
                            color="black"
                            height="56"
                            @click="redirectToLogin"
                        >
                            Iniciar Sesión con IBM App ID
                        </v-btn>
                    </div>
                </v-card-text>
            </div>

            <div v-else class="authenticated">
                <v-card-title class="text-h5 font-weight-bold success-message">
                    <p class>✅ Has iniciado sesión con éxito</p>
                </v-card-title>
                
             </div>
        </v-card>
    </v-container>
</template>

<style>
.avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    display: block;
    border-radius: 50%;
}
</style>
