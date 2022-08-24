<template>
  <div v-if="loaded" class="search-container">
    <div>
      <h1 class="q-mt-sm">Search: {{ searchTerm }}</h1>
      <q-scroll-area :thumb-style="{ opacity: 0.5 }" :class="['full-height', 'full-width']">
        <div class="row">
          <button
            v-for="result in searchResults"
            :key="result.id"
            :class="[
              'search-result-button',
              'q-mb-sm',
              'text-left',
              screenGreaterThan.md ? 'col-6 pad' : 'col-12',
            ]"
            @click="goToDetails(result)"
          >
            <div
              class="search-result"
              :style="{
                backgroundImage: `${backgroundGradient()} url(https://image.tmdb.org/t/p/w1280/${
                  result.backdrop_path
                })`,
              }"
            >
              <img
                v-if="result.poster_path"
                :src="`https://image.tmdb.org/t/p/w500/${result.poster_path}`"
                :alt="result.name"
              />
              <img v-else src="@/assets/fallback-tv.jpg" alt="generic poster" />
              <div class="q-pa-md column no-wrap">
                <h1 class="q-mt-none">
                  {{ result.media_type === 'tv' ? result.name : result.title }}
                </h1>
                <h2>{{ result.media_type === 'tv' ? 'TV Show' : 'Movie' }}</h2>
                <p :class="['q-mb-none', 'col-grow', 'truncate-text']">
                  {{ result.overview }}
                </p>
              </div>
            </div>
          </button>
        </div>
      </q-scroll-area>
    </div>
  </div>
  <q-footer v-if="loaded && store?.pagesTotal > 1" :class="['text-white', 'footer']">
    <q-toolbar class="flex flex-center">
      <q-pagination
        v-model="page"
        color="secondary"
        active-color="secondary"
        outline
        :max="store?.pagesTotal"
        :max-pages="screenGreaterThan.sm ? maxPages : 3"
        boundary-numbers
        ripple
        unelevated
        @click="changePage"
      />
    </q-toolbar>
  </q-footer>
</template>

<script>
import { ref } from 'vue';
// api
import { getSearchResults } from '@/api/tmdb';
// store
import { useStore } from '@/store/index';
// components

export default {
  components: {},
  name: 'Search',
  setup() {
    const store = useStore();
    return {
      searchPage: ref(1),
      searchResults: ref(null),
      store,
      searchTerm: ref(null),
      loaded: ref(false),
    };
  },
  async created() {
    this.store.$subscribe((mutated, state) => {
      this.searchPage = state.searchPage;
      this.loaded = state.loaded;
    });
    this.store.updateLoading(false);
    this.searchTerm = this.$route.query.term;
    this.searchResults = await getSearchResults(this.$route.query.term, this.searchPage);
    // simulate load time
    setTimeout(() => {
      this.store.updateLoading(true);
    }, 1000);
  },
  async updated() {
    if (this.$route.query.term !== this.searchTerm) {
      this.searchTerm = this.$route.query.term;
      this.searchResults = await getSearchResults(this.$route.query.term, this.searchPage);
    }
  },
  computed: {
    screenGreaterThan() {
      return this.$q.screen.gt;
    },
  },
  methods: {
    async goToDetails(item) {
      const mType = item.media_type === 'tv' ? 'show' : 'movie';
      this.$router.push({
        name: mType === 'show' ? 'show-details' : 'movie-details',
        params: {
          [mType]: item.ids.slug,
        },
      });
    },
    changePage() {
      this.loadData();
      this.store.updatePage(this.page);
      this.$router.replace({ query: { page: this.page } });
      localStorage.setItem('trakt-vue-page', this.page);
      window.scrollTo(0, 0);
    },
    backgroundGradient() {
      return `linear-gradient(to top right, rgba(0,0,0,.8), rgba(0,0,0,.5) 70%, rgba(0,0,0,.3)),
         linear-gradient(to top      , rgba(0,0,0,.5), rgba(0,0,0,.2) 70%, rgba(0,0,0,0)),
         linear-gradient(to right    , rgba(0,0,0,.5), rgba(0,0,0,.2) 70%, rgba(0,0,0,0)),`;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/css/quasar.variables.scss';

h2 {
  font-size: 1rem !important;
}
.search-container {
  height: 100%;
  padding: 0 $space-sm $space-sm 0;
  & > div {
    height: 100%;
    padding: $space-sm;
    @include background-style;
  }
}
.search-result-button {
  background: none;
  border: none;
  margin: 0;
  padding: 0 0 $space-sm 0;
  &:last-child {
    padding-bottom: 0;
  }
  &.pad {
    padding: 0 $space-sm $space-sm 0;
    &:nth-child(2n) {
      padding-right: 0;
    }
    &:nth-last-child(-n + 2) {
      padding-bottom: 0;
    }
  }
}
.search-result {
  height: 200px;
  display: flex;
  @include background-style;
  overflow: hidden;
  color: white;
  background-position: top center;
  background-size: cover;
  border: none;
  padding: 0;
  & img {
    height: 100%;
    max-width: 133px;
    object-fit: cover;
  }
}
.truncate-text {
  overflow: hidden;
  display: -webkit-box !important;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  white-space: normal;
}
.footer {
  padding: 0 $space-sm $space-sm 0;
  background-color: transparent !important;
  padding-left: 0;
  & > div {
    @include background-style;
  }
}
</style>
