<template>
  <Detail
    type="person"
    :data="data"
    :is-user-profile="isUserProfile"
    :user-can-edit="userCanEdit"
    @update-entity="updateEntityData" />
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
    try {
      // get relevant query params
      const { page, filters } = query;
      // parse the filters from query params
      // TODO: remove default filter (only here because route does not work
      // currently without filters
      const parsedFilters = filters ? JSON.parse(filters) : [{
        id: 'default',
        label: 'Fulltext',
        filter_values: [
          'a',
        ],
      }];
      // assume 6 result boxes per row to start with
      const entryNumber = 6 * 5;
      const results = [];
      // TODO: use 'entities_search_create' instead of main search!!
      // create requests for all the relevant data
      ['entities_retrieve', 'search_create'].forEach((operation) => {
        // add a request body only for search request
        const requestBody = operation === 'search_create' ? {
          filters: parsedFilters,
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
    return { data: entryData };
  },
  data() {
    return {
      data: {},
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
  methods: {
    /**
     * EDIT MODE FUNCTIONALITIES
     */

    /**
     * function for updating edited entity view data
     *
     * @param prop
     * @param requestBody
     * @returns {Promise<void>}
     */
    async updateEntityData({ prop, data }) {
      const requestOperationId = `api_v1_entities_${prop === 'list' ? 'list' : 'edit'}_partial_update`;
      const requestBody = prop === 'list' ? data : {
        [prop]: data,
      };
      try {
        const response = await this.$api.auth[requestOperationId](
          {
            id: this.$route.params.id,
          },
          {
            requestBody,
          },
        );
        if (response.data) {
          // parse the data that are provided stringified
          const responseData = JSON.parse(response.data);
          // now map the data to the view data
          // save the current data in a variable
          const currentData = this.data[prop];
          // set a newData variable that will be modified if necessary
          let newData = responseData[prop] || responseData;
          // check if data in array are actually lang specific (needed for secondary details)
          if (newData.length && newData[0][this.$i18n.locale]) {
            newData = newData[0][this.$i18n.locale];
          }
          // now check if the formats of response data and view data are compatible
          // first check if view data is array and response data is object
          if (currentData.length && !newData.length) {
            // if so - wrap response data in array
            newData = [newData[this.$i18n.locale] || newData];
            // else check if current data is array but response data is object
          } else if (!currentData.length && newData.length) {
            // if so - take the first element of this response array
            [newData] = newData[this.$i18n.locale] || newData;
          }
          // now set the modified respones data as the entity view data
          this.$set(this.data, prop, newData);
        }
        // now inform user that update was sucessful
        this.informUser({
          action: 'save',
          count: 0,
          type: prop,
          notificationType: 'success',
        });
      } catch (e) {
        console.error(e);
      }
    },
  },
};
</script>
