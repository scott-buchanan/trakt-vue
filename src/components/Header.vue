<template>
  <q-header reveal elevated class="bg-dark text-white" height-hint="98">
    <q-toolbar>
      <q-select
        v-model="model"
        dense
        outlined
        :options="options"
        label="Filter"
        color="secondary"
        label-color="secondary"
        bg-color="dark"
        class="text-white filter-select"
        input-class="penis"
        dark
        @update:model-value="changeFilter"
      />
    </q-toolbar>
  </q-header>
</template>

<style></style>

<script>
import { ref } from 'vue';
import { useStore } from '@/store/index';
// import trakt from '../api/trakt';

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
