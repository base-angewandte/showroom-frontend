<template>
  <div class="container">
    <h1 class="hide">
      {{ $i18n.t('frontend') }}
    </h1>
    <div>
      <h2>{{ title }}</h2>
      <p>{{ subtext.join(',  ') }}</p>
    </div>
  </div>
</template>

<script>
export default {
  async asyncData(context) {
    const data = await context.$api.api.api_v1_entities_read({
      id: 1,
    }).then((response) => JSON.parse(response.data));

    return {
      title: data.title,
      subtext: data.subtext,
    };
  },
  data() {
    return {
      title: '',
      subtext: [],
    };
  },
  async mounted() {
    const data = await this.$api.api.api_v1_entities_read({
      id: 1,
    }).then((response) => JSON.parse(response.data));

    console.log('mounted', data);
  },
};
</script>
