<template>
  <div class="unprotected-container">
    <div class="card">
      <h1>🔓 Unprotected TEST Page</h1>
      <p class="description">
        This is an unprotected page that checks your authentication status.
      </p>

      <div v-if="loading" class="loading">
        <p>⏳ Checking authentication status...</p>
      </div>

      <div v-else-if="error" class="error-box">
        <p>❌ Error: {{ error }}</p>
        <button @click="checkAuth" class="btn btn-secondary">
          Retry
        </button>
      </div>

      <div v-else-if="!isAuthenticated" class="auth-prompt">
        <p class="message">You are not logged in.</p>
        <p class="submessage">Please log in to access protected content.</p>
        
        <button @click="redirectToLogin" class="btn btn-primary">
          🔐 Log In
        </button>
      </div>

      <div v-else class="authenticated">
        <p class="success-message">✅ You are authenticated!</p>
        <p class="info">Redirecting to protected content...</p>
      </div>
    </div>
  </div>
</template>

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
        router.push('/protected-test');
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
  const sendBackTo = '/protected-test';
  
  // Redirect to backend login with sendBackTo parameter
  // After successful login, user will be redirected back to protected-test
  window.location.href = `http://localhost:3000/api/auth/login?sendBackTo=${encodeURIComponent(sendBackTo)}`;
}

onMounted(() => {
  checkAuth();
});
</script>

<style scoped>
.unprotected-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 2rem;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 3rem;
  max-width: 500px;
  width: 100%;
  text-align: center;
}

h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #333;
}

.description {
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.loading {
  padding: 2rem;
  color: #666;
  font-size: 1.1rem;
}

.error-box {
  padding: 1.5rem;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  color: #c33;
  margin-bottom: 1rem;
}

.auth-prompt {
  margin-top: 2rem;
}

.message {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.submessage {
  color: #666;
  margin-bottom: 2rem;
}

.authenticated {
  padding: 2rem;
}

.success-message {
  font-size: 1.3rem;
  color: #0a0;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.info {
  color: #666;
  font-style: italic;
}

.btn {
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0.5rem;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}
</style>
