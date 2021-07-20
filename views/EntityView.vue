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
  async asyncData({
    $api, route, params,
  }) {
    let entryData = {};
    try {
      // retrieve entity
      const { data } = await $api.public.api_v1_entities_retrieve({
        id: params.id,
      });
      entryData = JSON.parse(data);
      // retrieve entity_list
      const listResponse = await $api.public.api_v1_entities_list_retrieve({
        id: route.params.id,
      });
      entryData.list = JSON.parse(listResponse.data) || [];
      // retrieve initial search results
      const searchDataResponse = await $api.public.api_v1_entities_search_create({
        id: route.params.id,
      }, {
        requestBody: {
          category: 'activity',
        },
      });
      entryData.activities = [{
        id: 'activity',
        ...JSON.parse(searchDataResponse.data),
      }] || [];
    } catch (e) {
      console.error(e);
      // TODO: error handling;
    }
    return { data: entryData };
  },
  data() {
    return {
      data: {},
      userCanEdit: false,
    };
  },
};
</script>
