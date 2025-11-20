import { defineStore } from 'pinia'
import { ref } from 'vue'
import backend from '@/config/axios.js'

export const usePostStore = defineStore('posts', () => {
  const posts = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  async function fetchFeed() {
    if (isLoading.value) return

    isLoading.value = true
    error.value = null

    try {
      const response = await backend.get('/api/posts/feed')
      posts.value = response.data?.posts ?? []
    } catch (err) {
      console.error('Error fetching feed:', err)
      error.value = err.response?.data?.message || 'No se pudo cargar el feed'
      posts.value = []
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function clearFeed() {
    posts.value = []
    error.value = null
  }

  return {
    posts,
    isLoading,
    error,
    fetchFeed,
    clearFeed
  }
})
