<template>
  <div>
    test
  </div>
</template>

<script>
export default {
  name: 'Id',
  async asyncData({
    params, error,
  }) {
    let data = [];
    // get all data for single specific object
    try {
      console.log(params.id);
      data = ['test'];
    } catch (e) {
      console.error(e);
      if (e.response && e.response.status === 404) {
        error({ statusCode: 404, message: `Item with ID '${params.id}' does not exist!` });
      } else if (e.response && e.response.status) {
        error({ statusCode: e.response.status, message: `Request failed (${e.response.statusText})- please try again` });
      } else {
        error({ message: e.code });
      }
    }
    return { itemData: data };
  },
};
</script>
