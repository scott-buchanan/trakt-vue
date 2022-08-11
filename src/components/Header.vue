<template>
  <q-header reveal height-hint="98" class="header">
    <div :class="['row', 'items-center', 'justify-between', 'q-px-sm']">
      <q-input
        ref="searchInput"
        v-model="searchTypedValue"
        color="secondary"
        label-color="white"
        label="Search"
        outlined
        dense
        dark
        class="col-6"
        clearable
        @update:model-value="doSearch"
        @focus="showMenu = true"
        @blur="handleSearchBlur"
        @clear="autocompleteApiResults = []"
        @keydown="goSearch"
      >
        <template v-slot:append>
          <button @click="goSearch"><q-icon name="search" /></button>
        </template>
      </q-input>
      <q-menu
        v-if="showMenu"
        :model-value="showMenu"
        :target="$refs.searchInput"
        no-parent-event
        no-focus
        :offset="[0, 5]"
        max-height="90vh"
        fit
        class="autocomplete-menu"
        transition-show="jump-up"
        transition-hide="jump-up"
      >
        <q-list>
          <q-item
            v-for="result in autocompleteApiResults"
            :key="result.value"
            class="autocomplete-item"
            clickable
            @click="goToDetails(result)"
            v-close-popup
          >
            <q-item-section
              :style="{
                height: '90px',
              }"
              class="q-pl-sm"
              thumbnail
            >
              <img class="full-height" :src="result.thumbnail" alt="" />
            </q-item-section>
            <q-item-section>
              <div class="q-mb-xs flex items-center">
                <b>{{ result.label }}</b>
                <q-chip
                  :label="result.type === 'movie' ? 'Movie' : 'TV Show'"
                  square
                  color="white"
                  dense
                  size="sm"
                  icon-right
                  :icon="result.type === 'movie' ? 'theaters' : 'tv'"
                  class="q-ml-sm"
                />
              </div>
              <div>{{ result.year }}</div>
              <div>
                <template v-for="(genre, index) in result.genres" :key="genre">
                  <small class="text-capitalize">
                    {{ genre }}<template v-if="index !== result.genres.length - 1">, </template>
                  </small>
                </template>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-menu>
      <q-select
        v-model="filterModel"
        dense
        :options="filterOptions"
        label="Filter"
        color="secondary"
        label-color="white"
        :class="['q-my-sm', 'filter-select']"
        dark
        outlined
        @update:model-value="changeFilter"
      />
    </div>
  </q-header>
</template>

<script>
import { ref } from 'vue';
import dayjs from 'dayjs';
import * as fallbackPoster from '@/assets/fallback-tv.jpg';
// store
import { useStore } from '@/store/index';
// api
import { getSearchResults } from '@/api/tmdb';

export default {
  name: 'Header',
  props: {
    page: {
      type: Number,
      default: 1,
    },
  },
  setup() {
    const store = useStore();
    let filterOptions;
    if (window.location.pathname === '/movie') {
      filterOptions = [
        { label: 'Watch History', value: 'history', type: 'movies' },
        { label: 'My Recommended', value: 'recommended', type: 'movies' },
        { label: 'Trending', value: 'trending', type: 'movies' },
      ];
    } else {
      filterOptions = [
        { label: 'Watch History', value: 'history', type: 'episodes' },
        { label: 'My Recommended', value: 'recommended', type: 'shows' },
        { label: 'Trending', value: 'trending', type: 'shows' },
      ];
    }
    store.updateFilter(filterOptions[0]);
    return {
      store,
      filterOptions,
      filterModel: ref(filterOptions[0]),
      autocompleteApiResults: ref([]),
      searchOptions: ref([]),
      selectModel: ref(null),
      showMenu: ref(false),
      searchHasFocus: ref(false),
      searchTypedValue: ref(null),
      autocompleteTimer: ref(null),
    };
  },
  methods: {
    handleSearchBlur() {
      if (!document.activeElement.className.includes('autocomplete-item')) this.showMenu = false;
    },
    changeFilter() {
      this.store.updatePage(1);
      this.store.updateFilter(this.filterModel);
      this.$router.push({ path: '/tv' });
    },
    async doSearch(value) {
      this.searchTypedValue = value;
      if (value?.length > 1) {
        if (this.autocompleteTimer) {
          clearTimeout(this.autocompleteTimer);
        }
        this.autocompleteTimer = setTimeout(async () => {
          const results = await getSearchResults(value);
          this.autocompleteApiResults = [];
          results.forEach(async (result) => {
            this.autocompleteApiResults.push({
              ids: result.ids,
              label: result.media_type === 'movie' ? result.title : result.name,
              value: result.id,
              type: result.media_type,
              thumbnail: result.poster_path
                ? `https://image.tmdb.org/t/p/w200/${result.poster_path}`
                : fallbackPoster.default,
              year: dayjs(
                result.media_type === 'movie' ? result.release_date : result.first_air_date,
              ).format('YYYY'),
              genres: result.genres,
            });
          });
        }, 300);
      } else this.autocompleteApiResults = [];
    },
    async goToDetails(item) {
      this.$router.push({
        name: 'show-details',
        params: { ids: JSON.stringify(item.ids), show: item.label },
      });
    },
    goSearch(event) {
      if (this.searchTypedValue?.length > 0) {
        if (event.key?.toLowerCase() === 'enter' || event.type === 'click') {
          this.autocompleteApiResults = [];
          this.searchOptions = [];
          this.$router.push({ name: 'search', query: { term: this.searchTypedValue } });
        }
      }
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
    @media only screen and (max-width: $breakpoint-xs) {
      padding-top: $space-sm;
      & > label,
      > .filter-select {
        width: 100%;
        max-width: 100%;
      }
    }
  }
  & .filter-select {
    min-width: 177px;
  }
}
.scroll-area {
  width: 100%;
  height: 90vh;
}
.autocomplete-item {
  background-color: #1f1f1f;
  border-bottom: 1px solid $accent;
  font-size: 1.2em;
  &:hover {
    background-color: #313131;
  }
  &:last-child {
    border: none;
  }
  & :first-child {
    width: auto;
    padding: 0;
  }
  & img {
    object-fit: cover;
    aspect-ratio: 1/1.5;
  }
}
</style>
