<script setup>
import { useUserStore } from '@/stores/userStore';
import { computed, ref } from 'vue';

const userStore = useUserStore();

const userProfile = computed(() => userStore.user);

const emit = defineEmits(['submit', 'cancel', 'upload']);

const content = ref('');

const canPublish = computed(
	() => content.value.trim().length > 0,
);

const resetForm = () => {
    content.value = '';
};

const handleSubmit = () => {
	if (!canPublish.value) {
		return;
	}

	emit('submit', {
		content: content.value.trim(),
	});
	resetForm();
};

const handleCancel = () => {
	resetForm();
	emit('cancel');
};

const triggerUpload = () => {
};
</script>

<template>
	<v-card class="create-post" elevation="2">


		<v-card-text>
            <v-row class="mr-5">
                <v-col cols="2" class="d-flex justify-center align-start">
                    <v-avatar size="48" color="primary">
                        <template v-if="userProfile.photoUrl">
                            <v-img :src="userProfile.photoUrl" alt="avatar" cover />
                        </template>
                        <template v-else>
                            <v-icon color="white">mdi-account</v-icon>
                        </template>
                    </v-avatar>

                    
                </v-col>
                <v-col cols="10">
                    <v-textarea
                        v-model="content"
                        :placeholder="`¿Qué quieres compartir hoy, ${userProfile.firstName}?`"
                        auto-grow
                        rows="3"
                        hide-details
                        variant="outlined"
                    ></v-textarea>
                </v-col>

                <v-col cols="8 d-flex justify-center">
                    <v-btn
						variant="text"
						class="text-none"
						prepend-icon="mdi-image-plus-outline"
						@click="triggerUpload"
					>
						Añadir Imagen
					</v-btn>
                </v-col>
                <v-col cols="4 d-flex justify-center">
                    <v-btn
                        class="text-none"
                        color="primary"
                        variant="flat"
						prepend-icon="mdi-send"
                        :disabled="!canPublish"
                        @click="handleSubmit"
                    >
                        Publicar
                    </v-btn>
                </v-col>
            </v-row>
			

		</v-card-text>


	</v-card>

	<input
		ref="fileInput"
		type="file"
		class="d-none"
		accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx"
		@change="handleFileChange"
	/>
</template>

<style scoped>
.create-post {
	border-radius: 20px;
	background-color: #ffffff;
}

.privacy-select {
	min-width: 160px;
}

.text-error {
	color: #d32f2f;
}
</style>
