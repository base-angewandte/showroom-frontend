<template>
  <Detail
    type="object"
    :data="data"
    :user-can-edit="userCanEdit" />
</template>

<script>
// eslint-disable-next-line import/no-extraneous-dependencies
import { mapGetters } from 'vuex';
import { meta, metaTitle } from '@/utils/metaTags';
import Detail from '@/components/Detail';

export default {
  name: 'ActivityView',
  components: {
    Detail,
  },
  async asyncData({
    $api,
    route,
    isDev,
    error,
  }) {
    let entryData = {};
    try {
      // get activity data
      const response = await $api.public.api_v1_activities_retrieve({
        id: route.params.id,
      });
      // check if data came back and thus response.data exists
      if (response && response.data) {
        // parse the stringified data
        entryData = JSON.parse(response.data);
      }
    } catch (e) {
      // if dev just output error to console
      if (isDev) {
        console.error(e);
      } else {
        // --> this is vital information so the page should not even be rendered
        // 404 is already caught in axios.js
        return error({
          // currently only error messages for 404 and 500 are defined
          // TODO: expand if necessary
          statusCode: e && e.statusCode && [404, 500].includes(e.statusCode)
            ? e.statusCode : 500,
        });
      }
    }
    return { data: entryData };
  },
  data() {
    return {
      data: {},
      userCanEdit: false,
    };
  },
  head() {
    return {
      title: metaTitle(this.data),
      meta: meta(this.data, this.lang, this.$route.path),
    };
  },
  computed: {
    ...mapGetters({
      lang: 'appData/getLocale',
    }),
  },
};
</script>
