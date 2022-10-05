<template>
  <div :class="['full-height', 'movie-container']" v-if="store.loaded">
    <CardContainer :data="data?.items" mType="movie" />
  </div>
  <q-footer v-if="store.loaded && data?.pagesTotal > 1" :class="['text-white', 'footer']">
    <q-toolbar class="flex flex-center">
      <q-pagination
        v-model="page"
        color="secondary"
        active-color="secondary"
        outline
        :max="data?.pagesTotal"
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
import { getWatchedHistory, getRecommendationsFromMe, getTrending } from '@/api/trakt';
import { getMovieInfoCard } from '@/api/combinedCalls';
// store
import { useStore } from '@/store/index';
// components
import CardContainer from '@/components/CardContainer.vue';

export default {
  components: { CardContainer },
  name: 'MovieView',
  setup() {
    const store = useStore();
    return {
      data: ref({}),
      filter: ref(store.filter?.value),
      maxPages: ref(10),
      myMovieRatings: ref(null),
      page: ref(1),
      store,
      tokens: ref(null),
    };
  },
  async created() {
    this.store.$subscribe((mutated, state) => {
      let loadData = false;
      if (state.filterType === 'movie' && state.filter !== this.filter) {
        loadData = true;
      }

      this.filter = state.filter;
      this.tokens = state.tokens;
      this.page = state.page;

      if (loadData) this.loadData();
    });

    this.store.updateFilterType('movie');
    if (this.$route.params?.filter) {
      this.store.updateFilter(
        this.store.filterOptions.movie.find((filter) => filter.value === this.$route.params.filter)
      );
    }

    this.loadData();

    if (this.$route.query.page) {
      this.page = parseInt(this.$route.query.page, 10);
    }
  },
  computed: {
    screenGreaterThan() {
      return this.$q.screen.gt;
    },
  },
  methods: {
    async loadData() {
      this.store.updateLoading(false);

      // this makes it so the card container always has a full last line
      localStorage.setItem('item-limit', this.screenGreaterThan.lg ? 21 : 20);

      switch (this.store.filter?.value) {
        case 'history':
          this.data = await getWatchedHistory('movies', this.page);
          break;
        case 'recommended':
          this.data = await getRecommendationsFromMe('movies', this.page);
          break;
        case 'trending':
          this.data = await getTrending('movies', this.page);
          break;
        default:
          this.store.updateLoading(true);
          return;
      }

      // get movie ratings object from local storage
      this.myMovieRatings = JSON.parse(localStorage.getItem('trakt-vue-movie-ratings'));

      // get images and ratings
      const items = await this.fetchCardInfo(this.myMovieRatings);

      if (this.store.filter?.value === 'history') {
        items.sort((a, b) => new Date(b.watched_at) - new Date(a.watched_at));
      } else if (this.filter?.value === 'trending') {
        items.sort((a, b) => b.watchers - a.watchers);
      }

      this.data.items = [...items];

      this.store.updateLoading(true);
    },
    async fetchCardInfo(ratingsObj) {
      const items = [];
      await Promise.all(
        this.data.items.map(async (item) => {
          const cardInfo = await getMovieInfoCard(item.movie);
          const myRating = {};
          myRating.my_rating = ratingsObj?.ratings.find(
            (rating) => rating.movie.ids.trakt === item.movie.ids.trakt
          );
          items.push({ ...item, ...cardInfo, ...myRating });
        })
      );
      return items;
    },
    changePage() {
      this.loadData();
      this.store.updatePage(this.page);
      this.$router.replace({ query: { page: this.page } });
      localStorage.setItem('trakt-vue-page', this.page);
      window.scrollTo(0, 0);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/css/quasar.variables.scss';

.movie-container {
  padding: 0 $space-sm $space-sm $space-sm;
  & > div {
    @include background-style;
    overflow: hidden;
  }
}
.footer {
  padding: 0 $space-sm $space-sm $space-sm;
  background-color: transparent !important;
  & > div {
    @include background-style;
  }
}
</style>
