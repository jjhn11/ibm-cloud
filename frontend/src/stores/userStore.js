import { defineStore } from "pinia";
import backend from "@/config/axios.js";
import { ref, computed } from "vue";

export const useUserStore = defineStore("user", () => {
    const user = ref ({
        id: null,
        firstName: null,
        lastName: null,
        email: null,
        phone: null,
        photoUrl: null,
        bio: null,
    });

    // Estado computado para verificar si el usuario está autenticado
    const isAuthenticated = computed(() => !!user.value.id);

    // Funcion para registrar un nuevo usuario
    async function register(userData) {
        try {
            const response = await backend.post('/api/auth/signup', userData);
            if (response.data?.user) {
                user.value = response.data.user;
            }
        } catch (error) {
            console.error("Error registering user:", error);
        }
    }

    // Funcion para iniciar sesión
    async function login(credentials) {
        try {
            const response = await backend.post('/api/auth/login', credentials);
            if (response.data?.user) {
                user.value = response.data.user;
            }
        } catch (error) {
            console.error("Error logging in user:", error);

        }
    }

    // Funcion para cerrar sesión
    async function logout() {
        try {
            await backend.post('/api/auth/logout');
            user.value = {
                id: null,
                firstName: null,
                lastName: null,
                email: null,
                phone: null,
                photoUrl: null,
                bio: null
            };
        } catch (error) {
            console.error("Error logging out user:", error);
        }
    }

    // Obtener el usuario autenticado (ej. al iniciar la app)
    async function fetchCurrentUser() {
        try {
            const response = await backend.get('/api/users/me');
            if (response.data?.user) {
                user.value = response.data.user;
            }
        } catch (error) {
            if (error?.response?.status === 401) {
                user.value = {
                    id: null,
                    firstName: null,
                    lastName: null,
                    email: null,
                    phone: null,
                    photoUrl: null,
                    bio: null
                };
                return;
            }
            console.error("Error fetching current user:", error);
        }
    }

    // Actualizar datos del perfil del usuario autenticado
    async function updateProfile(updates) {
        try {
            const response = await backend.put('/api/users/me', updates);
            if (response.data?.user) {
                user.value = response.data.user;
            }
        } catch (error) {
            console.error("Error updating user profile:", error);
            throw error;
        }
    }

    // Eliminar la cuenta del usuario autenticado
    async function deleteAccount() {
        try {
            await backend.delete('/api/users/me');
            resetUser();
        } catch (error) {
            console.error("Error deleting user account:", error);
            throw error;
        }
    }

    return {
        user,
        isAuthenticated,
        register,
        login,
        logout,
        fetchCurrentUser,
        updateProfile,
        deleteAccount
    };
});