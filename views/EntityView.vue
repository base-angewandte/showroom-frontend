<template>
  <Detail
    type="person"
    :data="data"
    :is-user-profile="isUserProfile"
    :applied-filters="filters"
    :filter-list="filterList"
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
    $api, params, query, isDev, error, store, env,
  }) {
    const { id } = params;
    let entryData = {};
    let parsedFilters = [];
    let completeFilters = [];
    let filterList = [];
    try {
      // get relevant query params
      const { page, filters } = query;
      // parse the filters from query params
      parsedFilters = filters ? JSON.parse(filters) : [];
      // assume 2 entries and configured number of rows or 5 rows initially
      // TODO: make configurable??
      // this is starting with the smallest number because otherwise higher page
      // numbers are not rendered with small screensize
      const entryNumber = 2 * env.searchResultRows;
      const results = [];
      // if filters were part of url - get all the data for these filters for this entity
      filterList = await store.dispatch('searchData/fetchEntityFilterData', id);
      if (parsedFilters && parsedFilters.length) {
        completeFilters = parsedFilters.map((filter) => {
          const filterMatch = filterList.find((f) => f.id === filter.id);
          return ({
            ...filterMatch,
            filter_values: filter.filter_values,
          });
        });
      }
      // create requests for all the relevant data
      ['entities_retrieve', 'entities_search_create'].forEach((operation) => {
        // add a request body only for search request
        const requestBody = operation === 'entities_search_create' ? {
          filters: completeFilters.length ? completeFilters.map((filter) => ({
            ...filter,
            // TODO: 'chips' with freetext currently only taking string --> remove
            // again should this work at some point
            filter_values: [].concat(filter.type === 'chips' && filter.freetext_allowed
              ? filter.filter_values.map((value) => ((!value.id && value.title)
                ? value.title : value))
              : filter.filter_values),
          })) : [],
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
      if (isDev) {
        console.error(e);
      } else {
        // --> this is vital information so the page should not even be rendered
        // 404 is already caught in axios.js
        return error({
          // currently only error messages for 404 and 500 are defined
          // TODO: expand if necessary
          statusCode: e && e.statusCode && [404, 500].includes(e.statusCode)
            ? e.statusCode : 500,
        });
      }
    }
    return { data: entryData, filters: completeFilters, filterList };
  },
  data() {
    return {
      data: {},
      filters: [],
      /**
       * get the individualized filter list for each entity (only showing
       * e.g. keywords that actually exist in the entity's activities)
       * @type {Filter[]}
       */
      filterList: [],
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
      return !!this.entryId.includes(this.userId)
        || (this.userEditPermissions && this.userEditPermissions.includes(this.entryId))
        || (this.userEditPermissions && this.userEditPermissions.includes(this.entryId.split('-').pop()));
    },
  },
};
</script>
