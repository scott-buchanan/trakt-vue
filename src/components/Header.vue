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
        @focus="searchHasFocus = true"
        @blur="handleSearchBlur"
        @clear="autocompleteApiResults = []"
        @keydown="goSearch"
      >
        <template v-slot:append>
          <button @click="goSearch"><q-icon name="search" /></button>
        </template>
      </q-input>
      <q-menu
        :model-value="showMenu"
        :target="$refs.searchInput"
        no-parent-event
        no-focus
        :offset="[0, 5]"
        max-height="90vh"
        fit
        persistent
        no-refocus
        class="autocomplete-menu"
        transition-show="jump-up"
        transition-hide="jump-down"
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
        :options="filterOptions[store.filterType]"
        label="Filter"
        color="secondary"
        label-color="white"
        :class="['q-my-sm', 'filter-select']"
        dense
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
    return {
      store,
      filterModel: ref(store.filter.label),
      autocompleteApiResults: ref([]),
      selectModel: ref(null),
      searchHasFocus: ref(false),
      searchTypedValue: ref(null),
      menuVisible: ref(store.menuVisible),
      autocompleteTimer: ref(null),
    };
  },
  created() {
    this.store.$subscribe((mutated, state) => {
      this.menuVisible = state.menuVisible;
    });
  },
  computed: {
    showMenu() {
      return this.searchHasFocus && this.menuVisible && this.autocompleteApiResults.length > 0;
    },
    filterOptions() {
      const options = {
        movie: [
          { label: 'Watch History', value: 'history' },
          { label: 'My Recommended', value: 'recommended' },
          { label: 'Trending', value: 'trending' },
        ],
        show: [
          { label: 'Watch History', value: 'history' },
          { label: 'My Recommended', value: 'recommended' },
          { label: 'Trending', value: 'trending' },
        ],
      };

      if (!localStorage.getItem('trakt-vue-user')) {
        Object.entries(options).forEach((mType) => {
          options[mType[0]] = mType[1].filter(
            (item) => item.value !== 'history' && item.value !== 'recommended'
          );
        });
      }
      return options;
    },
  },
  methods: {
    handleSearchBlur() {
      if (!document.activeElement.className.includes('autocomplete-item')) {
        this.searchHasFocus = false;
      }
    },
    changeFilter(value) {
      this.store.updatePage(1);
      this.store.updateFilter(value);
      this.$router.push({ path: this.store.filterType === 'movie' ? '/movie' : '/tv' });
    },
    async doSearch(value) {
      this.store.updateMenuVisible(true);
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
                result.media_type === 'movie' ? result.release_date : result.first_air_date
              ).format('YYYY'),
              genres: result.genres,
            });
          });
        }, 300);
      } else this.autocompleteApiResults = [];
    },
    async goToDetails(item) {
      const mType = item.type === 'movie' ? 'movie' : 'show';
      const urlTitle = item.ids.slug;
      const params = {
        [mType]: urlTitle,
      };

      this.searchTypedValue = null;
      this.autocompleteApiResults = [];

      if (mType === 'show' && item.episode) {
        params.season = item.episode.season;
        params.episode = item.episode.number;
      }
      this.$router.push({
        name: `${mType}-details`,
        params,
      });
    },
    goSearch(event) {
      if (this.searchTypedValue?.length > 0) {
        if (event.key?.toLowerCase() === 'enter' || event.type === 'click') {
          this.store.updateMenuVisible(false);
          const searchTerm = this.searchTypedValue;
          this.searchTypedValue = null;
          this.autocompleteApiResults = [];
          this.$router.push({ name: 'search', query: { term: searchTerm } });
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
