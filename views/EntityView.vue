<template>
  <Detail
    type="person"
    :data="data"
    :user-can-edit="userCanEdit"
    class="base-sr--mt-small" />
</template>

<script>
import Detail from '@/components/Detail';

export default {
  name: 'EntityView',
  components: {
    Detail,
  },
  async asyncData(context) {
    const data = await context.$api.public.api_v1_entities_read({
      id: context.route.params.id,
    }).then((response) => JSON.parse(response.data));

    data.list = await context.$api.public.api_v1_entities_activities_read({
      id: context.route.params.id,
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
