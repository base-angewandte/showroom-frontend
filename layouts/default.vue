<template>
  <div class="wrapper">
    <base-header
      :lang="lang"
      :active="'recherche'"
      :profile.prop="profile"
      :emit-navigation="true"
      :urls.prop="{
        de:'/recherche/de/',
        en:'/recherche/en/',
        login:'/recherche/login/',
        logout:'/recherche/logout/'
      }"
      @navigate="navigate($event.detail[0])" />
    <main class="main-container">
      <nuxt />
    </main>
    <base-footer
      :base-url="linkUrl"
      :lang="lang"
      :logged-in="$store.state.isAuthenticated"
      :emit-navigation="true"
      :urls.prop="{
        de:'/recherche/de/',
        en:'/recherche/en/',
        login:'/recherche/login/',
        logout:'/recherche/logout/'
      }"
      @navigate="navigate($event.detail[0])" />
  </div>
</template>

<script>
export default {
  computed: {
    lang() {
      return this.$store.state.appData.locale;
    },
    linkUrl() {
      return process.env.appBaseUrl;
    },
    profile() {
      return this.$store.state.appData.user;
    },
  },
  mounted() {
    // set html language attribute
    document.getElementsByTagName('html')[0].setAttribute('lang', this.$store.state.locale);
  },
  methods: {
    navigate(route) {
      if (route === 'login' || route === 'logout') {
        window.sessionStorage.setItem('lang', route);
        // before changing route save filters if they exist
        if (this.$store.state.filter.searchParams.length > 0) {
          window.sessionStorage.setItem('mainFilters', JSON.stringify(this.$store.state.filter.searchParams));
        }
        if (this.$store.state.filter.itemSearchParams.length > 0) {
          window.sessionStorage.setItem('itemFilters', JSON.stringify(this.$store.state.filter.itemSearchParams));
        }
        // now change route to login / logout page
        this.$router.push({ path: `/${route}`, query: { returnTo: process.env.baseUrl + this.$route.fullPath, lang: this.$store.state.locale } });
      } else {
        const path = this.$route.fullPath;
        this.$router.push(`/${route}${path}`);
      }
    },
  },
};
</script>

<style lang="scss">
  .wrapper{
    display: block;
    margin: 0 auto;
    max-width: $page-max-width;
    min-width: $page-min-width;
    padding: $spacing;
    position: relative;
    min-height: 100vh;

    .main-container {
      margin-top: $header-height;
    }
  }

  @media screen and (max-width: $mobile) {
    .wrapper {
      padding: $spacing-small;
    }
  }
</style>
