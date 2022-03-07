<template>
  <Detail
    type="person"
    :data="data"
    :is-user-profile="isUserProfile"
    :applied-filters="filters"
    :user-can-edit="userCanEdit" />
</template>

<script>
// eslint-disable-next-line import/no-extraneous-dependencies
import { mapGetters } from 'vuex';
import { userInfo } from '@/mixins/userNotifications';
import Detail from '@/components/Detail';

export default {
  name: 'EntityView',
  components: {
    Detail,
  },
  mixins: [userInfo],
  async asyncData({
    $api, params, query,
  }) {
    let entryData = {};
    let parsedFilters = [];
    try {
      // get relevant query params
      const { page, filters } = query;
      // parse the filters from query params
      parsedFilters = filters ? JSON.parse(filters) : [];
      // assume 6 result boxes per row to start with
      const entryNumber = 6 * 5;
      const results = [];
      // TODO: use 'entities_search_create' instead of main search!!
      // create requests for all the relevant data
      ['entities_retrieve', 'search_create'].forEach((operation) => {
        // add a request body only for search request
        const requestBody = operation === 'search_create' ? {
          // TODO: remove default filter (only here because route does not work
          // currently without filters (moved here so it is not displayed in search)
          filters: parsedFilters.length ? parsedFilters : {
            id: 'default',
            label: 'Fulltext',
            type: 'text',
            filter_values: [
              'a',
            ],
          },
          offset: (page ? (Number(page) - 1) : 0) * entryNumber,
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
      const [entityDataResponse, searchResultsResponse] = await Promise
        .all(results);
      // assemble all the data to be used in Detail.vue
      entryData = {
        ...JSON.parse(entityDataResponse.data),
        activities: [].concat(JSON.parse(searchResultsResponse.data)),
      };
      // add an href element that is currently necessary for carousel data
      if (entryData.showcase && entryData.showcase.length) {
        entryData.showcase = entryData.showcase.map((entry) => ({
          ...entry,
          href: entry.id,
        }));
      }
    } catch (e) {
      console.error(e);
      // TODO: error handling;
    }
    console.log('async data', parsedFilters);
    return { data: entryData, filters: parsedFilters };
  },
  data() {
    return {
      data: {},
      filters: [],
    };
  },
  head() {
    return {
      title: `${this.data.title} | ${process.env.appTitle}`,
    };
    // TODO: add additional meta-tags, at least description
  },
  computed: {
    /**
     * get the data that only need fetching once for all search components from
     * the searchData store module
     */
    ...mapGetters({
      /**
       * a list of all filters defined in the backend and available to the user
       */
      userId: 'appData/getUserId',
      userEditPermissions: 'appData/getUserEditPermissions',
    }),
    entryId() {
      return this.$route.params.id;
    },
    isUserProfile() {
      return this.entryId.includes(this.userId);
    },
    /**
     * check if user is allowed to edit page elements
     *
     * @returns {boolean}
     */
    userCanEdit() {
      return this.entryId.includes(this.userId)
        || (this.userEditPermissions && this.userEditPermissions.includes(this.entryId))
        || (this.userEditPermissions && this.userEditPermissions.includes(this.entryId.split('-').pop()));
    },
  },
};
</script>
