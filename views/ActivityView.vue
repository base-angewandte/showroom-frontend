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
  async asyncData({ $api, route, error }) {
    // retrieve activity
    const data = await $api.public.api_v1_activities_retrieve({
      id: route.params.id,
    }).then((response) => JSON.parse(response.data))
      .catch((err) => {
        error({ statusCode: err.response.status });
      });

    return { data };
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
  },
};
</script>
