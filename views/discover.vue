<template>
  <div class="container">
    <h1 class="title">
      {{ $i18n.t('frontend') }}
    </h1>
    <h2 class="subtitle">
      {{ $t('showcase') }}
    </h2>
    <BasePagination
      :total="100"
      :entry-id="'1'"
      :title="'test'" />
  </div>
</template>

<script>
import { BasePagination } from 'base-ui-components';

export default {
  components: {
    BasePagination,
  },
  data() {
    return {
      showCheckbox: false,
      list: [
        {
          id: '1',
          title: 'On a lovely Summers Day',
          active: false,
          type: 'Wissenschaftliche Abhandlungggggggggggggggggg',
          selected: false,
          shared: true,
          error: true,
        },
        {
          id: '2',
          title: 'Oh this hot hot heat',
          active: false,
          type: '',
          selected: false,
        },
        {
          id: '3',
          title: 'And then again a different title',
          active: false,
          type: 'Ausstellung',
          selected: false,
          shared: true,
        },
        {
          id: '4',
          title: 'Allons-y!eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee!',
          active: false,
          type: 'Bild',
          selected: false,
        },
      ],
    };
  },
};
</script>

<style>
  .container {
    margin-top: 30%;
    text-align: center;
  }
</style>
