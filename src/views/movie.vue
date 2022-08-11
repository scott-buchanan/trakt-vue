<template>
  <div :class="['full-height', 'tv-container']" v-if="loaded">
    <card-container :data="data?.items" :mType="filter.type.slice(0, -1)" />
  </div>
  <q-footer v-if="loaded && data?.pagesTotal > 1" :class="['text-white', 'footer']">
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
import { getWatchedHistory, getRecommendationsFromMe } from '@/api/trakt';
import { getInfo } from '@/api/tmdb';
// store
import { useStore } from '@/store/index';
// components
import CardContainer from '@/components/CardContainer.vue';

export default {
  components: { CardContainer },
  name: 'movie',
  setup() {
    const store = useStore();
    return {
      data: ref({}),
      filter: ref(store.filter),
      loaded: ref(false),
      maxPages: ref(10),
      myEpRatings: ref(JSON.parse(localStorage.getItem('trakt-vue-episode-ratings'))),
      myShowRatings: ref(JSON.parse(localStorage.getItem('trakt-vue-show-ratings'))),
      page: ref(1),
      store,
      tokens: ref(null),
    };
  },
  async created() {
    this.store.$subscribe((mutated, state) => {
      let loadData = false;
      if (this.filter !== state.filter) {
        loadData = true;
      }

      this.filter = state.filter;
      this.loaded = state.loaded;
      this.tokens = state.tokens;
      this.page = state.page;

      if (loadData) this.loadData();
    });

    // we set tokens in beforeEach in router so loadData should never have missing tokens
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

      // this makes it so the card container always has a full last row
      localStorage.setItem('item-limit', this.screenGreaterThan.lg ? 21 : 20);

      switch (this.filter.value) {
        case 'trending':
          this.data = await getRecommendationsFromMe(this.filter.type, this.page);
          break;
        default:
          this.data = await getWatchedHistory(this.filter.type, this.page);
      }

      this.myMovieRatings = JSON.parse(localStorage.getItem('trakt-vue-movie-ratings'));
      // get images and ratings
      const items = [];
      await Promise.all(
        this.data.items.map(async (item) => {
          const images = await getInfo('movie', item.movie.ids);
          const myRating = {};
          myRating.my_rating = this.myMovieRatings.ratings.find(
            (rating) => rating.movie.ids.trakt === item.movie.ids.trakt,
          );
          items.push({ ...item, ...images, ...myRating });
        }),
      );

      // if (this.filter.value === 'recommended') {
      //   items.sort((a, b) => a.rank - b.rank);
      // } else if (this.filter === 'trending') {
      //   items.sort((a, b) => b.watchers - a.watchers);
      // }

      this.data.items = [...items];
      this.store.updateLoading(true);
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

.tv-container {
  padding: 0 $space-sm $space-sm 0;
  & > div {
    @include background-style;
    overflow: hidden;
  }
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
