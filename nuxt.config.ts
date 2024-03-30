// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
  devtools: { enabled: true },
  app: {
    // head
    head: {
      title: 'GG空间',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          hid: '4B',
          name: '4B',
          content: 'GG空间',
        },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },
    // baseURL: "/Infinity4B.github.io/",
    // buildAssetsDir: "/static/"
  },

  // css
  css: ['~/assets/scss/index.scss'],

  typescript: {
    strict: true,
    shim: false,
  },

  // build modules
  modules: [
    '@vueuse/nuxt',
    '@unocss/nuxt',
    '@pinia/nuxt',
    '@element-plus/nuxt',
    '@nuxtjs/color-mode',
    "@nuxt/image"
  ],

  // vueuse
  vueuse: {
    ssrHandlers: true,
  },

  // colorMode
  colorMode: {
    classSuffix: '',
  },

  unocss: {
    uno: true,
    attributify: true,
    icons: {
      scale: 1.2,
    },
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/assets/scss/element/index.scss" as element;`,
        },
      },
    },
  },
  elementPlus: {
    icon: 'ElIcon',
    importStyle: 'scss',
    themes: ['dark'],
  },

  runtimeConfig: {
    apiSecret: '',
    public: {
      apiBase: '',
    }
  },

  // generate: {
  //   nojekyll: true, //not working on this version
  // },
  // ssr: true, //server side rendered enabled //When true
  // target: "static", // and static, nuxt generates a hybrid static sit

  // nitro: {
  //   prerender: {
  //     // Workaround for "Error: [404] Page not found: /manifest.json"
  //     failOnError: false,
  //   },
  // },
})
