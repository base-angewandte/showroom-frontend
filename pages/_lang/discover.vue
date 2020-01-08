<template>
  <div class="container">
    <h1 class="title">
      {{ $i18n.t('frontend') }}
    </h1>
    <h2 class="subtitle">
      {{ $t('showcase') }}
    </h2>
    <BaseImageBox
      :entry-id="12"
      :total="10"
      :show="true"
      :tabs="['de', 'en']"
      label="test" />
  </div>
</template>

<script>
import { BaseImageBox } from 'base-ui-components';

export default {
  components: {
    BaseImageBox,
  },
};
</script>

<style>
  .container {
    margin-top: 30%;
    text-align: center;
  }
</style>
