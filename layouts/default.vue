<template>
  <div class="wrapper">
    <component
      :is="`${headerName}-header`"
      :lang="lang"
      :active="'portfolio'"
      :profile.prop="profile"
      :urls.prop="urls" />
    <main class="main-container">
      <nuxt />
    </main>
    <component
      :is="`${headerName}-footer`"
      :base-url="baseUrl"
      :lang="lang"
      :logged-in="authenticated"
      :urls.prop="urls" />
  </div>
</template>

<script>
export default {
  computed: {
    lang() {
      return this.$store.state.appData.locale;
    },
    baseUrl() {
      return process.env.backendBaseUrl;
    },
    profile() {
      return this.$store.state.appData.user;
    },
    authenticated() {
      return this.$store.state.appData.authenticated;
    },
    urls() {
      const backendUrl = `${process.env.backendBaseUrl}${process.env.backendPrefix}`;

      return {
        de: `${process.env.appPrefix}/de${this.$route.path}`,
        en: `${process.env.appPrefix}/en${this.$route.path}`,
        login: `${backendUrl}/accounts/login/`,
        logout: `${backendUrl}/accounts/logout/?next=/`,
        terms: process.env.headerUrlsTerms,
        siteNotice: process.env.headerUrlsNotice,
        showroom: `${process.env.appPrefix}/`,
      };
    },
    headerName() {
      return process.env.header.match(/\/([a-z-]+)-header\.[a-z0-9]+\.js$/)[1];
    },
  },
  mounted() {
    // this is for fetchUser currently maincan only be done here because
    // credentials are not available server side...
    this.$store.dispatch('appData/init');
    // set html language attribute
    // TODO: check if this influences SEO negatively in a way!
    document.getElementsByTagName('html')[0].setAttribute('lang', this.lang);
  },
  methods: {
  },
};
</script>

<style lang="scss">
  .wrapper {
    display: block;
    margin: 0 auto;
    max-width: $page-max-width;
    min-width: $page-min-width;
    padding: $spacing-small;
    position: relative;
    min-height: 100vh;

    @media screen and (min-width: $breakpoint-small) {
      padding: $spacing;
    }

    .main-container {
      padding-top: $header-height;
    }
  }
</style>
