<template>
  <Detail
    type="object"
    :data="data"
    :user-can-edit="userCanEdit"
    class="base-sr--mt-small" />
</template>

<script>
import Detail from '@/components/Detail';

export default {
  name: 'ActivityView',
  components: {
    Detail,
  },
  async asyncData(context) {
    // retrieve activity
    const data = await context.$api.public.api_v1_activities_retrieve({
      id: context.route.params.slug,
    }).then((response) => JSON.parse(response.data))
      .catch((error) => {
        context.error({ statusCode: error.response.status });
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
