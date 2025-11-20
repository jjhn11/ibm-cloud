<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/userStore.js'

const router = useRouter()
const userStore = useUserStore()
const { user: userProfile } = storeToRefs(userStore)

// Component state
const isEditing = ref(false)
const isLoggingOut = ref(false)
const isSaving = ref(false)
const isFormValid = ref(false)
const profileForm = ref(null)
const showErrorMessage = ref(false)
const showSuccessMessage = ref(false)
const errorMessage = ref('')

// Editable profile copy
const editableProfile = reactive({
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  photoUrl: '',
  bio: ''
});

const profileName = computed(() => {
  const first = userProfile.value?.firstName ?? ''
  const last = userProfile.value?.lastName ?? ''
  const fullName = `${first} ${last}`.trim()
  return fullName || 'Usuario'
})

const profileEmail = computed(() => userProfile.value?.email ?? '')
const profileBio = computed(() => userProfile.value?.bio ?? '')

const profilePhotoSrc = computed(() => {
  const url = userProfile.value?.photoUrl
  if (url && url.trim().length > 0) {
    return url
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(profileName.value)}&background=1976d2&color=ffffff`
})

function syncEditableProfile(profile) {
  editableProfile.email = profile?.email ?? ''
  editableProfile.firstName = profile?.firstName ?? ''
  editableProfile.lastName = profile?.lastName ?? ''
  editableProfile.phone = profile?.phone ?? ''
  editableProfile.photoUrl = profile?.photoUrl ?? ''
  editableProfile.bio = profile?.bio ?? ''
}

watch(
  userProfile,
  (profile) => {
    syncEditableProfile(profile)
  },
  { deep: true, immediate: true }
)

onMounted(async () => {
  try {
    await userStore.fetchCurrentUser()
  } catch (error) {
    console.error('Error fetching current user profile:', error)
  }
})

// Validation rules
const rules = {
  required: value => !!value || 'Este campo es requerido'
}

// Methods
async function logout() {
  if (isLoggingOut.value) return
  isLoggingOut.value = true
  try {
    await userStore.logout()
    router.push({ name: 'login' })
  } catch (error) {
    console.error('Error logging out user:', error)
  } finally {
    isLoggingOut.value = false
  }
}

function toggleEdit() {
  if (isEditing.value) {
    cancelEdit()
  } else {
    startEdit()
  }
}

function startEdit() {
  isEditing.value = true
}

function cancelEdit() {
  isEditing.value = false
  syncEditableProfile(userProfile.value)
}

async function saveProfile() {
  if (!isFormValid.value) return

  isSaving.value = true

  const trimString = (value) => {
    if (typeof value !== 'string') return value
    const trimmed = value.trim()
    return trimmed
  }

  const optionalString = (value) => {
    const trimmed = trimString(value)
    return trimmed ? trimmed : null
  }

  const updates = {
    firstName: trimString(editableProfile.firstName),
    lastName: trimString(editableProfile.lastName),
    phone: optionalString(editableProfile.phone),
    photoUrl: optionalString(editableProfile.photoUrl),
    bio: optionalString(editableProfile.bio)
  }

  try {
    await userStore.updateProfile(updates)
    showSuccessMessage.value = true
    isEditing.value = false
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Error al actualizar el perfil'
    showErrorMessage.value = true
  } finally {
    isSaving.value = false
  }
}

</script>

<template>
  <div class="profile-container">
    <v-container class="profile-content">
      <!-- Profile Photo and Basic Info -->
      <div class="profile-header text-center mb-8">
        <div class="profile-photo-container">
          <v-avatar size="120" class="profile-photo">
            <v-img 
              :src="profilePhotoSrc"
              :alt="profileName"
              cover
            />
            <div class="online-indicator"></div>
          </v-avatar>
        </div>
        
        <h2 class="text-h5 font-weight-bold mt-4 mb-1">
          {{ profileName }}
        </h2>
        <p class="text-body-1 text-medium-emphasis mb-1">
          {{ profileEmail }}
        </p>
        <p v-if="profileBio" class="text-body-2 text-medium-emphasis mt-2">
          {{ profileBio }}
        </p>
      </div>

      <!-- Personal Information Section -->
      <div class="info-section">
        <div class="d-flex justify-space-between align-center mb-4">
          <h3 class="text-h6 font-weight-medium">Información Personal</h3>
          <v-btn 
            variant="text" 
            color="primary" 
            @click="toggleEdit"
            class="edit-btn"
          >
            <v-icon class="mr-1">{{ isEditing ? 'mdi-close' : 'mdi-pencil' }}</v-icon>
            {{ isEditing ? 'Cancelar' : 'Editar' }}
          </v-btn>
        </div>

        <v-form ref="profileForm" v-model="isFormValid">
          <!-- First Name -->
          <div class="info-field mb-4">
            <label class="field-label">Nombres</label>
            <v-text-field
              v-model="editableProfile.firstName"
              :readonly="!isEditing"
              :variant="isEditing ? 'outlined' : 'plain'"
              density="compact"
              :rules="[rules.required]"
              class="profile-input"
              hide-details="auto"
            />
          </div>

          <!-- Last Name -->
          <div class="info-field mb-4">
            <label class="field-label">Apellidos</label>
            <v-text-field
              v-model="editableProfile.lastName"
              :readonly="!isEditing"
              :variant="isEditing ? 'outlined' : 'plain'"
              density="compact"
              :rules="[rules.required]"
              class="profile-input"
              hide-details="auto"
            />
          </div>

          <!-- Phone -->
          <div class="info-field mb-4">
            <label class="field-label">Teléfono</label>
            <v-text-field
              v-model="editableProfile.phone"
              :readonly="!isEditing"
              :variant="isEditing ? 'outlined' : 'plain'"
              density="compact"
              class="profile-input"
              hide-details="auto"
            />
          </div>

          <!-- Photo URL -->
          <div class="info-field mb-4">
            <label class="field-label">URL de la Foto de Perfil</label>
            <v-text-field
              v-model="editableProfile.photoUrl"
              :readonly="!isEditing"
              :variant="isEditing ? 'outlined' : 'plain'"
              density="compact"
              prepend-inner-icon="mdi-image-outline"
              class="profile-input"
              hide-details="auto"
            />
          </div>

          <!-- Bio -->
          <div class="info-field mb-4">
            <label class="field-label">Biografía</label>
            <v-textarea
              v-model="editableProfile.bio"
              :readonly="!isEditing"
              :variant="isEditing ? 'outlined' : 'plain'"
              density="compact"
              class="profile-input"
              hide-details="auto"
              rows="2"
              auto-grow
            />
          </div>

          <!-- Email (Read only) -->
          <div class="info-field mb-6">
            <label class="field-label">Correo Electrónico</label>
            <v-text-field
              v-model="editableProfile.email"
              readonly
              variant="plain"
              density="compact"
              class="profile-input email-field"
              hide-details
            />
          </div>

          <!-- Action Buttons -->
          <div v-if="isEditing" class="action-buttons d-flex ga-3">
            <v-btn
              color="primary"
              variant="flat"
              @click="saveProfile"
              :loading="isSaving"
              :disabled="!isFormValid"
              class="flex-1"
            >
              <v-icon class="mr-2">mdi-content-save</v-icon>
              Guardar
            </v-btn>
            <v-btn
              color="error"
              variant="outlined"
              @click="cancelEdit"
              class="flex-1"
            >
              Cancelar
            </v-btn>
          </div>
        </v-form>
        
        <!-- Logout Section -->
        <div class="logout-section mt-6 pt-6" style="border-top: 1px solid #e0e0e0;">
          <v-btn
            color="error"
            variant="outlined"
            @click="logout"
            :loading="isLoggingOut"
            block
            class="logout-btn"
          >
            <v-icon class="mr-2">mdi-logout</v-icon>
            Cerrar Sesión
          </v-btn>
        </div>
      </div>
    </v-container>

    <!-- Success Snackbar -->
    <v-snackbar
      v-model="showSuccessMessage"
      color="success"
      timeout="3000"
      location="top"
    >
      <v-icon class="mr-2">mdi-check-circle</v-icon>
      Perfil actualizado correctamente
    </v-snackbar>

    <!-- Error Snackbar -->
    <v-snackbar
      v-model="showErrorMessage"
      color="error"
      timeout="5000"
      location="top"
    >
      <v-icon class="mr-2">mdi-alert-circle</v-icon>
      {{ errorMessage }}
    </v-snackbar>
  </div>
</template>

<style scoped>
.profile-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
  min-height: 100vh;
}

.profile-content {
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.profile-header {
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 24px;
}

.profile-photo-container {
  position: relative;
  display: inline-block;
}

.profile-photo {
  border: 4px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.online-indicator {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  background-color: #4caf50;
  border: 3px solid white;
  border-radius: 50%;
}

.info-section {
  padding-top: 24px;
}

.field-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #424242;
  margin-bottom: 4px;
}

.info-field {
  margin-bottom: 16px;
}

.profile-input {
  font-weight: 500;
}

.profile-input :deep(.v-field--variant-plain .v-field__field) {
  padding-left: 0;
}

.profile-input :deep(.v-field--variant-plain .v-field__input) {
  font-weight: 500;
  color: #1976d2;
}

.email-field :deep(.v-field__input) {
  color: #666;
}

.edit-btn {
  text-transform: none;
  font-weight: 500;
}

.action-buttons {
  margin-top: 24px;
  gap: 12px;
}

.flex-1 {
  flex: 1;
}

.logout-section {
  margin-top: 24px;
  padding-top: 24px;
}

.logout-btn {
  text-transform: none;
  font-weight: 500;
  height: 48px;
}

/* Responsive design */
@media (max-width: 600px) {
  .profile-container {
    padding: 8px;
  }
  
  .profile-content {
    padding: 16px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-buttons .v-btn {
    width: 100%;
  }
}
</style>
