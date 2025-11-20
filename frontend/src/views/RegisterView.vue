<script setup>
import { useUserStore } from '@/stores/userStore';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const userStore = useUserStore();
const userData = ref({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    photoUrl: '',
    bio: ''
});

const register = async () => {

    console.log('Registering user with data:', userData.value);
    await userStore.register(userData.value);

    if (userStore.isAuthenticated) {
        router.push('/');
    } else {
        alert('Registro fallido. Por favor, inténtelo de nuevo.');
        console.log('Register failed');
    }
};

</script>

<template>
    <v-container align="center">
        <v-card class="text-center pa-6 rounded-xl w-50" elevation="5">
            <v-avatar size="80" color="primary" class="mb-4">
                <v-icon size="40" color="white">mdi-account</v-icon>
            </v-avatar>
            <v-card-title class="text-h5">Crea una cuenta</v-card-title>
            <v-card-subtitle>Ingrese su información para comenzar</v-card-subtitle>
            <v-card-text>
                <p class="text-start font-weight-bold mb-2">Nombre</p>
                <v-text-field
                    v-model="userData.firstName"
                    label="John"
                    variant="outlined"
                    single-line
                    required
                ></v-text-field>

                <p class="text-start font-weight-bold mb-2">Apellidos</p>
                <v-text-field
                    v-model="userData.lastName"
                    label="Doe"
                    variant="outlined"
                    single-line
                    required
                ></v-text-field>

                <p class="text-start font-weight-bold mb-2">Email</p>
                <v-text-field
                    v-model="userData.email"
                    label="johndoe@example.com"
                    variant="outlined"
                    single-line
                    required
                ></v-text-field>

                <p class="text-start font-weight-bold mb-2">Teléfono</p>
                <v-text-field
                    v-model="userData.phone"
                    label="(555) 123-4567"
                    variant="outlined"
                    single-line
                ></v-text-field>

                <p class="text-start font-weight-bold mb-2">URL de foto de perfil</p>
                <v-text-field
                    v-model="userData.photoUrl"
                    label="https://example.com/foto.jpg"
                    variant="outlined"
                    single-line
                ></v-text-field>

                <p class="text-start font-weight-bold mb-2">Biografía</p>
                <v-textarea
                    v-model="userData.bio"
                    label="Cuenta algo sobre ti"
                    variant="outlined"
                    auto-grow
                    rows="3"
                ></v-textarea>

                <p class="text-start font-weight-bold mb-2">Contraseña</p>
                <v-text-field   
                    v-model="userData.password"
                    label="••••••"
                    type="password"
                    variant="outlined"
                    single-line
                    required
                ></v-text-field>

                
                <v-btn
                    class="text-none w-100 mb-2"
                    variant="flat"
                    color="primary"
                    @click="register"
                >
                    Registrarse
                </v-btn>

                <p>¿Ya tienes una cuenta? 
                    <router-link to="/login" class="account-btn">
                        Inicia Sesión
                    </router-link>
                </p>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<style>
.account-btn {
    text-decoration: none;
    font-weight: bold;
    color: black;
}

.account-btn:hover {
    text-decoration: underline;
}
</style>
