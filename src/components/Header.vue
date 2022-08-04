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
    </q-toolbar>
  </q-header>
</template>

<script>
import { ref } from 'vue';
// store
import { useStore } from '@/store/index';

export default {
  name: 'Header',
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
    changeFilter() {
      this.data.updateFilter(this.model.value);
      this.$router.push({ path: '/tv' });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/css/quasar.variables.scss';

.header {
  background: transparent;
  padding: $space-sm;
  padding-left: 0;
  & > div {
    @include background-style;
  }
}
</style>
