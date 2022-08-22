/* eslint-disable */
import { defineStore } from 'pinia';

// useStore could be anything like useUser, useCart
// the first argument is a unique id of the store across your application
export const useStore = defineStore('main', {
  state: () => ({
    data: null,
    page: 1,
    filter: { label: 'Watched History', value: 'history' },
    filterType: null,
    loaded: false,
    tokens: null,
    myInfo: null,
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
    updateFilterType(type) {
      this.filterType = type;
    },
    updateLoading(loaded) {
      this.loaded = loaded;
    },
    updateTokens(tokens) {
      this.tokens = { ...tokens };
    },
    updateMyInfo(myInfo) {
      this.myInfo = { ...myInfo };
    },
  },
});
