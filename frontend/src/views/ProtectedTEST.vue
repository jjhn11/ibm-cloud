<template>
  <div class="protected-container">
    <div class="card">
      <h1>🔒 Protected TEST Page</h1>
      <p class="description">
        This is a protected page that displays your user information from the database.
      </p>

      <div v-if="loading" class="loading">
        <p>⏳ Loading user information...</p>
      </div>

      <div v-else-if="error" class="error-box">
        <h3>❌ Access Denied</h3>
        <p>{{ error }}</p>
        <button @click="goToLogin" class="btn btn-primary">
          🔐 Log In
        </button>
      </div>

      <div v-else-if="user" class="user-info">
        <div class="user-header">
          <div v-if="user.photoUrl" class="user-photo">
            <img :src="user.photoUrl" :alt="fullName" />
          </div>
          <div v-else class="user-photo-placeholder">
            {{ initials }}
          </div>
          <h2>{{ fullName }}</h2>
        </div>

        <div class="user-details">
          <div class="detail-item">
            <span class="label">User ID:</span>
            <span class="value">{{ user.id }}</span>
          </div>

          <div class="detail-item">
            <span class="label">First Name:</span>
            <span class="value">{{ user.firstName }}</span>
          </div>

          <div class="detail-item">
            <span class="label">Last Name:</span>
            <span class="value">{{ user.lastName }}</span>
          </div>

          <div class="detail-item">
            <span class="label">Email:</span>
            <span class="value">{{ user.email || 'N/A' }}</span>
          </div>

          <div class="detail-item">
            <span class="label">Phone:</span>
            <span class="value">{{ user.phone || 'N/A' }}</span>
          </div>

          <div class="detail-item">
            <span class="label">Bio:</span>
            <span class="value">{{ user.bio || 'No bio provided' }}</span>
          </div>

          <div class="detail-item">
            <span class="label">Account Created:</span>
            <span class="value">{{ formatDate(user.createdAt) }}</span>
          </div>

          <div class="detail-item">
            <span class="label">Last Updated:</span>
            <span class="value">{{ formatDate(user.updatedAt) }}</span>
          </div>
        </div>

        <div class="actions">
          <button @click="logout" class="btn btn-danger">
            🚪 Log Out
          </button>
          <button @click="goToHome" class="btn btn-secondary">
            🏠 Go Home
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import backend from '@/config/axios.js';

const router = useRouter();
const loading = ref(true);
const error = ref(null);
const user = ref(null);

// Computed properties
const fullName = computed(() => {
  if (!user.value) return '';
  return `${user.value.firstName} ${user.value.lastName}`.trim();
});

const initials = computed(() => {
  if (!user.value) return '?';
  const first = user.value.firstName?.[0] || '';
  const last = user.value.lastName?.[0] || '';
  return (first + last).toUpperCase() || '?';
});

// Fetch user data
async function fetchUserData() {
  loading.value = true;
  error.value = null;

  try {
    const response = await backend.get('/users/me');
    
    if (response.data?.user) {
      user.value = response.data.user;
    } else {
      throw new Error('No user data received');
    }
  } catch (err) {
    if (err.response?.status === 401) {
      error.value = 'You are not authenticated. Please log in to access this page.';
    } else {
      error.value = err.message || 'Failed to load user information';
    }
    console.error('Error fetching user data:', err);
  } finally {
    loading.value = false;
  }
}

// Format date for display
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Logout function
async function logout() {
  try {
    await backend.get('/auth/logout');
    // Redirect to unprotected test page
    router.push('/unprotected-test');
  } catch (err) {
    console.error('Logout error:', err);
    // Even if logout fails, redirect to login
    router.push('/unprotected-test');
  }
}

// Navigate to login
function goToLogin() {
  router.push('/unprotected-test');
}

// Navigate to home
function goToHome() {
  router.push('/');
}

onMounted(() => {
  fetchUserData();
});
</script>

<style scoped>
.protected-container {
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
  max-width: 700px;
  width: 100%;
}

h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #333;
  text-align: center;
}

.description {
  color: #666;
  margin-bottom: 2rem;
  text-align: center;
  line-height: 1.6;
}

.loading {
  padding: 3rem;
  text-align: center;
  color: #666;
  font-size: 1.1rem;
}

.error-box {
  padding: 2rem;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  color: #c33;
  text-align: center;
}

.error-box h3 {
  margin-bottom: 1rem;
}

.user-info {
  margin-top: 2rem;
}

.user-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid #eee;
}

.user-photo {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.user-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-photo-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: bold;
  color: white;
  margin-bottom: 1rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.user-header h2 {
  font-size: 1.8rem;
  color: #333;
  margin: 0;
}

.user-details {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e0e0e0;
}

.detail-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: #555;
  flex: 0 0 40%;
}

.value {
  color: #333;
  flex: 1;
  text-align: right;
  word-break: break-word;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
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
  transform: translateY(-2px);
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}
</style>
