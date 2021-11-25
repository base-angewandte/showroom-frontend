<template>
  <Detail
    type="object"
    :data="data"
    :user-can-edit="userCanEdit" />
</template>

<script>
import Detail from '@/components/Detail';

export default {
  name: 'ActivityView',
  components: {
    Detail,
  },
  async asyncData({
    $api,
    route,
  }) {
    let entryData = {};

    try {
      const response = await $api.public.api_v1_activities_retrieve({
        id: route.params.id,
      });
      entryData = JSON.parse(response.data);
    } catch (e) {
      // TODO: error handling;
      console.error(e);
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
      title: `${this.data.title} | ${process.env.appTitle}`,
    };
    // TODO: add additional meta-tags, at least description
  },
};
</script>
