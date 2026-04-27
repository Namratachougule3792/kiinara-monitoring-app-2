export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],

  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE,
      dummyApi: process.env.DUMMY_API
    }
  }
})
