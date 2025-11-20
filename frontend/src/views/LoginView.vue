<script setup>
import { ref } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';


const userStore = useUserStore();
const router = useRouter();

const userCredentials = ref({
    email: '',
    password: ''
});

const login = async () => {

    console.log('Logging in user with credentials:', userCredentials.value);
    await userStore.login(userCredentials.value);

    if (userStore.isAuthenticated) {
        router.push('/');
    } else {
        alert('Credenciales inválidas. Por favor, inténtelo de nuevo.');
        console.log('Login failed');
    }
};

</script>

<template>
    <v-container align="center">
        <v-card class="text-center pa-6 rounded-xl w-50" elevation="5">
            <v-avatar size="80" color="primary" class="mb-4">
                <v-icon size="40" color="white">mdi-account</v-icon>
            </v-avatar>
            <v-card-title class="text-h5">Bienvenido de vuelta</v-card-title>
            <v-card-subtitle>Ingrese sus credenciales para continuar</v-card-subtitle>
            <v-card-text>
                <p class="text-start font-weight-bold mb-2">Email</p>
                <v-text-field
                    v-model="userCredentials.email"
                    label="johndoe@example.com"
                    variant="outlined"
                    single-line
                    required
                ></v-text-field>

                <p class="text-start font-weight-bold mb-2">Contraseña</p>
                <v-text-field
                    v-model="userCredentials.password"
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
                    @click="login"
                >
                    Iniciar Sesión
                </v-btn>

                <p>¿No tienes una cuenta? 
                    <router-link to="/register" class="account-btn">
                        Regístrate
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
