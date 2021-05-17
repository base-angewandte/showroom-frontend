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
    const data = await context.$api.public.api_v1_activities_read({
      id: context.route.params.slug,
    }).then((response) => JSON.parse(response.data));

    return { data };
  },
  data() {
    return {
      data: {},
      userCanEdit: false,
    };
  },
};
</script>
