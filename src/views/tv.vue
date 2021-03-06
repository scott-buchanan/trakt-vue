<template>
  <div class="tv-container" v-if="loaded">
    <card-container :data="data?.items" :mType="mType" />
  </div>
  <q-footer v-if="loaded && data?.pagesTotal > 1" class="text-white footer">
    <q-toolbar class="flex flex-center">
      <q-pagination
        v-model="page"
        color="secondary"
        active-color="secondary"
        outline
        :max="data?.pagesTotal"
        :max-pages="maxPages"
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
import { useStore } from '@/store/index';
import CardContainer from '@/components/CardContainer.vue';
import trakt from '../api/trakt';
import { getEpisodeInfo, getShowInfo } from '../api/tmdb';

export default {
  components: { CardContainer },
  name: 'TvView',
  setup() {
    const store = useStore();
    return {
      page: ref(1),
      maxPages: ref(10),
      store,
      data: ref({}),
      filter: ref('history'),
      mType: ref(null),
      loaded: ref(false),
      myRatings: ref(JSON.parse(localStorage.getItem('trakt-vue-episode-ratings'))),
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
      if (loadData) this.loadData();
    });
    if (this.$route.query.page) {
      this.page = parseInt(this.$route.query.page, 10);
    }
    this.loadData();
  },
  methods: {
    async loadData() {
      this.store.updateLoading(false);
      if (this.filter === 'history') {
        // get Trakt data
        this.data = await trakt.getHistoryEpisodes(this.page);
        this.mType = 'episode';

        // get episode ratings
        const ratings = await trakt.getMyEpisodeRatings(1);
        const storedRatings = JSON.parse(localStorage.getItem('trakt-vue-episode-ratings'));
        if (storedRatings?.lastModified !== ratings.lastModified) {
          this.myRatings = { ...ratings };
          // getting the big rating object if ratings have changed
          trakt.getMyEpisodeRatings().then((remainingRatings) => {
            this.myRatings = { ...this.myRatings, ...remainingRatings };
            localStorage.setItem('trakt-vue-episode-ratings', JSON.stringify(this.myRatings));
          });
        }

        // get images
        const items = [];
        await Promise.all(
          this.data.items.map(async (item) => {
            const images = await getEpisodeInfo(item.show, item.episode);
            // insert my rating
            const myRating = {};
            myRating.my_rating = this.myRatings.ratings.find(
              (rating) => rating.episode.ids.tmdb === item.episode.ids.tmdb,
            );
            items.push({ ...item, ...images, ...myRating });
          }),
        );
        items.sort((a, b) => new Date(b.watched_at) - new Date(a.watched_at));
        this.data.items = [...items];
      } else if (this.filter === 'recommended') {
        this.data = await trakt.getRecommendationsFromMe('shows', this.page);
        this.mType = 'show';

        // get show ratings
        const ratings = await trakt.getMyShowRatings(1);
        const storedRatings = JSON.parse(localStorage.getItem('trakt-vue-show-ratings'));
        // only get the big rating object if new ratings have been added
        if (storedRatings?.lastModified !== ratings.lastModified) {
          this.myRatings = { ...ratings };
          trakt.getMyShowRatings().then((remainingRatings) => {
            this.myRatings = { ...this.myRatings, ...remainingRatings };
            localStorage.setItem('trakt-vue-show-ratings', JSON.stringify(this.myRatings));
          });
        }

        // get images
        const items = [];
        await Promise.all(
          this.data.items.map(async (item) => {
            const images = await getShowInfo(item.show.ids);
            // insert my rating
            const myRating = {};
            myRating.my_rating = this.myRatings.ratings.find(
              (rating) => rating.show.ids.tmdb === item.show.ids.tmdb,
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
  padding: 5px 5px 5px 0;
  height: 100%;
  & > div {
    @include background-style;
    overflow: hidden;
  }
}

.footer {
  padding: 0 5px 5px 0;
  background-color: transparent !important;
  & > div {
    @include background-style;
    width: auto !important;
  }
}
</style>
