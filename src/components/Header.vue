<template>
  <q-header reveal height-hint="98" class="header">
    <q-toolbar class="flex">
      <q-select
        v-model="model"
        dense
        :options="options"
        label="Filter"
        color="secondary"
        label-color="white"
        class="filter-select"
        dark
        @update:model-value="changeFilter"
      />
      <div class="col-grow"></div>
    </q-toolbar>
  </q-header>
</template>

<script>
import { ref } from 'vue';
import { useStore } from '@/store/index';

export default {
  name: 'HeaderBar',
  props: {
    page: {
      type: String,
      default: '1',
    },
  },
  setup() {
    const data = useStore();
    return {
      data,
      model: ref({ label: 'Watch History', value: 'history' }),
      options: [
        { label: 'Watch History', value: 'history' },
        { label: 'Recommended By Me', value: 'recommended' },
        { label: 'Trending', value: 'trending' },
      ],
    };
  },
  methods: {
    async changeFilter() {
      this.data.updateFilter(this.model.value);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/css/quasar.variables.scss';
.header {
  padding: 5px 5px 0 0;
  background: transparent;
  & > div {
    @include background-style;
  }
}
</style>
