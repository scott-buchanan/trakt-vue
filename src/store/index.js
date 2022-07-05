/* eslint-disable */
import { defineStore } from 'pinia';

// useStore could be anything like useUser, useCart
// the first argument is a unique id of the store across your application
export const useStore = defineStore('main', {
  state: () => ({
    data: null,
    page: '1',
    filter: 'history',
    loaded: false,
  }),
  actions: {
    updatePage(page) {
      this.page = page;
    },
    updateData(data) {
      this.data = { ...data };
    },
    updateFilter(filter) {
      this.filter = filter;
    },
    updateLoading(loaded) {
      this.loaded = loaded;
    },
  },
});
