<template>
  <div v-if="loaded" class="search-container">
    <div>
      <div class="flex items-center q-mb-sm q-mt-xs">
        <q-icon name="task_alt" size="24px" class="q-mr-xs" />
        <h1 class="search-heading">Search:</h1>
        <q-chip
          v-for="term in searchTerm.split(' ')"
          :key="term"
          :label="term"
          size="md"
          color="secondary"
          class="text-capitalize"
          :removable="searchTerm.split(' ').length > 1"
          outline
          square
          :ripple="false"
          @remove="handleRemoveTerm(term)"
        />
      </div>
      <q-scroll-area :thumb-style="{ opacity: 0.5 }" class="scroll-container">
        <ItemCardContainer v-if="searchResults?.length > 0">
          <ItemCard
            v-for="result in searchResults"
            :key="result.id"
            :title="result.media_type === 'tv' ? result.name : result.title"
            :mediaType="result.media_type === 'tv' ? 'tv' : 'movie'"
            :poster="result.poster_path"
            :backdrop="result.backdrop_path"
            :overview="result.overview"
            @click="goToDetails(result)"
          />
        </ItemCardContainer>
        <div v-else>No results found for "{{ searchTerm }}"</div>
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
import ItemCardContainer from '@/components/ItemCardContainer.vue';
import ItemCard from '@/components/ItemCard.vue';

export default {
  components: { ItemCardContainer, ItemCard },
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
    this.searchTerm = this.$route.query.term;
    this.getData();
  },
  async updated() {
    if (this.$route.query.term !== this.searchTerm) {
      this.searchTerm = this.$route.query.term;
      this.getData();
    }
  },
  computed: {
    screenGreaterThan() {
      return this.$q.screen.gt;
    },
  },
  methods: {
    async getData() {
      this.store.updateLoading(false);
      this.searchResults = await getSearchResults(this.$route.query.term, this.searchPage);
      setTimeout(() => {
        this.store.updateLoading(true);
      }, 1000);
    },
    async goToDetails(item) {
      const mType = item.media_type === 'tv' ? 'show' : 'movie';
      this.$router.push({
        name: mType === 'show' ? 'show-details' : 'movie-details',
        params: {
          [mType]: item.ids.slug,
        },
      });
    },
    handleRemoveTerm(term) {
      this.searchTerm = this.searchTerm
        .split(' ')
        .filter((word) => word !== term)
        .join(' ');
      this.$router.push({ name: 'search', query: { term: this.searchTerm } });
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

h1 {
  font-size: 1.5rem;
}
.search-heading {
  margin: 0 $space-sm 0 0;
  @include text-ellipsis;
}
.search-container {
  height: 100%;
  padding: 0 $space-sm $space-sm $space-sm;
  width: 100%;
  max-width: 100%;
  & > div {
    height: 100%;
    width: 100%;
    max-width: 100%;
    padding: $space-sm;
    @include background-style;
  }
  & .scroll-container {
    height: calc(100% - 60px);
    width: 100%;
    max-width: 100%;
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
