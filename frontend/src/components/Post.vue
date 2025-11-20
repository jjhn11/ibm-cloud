<script setup>
import { computed } from 'vue';

const props = defineProps({
	authorName: {
		type: String,
		default: 'Jane Doe',
	},
	authorSubtitle: {
		type: String,
		default: 'Product Manager',
	},
	avatar: {
		type: String,
		default: '',
	},
	timestamp: {
		type: String,
		default: '',
	},
	content: {
		type: String,
		default:
			'Compartiendo algunas actualizaciones sobre nuestro nuevo dashboard. ¡Gracias por los comentarios!',
	},
	media: {
		type: String,
		default: '',
	},
	likes: {
		type: Number,
		default: 0,
	},
	comments: {
		type: Number,
		default: 0,
	},
	shares: {
		type: Number,
		default: 0,
	},
	outlined: {
		type: Boolean,
		default: false,
	},
});

const emit = defineEmits(['like', 'comment', 'share', 'save']);

const hasMedia = computed(() => Boolean(props.media));
const formattedTimestamp = computed(
	() => props.timestamp || 'Hace un momento',
);

const handleClick = (action) => {
	emit(action);
};
</script>

<template>
		<v-card
			:variant="outlined ? 'outlined' : 'flat'"
			class="post-card"
			:elevation="outlined ? 0 : 3"
		>
		<v-card-title class="py-4">
			<div class="d-flex align-center w-100">
				<v-avatar size="48" class="mr-4" color="primary">
					<template v-if="avatar">
						<v-img :src="avatar" alt="avatar" cover />
					</template>
					<template v-else>
						<v-icon color="white">mdi-account</v-icon>
					</template>
				</v-avatar>

				<div class="d-flex flex-column">
					<span class="text-subtitle-1 font-weight-medium">{{ authorName }}</span>
					<span class="text-body-2 text-medium-emphasis">{{ authorSubtitle }}</span>
					  <div class="d-flex align-center text-caption subtitle-color">
						<v-icon icon="mdi-clock-outline" size="14" class="mr-1" />
						<span>{{ formattedTimestamp }}</span>
					</div>
				</div>

				<v-spacer />

				<v-btn icon variant="text" density="comfortable" class="text-medium-emphasis">
					<v-icon>mdi-dots-horizontal</v-icon>
				</v-btn>
			</div>
		</v-card-title>

		<v-card-text class="pt-0">
			<p class="text-body-1 mb-4">
				{{ content }}
			</p>

			<v-img
				v-if="hasMedia"
				:src="media"
				class="rounded-lg"
				height="260"
				cover
			/>
		</v-card-text>

		<v-divider class="mx-4" />

		<v-card-actions class="px-4">
					<v-btn
						variant="text"
						class="text-none"
						rounded="lg"
						prepend-icon="mdi-thumb-up-outline"
						@click="handleClick('like')"
					>
				{{ likes }} Me gusta
			</v-btn>

					<v-btn
						variant="text"
						class="text-none"
						rounded="lg"
						prepend-icon="mdi-comment-outline"
						@click="handleClick('comment')"
					>
				{{ comments }} Comentarios
			</v-btn>

					<v-btn
						variant="text"
						class="text-none"
						rounded="lg"
						prepend-icon="mdi-share-outline"
						@click="handleClick('share')"
					>
				{{ shares }} Compartir
			</v-btn>

			<v-spacer />

			<v-btn
				icon
				variant="text"
				color="primary"
				@click="handleClick('save')"
			>
				<v-icon>mdi-bookmark-outline</v-icon>
			</v-btn>
		</v-card-actions>
	</v-card>
</template>

<style scoped>
.post-card {
	border-radius: 20px;
	transition: box-shadow 0.2s ease;
}

.post-card:hover {
	box-shadow: 0 12px 30px rgba(25, 118, 210, 0.12);
}

.subtitle-color {
	color: rgba(0, 0, 0, 0.45);
}
</style>
