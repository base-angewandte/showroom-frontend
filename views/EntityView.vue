<template>
  <Detail
    type="person"
    :data="data"
    :is-user-profile="isUserProfile"
    :filter-list="filterList"
    :user-can-edit="userCanEdit"
    @update-search-results="searchResults = $event" />
</template>

<script>
// eslint-disable-next-line import/no-extraneous-dependencies
import { mapGetters, mapMutations } from 'vuex';
import { userInfo } from '@/mixins/userNotifications';
import { meta, metaTitle } from '@/utils/metaTags';
import Detail from '@/components/Detail';

export default {
  name: 'EntityView',
  components: {
    Detail,
  },
  mixins: [userInfo],
  beforeRouteLeave(to, from, next) {
    // need to assemble manually in case there are not filters or no page
    const searchParams = `${this.$route.query.filters || 'noFilters'}&${this.$route.query.page || 'firstPage'}`;
    this.setSearchResults({
      id: from.params.id || 'main',
      searchParams,
      data: this.searchResults,
    });
    next();
  },
  async asyncData({
    $api, params, isDev, error, store,
  }) {
    const { id } = params;
    let entityData = {};
    let filterList = [];
    try {
      const requestsArray = [
        // get the data for the entity from backend
        // eslint-disable-next-line
        $api.public['api_v1_entities_retrieve']({
          id,
        }),
        // get all the filters specific for that entity
        store.dispatch('searchData/fetchEntityFilterData', id),
      ];
      // wait for the requests to return
      const [{ data }, filterResponse] = await Promise
        .all(requestsArray);
      if (data) {
        const newEntityData = JSON.parse(data);
        // this would only turn false if request was cancelled (which should not happen
        // but just in case)
        if (newEntityData) {
          entityData = newEntityData;
        }
      }
      filterList = filterResponse;
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
    return {
      data: entityData,
      filterList,
    };
  },
  data() {
    return {
      data: {},
      /**
       * get the individualized filter list for each entity (only showing
       * e.g. keywords that actually exist in the entity's activities)
       * @type {Filter[]}
       */
      filterList: [],
      searchResults: [],
    };
  },
  head() {
    return {
      title: metaTitle(this.data),
      meta: meta(this.data, this.lang, this.$route.path),
    };
  },
  computed: {
    /**
     * get the data that only need fetching once for all search components from
     * the searchData store module
     */
    ...mapGetters({
      lang: 'appData/getLocale',
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
  methods: {
    ...mapMutations({
      setSearchResults: 'searchData/setLatestSearchResults',
    }),
  },
};
</script>
