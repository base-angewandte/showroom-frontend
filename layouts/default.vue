<template>
  <div class="wrapper">
    <component
      :is="`${headerName}-header`"
      id="header"
      :lang="lang"
      :active="'showroom'"
      :profile.prop="profile"
      :urls.prop="urls" />
    <BaseNotification />
    <main class="main">
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
import Vue from 'vue';
// eslint-disable-next-line import/no-extraneous-dependencies
import { mapGetters } from 'vuex';
import Notifications from 'vue-notification/dist/ssr';
import { metaTags } from '~/utils/common';

Vue.use(Notifications);

export default {
  name: 'Default',
  components: {
    BaseNotification: () => import('~/components/BaseNotification'),
  },
  head() {
    return {
      htmlAttrs: {
        lang: this.lang,
      },
      link: metaTags(this.routerPath, this.lang),
    };
  },
  computed: {
    ...mapGetters({
      lang: 'appData/getLocale',
      profile: 'appData/getUser',
      authenticated: 'appData/getAuthState',
    }),
    baseUrl() {
      return `${process.env.backendBaseUrl}/`;
    },
    urls() {
      const backendUrl = `${process.env.backendBaseUrl}${process.env.backendPrefix}`;
      return {
        de: `${process.env.appPrefix}/de${this.$route.path}`,
        en: `${process.env.appPrefix}/en${this.$route.path}`,
        login: `${backendUrl}/accounts/login/?next=${process.env.appPrefix}${this.$route.path}`,
        logout: `${backendUrl}/accounts/logout/?next=${process.env.headerLogoutRedirectUrl}`,
        terms: process.env.headerUrlsTerms,
        siteNotice: process.env.headerUrlsNotice,
        showroom: `${process.env.appPrefix}/`,
      };
    },
    headerName() {
      return process.env.header.match(/\/([a-z-]+)-header\.[a-z0-9]+\.js$/)[1];
    },
    routerPath() {
      return this.$route.path;
    },
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

    .main {
      padding-top: $spacing;
    }
  }
</style>
