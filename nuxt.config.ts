export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],

  runtimeConfig: {
    // server side (IMPORTANT)
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_KEY,

    public: {
      // client side
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
      dummyApi: process.env.DUMMY_API
    }
  },

  //  MOST IMPORTANT FOR AMPLIFY
  nitro: {
    preset: 'aws_amplify'
  }
})