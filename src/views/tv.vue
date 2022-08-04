<template>
  <div :class="['q-pr-sm', 'full-height', 'tv-container']" v-if="loaded">
    <card-container :data="data?.items" :mType="mType" />
  </div>
  <q-footer v-if="loaded && data?.pagesTotal > 1" :class="['q-pa-sm', 'text-white', 'footer']">
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
import trakt from '@/api/trakt';
import { getEpisodeInfo, getShowInfo } from '@/api/tmdb';
// store
import { useStore } from '@/store/index';
// components
import CardContainer from '@/components/CardContainer.vue';

export default {
  components: { CardContainer },
  name: 'TvView',
  setup() {
    const store = useStore();
    return {
      data: ref({}),
      filter: ref(store.filter),
      loaded: ref(false),
      maxPages: ref(10),
      mType: ref(null),
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
      if (this.filter === 'history') {
        // get Trakt data
        this.data = await trakt.getHistoryEpisodes(this.page);
        this.mType = 'episode';

        // get episode ratings
        this.myEpRatings = await trakt.getMyEpisodeRatings(1);
        const storedRatings = JSON.parse(localStorage.getItem('trakt-vue-episode-ratings'));
        if (storedRatings?.lastModified !== this.myEpRatings.lastModified) {
          // getting the big rating object if ratings have changed
          trakt.getMyEpisodeRatings().then((remainingRatings) => {
            this.myEpRatings = { ...this.myEpRatings, ...remainingRatings };
            localStorage.setItem('trakt-vue-episode-ratings', JSON.stringify(this.myEpRatings));
          });
        }

        // get images
        const items = [];
        await Promise.all(
          this.data.items.map(async (item) => {
            const images = await getEpisodeInfo(item.show, item.episode);
            // insert my rating
            const myRating = {};
            myRating.my_rating = this.myEpRatings.ratings.find(
              (rating) => rating.episode.ids.tmdb === item.episode.ids.tmdb,
            );
            items.push({ ...item, ...images, ...myRating });
          }),
        );
        items.sort((a, b) => new Date(b.watched_at) - new Date(a.watched_at));
        this.data.items = [...items];
      } else if (this.filter === 'recommended' || this.filter === 'trending') {
        switch (this.filter) {
          case 'recommended':
            this.data = await trakt.getRecommendationsFromMe('shows', this.page);
            break;
          default:
            this.data = await trakt.getTrendingShows(this.page);
        }

        this.mType = 'show';

        // get show ratings
        const ratings = await trakt.getMyShowRatings(1);
        const storedRatings = JSON.parse(localStorage.getItem('trakt-vue-show-ratings'));
        // only get the big rating object if new ratings have been added
        if (storedRatings?.lastModified !== ratings.lastModified) {
          this.myShowRatings = { ...ratings };
          trakt.getMyShowRatings().then((remainingRatings) => {
            this.myShowRatings = { ...this.myShowRatings, ...remainingRatings };
            localStorage.setItem('trakt-vue-show-ratings', JSON.stringify(this.myShowRatings));
          });
        }

        // get images
        const items = [];
        await Promise.all(
          this.data.items.map(async (item) => {
            const images = await getShowInfo(item.show.ids);
            // insert my rating
            const myRating = {};
            myRating.my_rating = this.myShowRatings.ratings.find(
              (rating) => !('episode' in rating) && rating.show.ids.tmdb === item.show.ids.tmdb,
            );
            items.push({ ...item, ...images, ...myRating });
          }),
        );
        items.sort((a, b) => a.rank - b.rank);
        this.data.items = [...items];
      }
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
  & > div {
    @include background-style;
    overflow: hidden;
  }
}
.footer {
  background-color: transparent !important;
  padding-left: 0;
  & > div {
    @include background-style;
  }
}
</style>
