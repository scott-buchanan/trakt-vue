/* eslint-disable */
import { defineStore } from 'pinia';

// useStore could be anything like useUser, useCart
// the first argument is a unique id of the store across your application
export const useStore = defineStore('main', {
  state: () => ({
    data: null,
    page: 1,
    filter: { label: null, value: null, auth: null },
    filterOptions: {
      show: [
        { label: 'Trending', value: 'trending', auth: false },
        { label: 'Watch History', value: 'history', auth: true },
        { label: 'My Recommended', value: 'recommended', auth: true },
      ],
      movie: [
        { label: 'Trending', value: 'trending', auth: false },
        { label: 'Watch History', value: 'history', auth: true },
        { label: 'My Recommended', value: 'recommended', auth: true },
      ],
    },
    filterType: null,
    loaded: false,
    tokens: null,
    myInfo: null,
    menuVisible: false,
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
    updateMenuVisible(value) {
      this.menuVisible = value;
    },
  },
});
