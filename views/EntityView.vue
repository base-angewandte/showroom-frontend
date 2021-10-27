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
    $api, params, query,
  }) {
    let entryData = {};
    try {
      // get relevant query params
      const { page, filters } = query;
      // parse the filters from query params
      const parsedFilters = filters ? JSON.parse(filters) : [];
      // assume 6 result boxes per row to start with
      const entryNumber = 6 * 5;
      const results = [];
      // create requests for all the relevant data
      ['entities_retrieve', 'entities_list_retrieve', 'entities_search_create'].forEach((operation) => {
        // add a request body only for search request
        const requestBody = operation === 'entities_search_create' ? {
          filters: parsedFilters,
          offset: (page - 1) * entryNumber,
          limit: entryNumber,
        } : {};
        // push the request promises into an array
        results.push($api.public[`api_v1_${operation}`]({
          id: params.id,
        }, {
          requestBody,
        }));
      });
      // wait for the requests to return
      const [entityDataResponse, entityListsResponse, searchResultsResponse] = await Promise
        .all(results);
      // assemble all the data to be used in Detail.vue
      entryData = {
        ...JSON.parse(entityDataResponse.data),
        list: JSON.parse(entityListsResponse.data),
        activities: [].concat(JSON.parse(searchResultsResponse.data)),
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
  head() {
    return {
      title: `${this.data.title} | ${process.env.appTitle}`,
    };
    // TODO: add additional meta-tags, at least description
  },
};
</script>
