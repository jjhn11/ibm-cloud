<script setup>
import { onMounted, watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import Post from '@/components/Post.vue'
import CreatePost from '@/components/CreatePost.vue'
import { useUserStore } from '@/stores/userStore.js'
import { usePostStore } from '@/stores/postStore.js'

const userStore = useUserStore()
const postStore = usePostStore()

const { posts, isLoading, error } = storeToRefs(postStore)
const { isAuthenticated } = storeToRefs(userStore)

function formatTimestamp(isoString) {
  if (!isoString) return 'Hace un momento'
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return 'Hace un momento'

  const diffMs = Date.now() - date.getTime()
  const diffMinutes = Math.round(diffMs / 60000)

  if (diffMinutes <= 1) return 'Hace un momento'
  if (diffMinutes < 60) {
    return `Hace ${diffMinutes} minuto${diffMinutes === 1 ? '' : 's'}`
  }

  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) {
    return `Hace ${diffHours} hora${diffHours === 1 ? '' : 's'}`
  }

  const diffDays = Math.round(diffHours / 24)
  return `Hace ${diffDays} día${diffDays === 1 ? '' : 's'}`
}

async function ensureFeedLoaded() {
  if (!isAuthenticated.value) {
    postStore.clearFeed()
    return
  }

  try {
    await postStore.fetchFeed()
  } catch (err) {
    // el store ya maneja el error y lo expone via error.value
  }
}

onMounted(async () => {
  if (!userStore.user.id) {
    try {
      await userStore.fetchCurrentUser()
    } catch (err) {
      console.error('No se pudo determinar el usuario actual al cargar el feed:', err)
    }
  }

  await ensureFeedLoaded()
})

watch(
  () => isAuthenticated.value,
  async () => {
    await ensureFeedLoaded()
  }
)

const hasPosts = computed(() => posts.value.length > 0)
</script>

<template>
  <main class="d-flex justify-center">
    <div class="w-50 mt-5">
      <CreatePost v-if="isAuthenticated" class="mb-6" />

      <v-skeleton-loader
        v-if="isLoading"
        type="article"
        class="mt-4"
      />

      <v-alert
        v-else-if="error"
        type="error"
        variant="tonal"
        class="mt-4"
      >
        {{ error }}
      </v-alert>

      <template v-else-if="hasPosts">
        <Post
          v-for="post in posts"
          :key="post.id"
          class="mt-6"
          :author-name="post.authorName"
          :author-subtitle="post.authorSubtitle"
          :avatar="post.authorAvatar"
          :timestamp="formatTimestamp(post.createdAt)"
          :content="post.content"
          :media="post.mediaUrl"
          :likes="post.likes"
          :comments="post.comments"
          :shares="post.shares"
        />
      </template>

      <v-alert
        v-else
        variant="tonal"
        type="info"
        class="mt-4"
      >
        Aún no hay publicaciones para mostrar. ¡Vuelve pronto!
      </v-alert>
    </div>
  </main>
</template>
