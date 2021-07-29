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
    $api, params,
  }) {
    let entryData = {};
    try {
      const results = [];
      ['entities_retrieve', 'entities_list_retrieve', 'entities_search_create'].forEach((operation) => {
        const requestBody = operation === 'entities_search_create' ? {
          category: 'activity',
        } : {};
        results.push($api.public[`api_v1_${operation}`]({
          id: params.id,
        }, {
          requestBody,
        }));
      });
      const [entityDataResponse, entityListsResponse, searchResultsResponse] = await Promise
        .all(results);
      entryData = {
        ...JSON.parse(entityDataResponse.data),
        list: JSON.parse(entityListsResponse.data),
        activities: [{
          id: 'activity',
          ...JSON.parse(searchResultsResponse.data),
        }],
      };
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
