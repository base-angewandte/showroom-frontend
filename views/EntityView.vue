<template>
  <Detail
    type="person"
    :data="data"
    :user-can-edit="userCanEdit" />
</template>

<script>
import Detail from '@/components/Detail';

export default {
  name: 'EntityView',
  components: {
    Detail,
  },
  async asyncData(context) {
    // retrieve entity
    const data = await context.$api.public.api_v1_entities_retrieve({
      id: context.route.params.id,
    }).then((response) => JSON.parse(response.data))
      .catch((error) => {
        context.error({ statusCode: error.response.status });
        return false;
      });

    // retrieve entity_list
    await context.$api.public.api_v1_entities_list_retrieve({
      id: context.route.params.id,
    }).then((response) => {
      data.list = JSON.parse(response.data);
    }).catch(() => {});

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
