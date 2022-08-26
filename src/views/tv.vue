<template>
  <div :class="['full-height', 'tv-container']" v-if="loaded">
    <CardContainer :data="data?.items" :mType="store.filterType" />
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
import { getWatchedHistory, getRecommendationsFromMe, getTrending } from '@/api/trakt';
import { getEpisodeInfoCard, getShowInfoCard } from '@/api/combinedCalls';
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
      myEpRatings: ref(null),
      myShowRatings: ref(null),
      page: ref(store.page),
      store,
      tokens: ref(store.tokens),
    };
  },
  async created() {
    this.store.$subscribe((mutated, state) => {
      let loadData = false;
      if (state.filter && this.filter !== state.filter) {
        loadData = true;
      }

      this.filter = state.filter;
      this.loaded = state.loaded;
      this.tokens = state.tokens;
      this.page = state.page;

      if (loadData) this.loadData();
    });

    this.store.updateFilterType('show');

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

      // this makes it so the card container always has a full last line
      localStorage.setItem('item-limit', this.screenGreaterThan.lg ? 21 : 20);

      if (this.store.filterType === 'show' && this.filter.value === 'history') {
        // get Trakt data
        this.data = await getWatchedHistory('episodes', this.page);

        // get episode ratings object from local storage
        this.myEpRatings = JSON.parse(localStorage.getItem('trakt-vue-episode-ratings'));

        // get images and ratings
        const items = await this.fetchCardInfo('episode', this.myEpRatings);

        // sort by watched date (no logic here because only one filter)
        items.sort((a, b) => new Date(b.watched_at) - new Date(a.watched_at));

        this.data.items = [...items];
      } else {
        switch (this.filter.value) {
          case 'recommended':
            this.data = await getRecommendationsFromMe('shows', this.page);
            break;
          default:
            // default to trending
            this.data = await getTrending('shows', this.page);
        }

        // get show ratings object from local storage
        this.myShowRatings = JSON.parse(localStorage.getItem('trakt-vue-show-ratings'));

        // get images and ratings
        const items = await this.fetchCardInfo('show', this.myShowRatings);

        if (this.filter.value === 'recommended') {
          items.sort((a, b) => a.rank - b.rank);
        } else if (this.filter.value === 'trending') {
          items.sort((a, b) => b.watchers - a.watchers);
        }

        this.data.items = [...items];
      }
      this.store.updateLoading(true);
    },
    async fetchCardInfo(mType, ratingsObj) {
      const items = [];
      await Promise.all(
        this.data.items.map(async (item) => {
          const cardInfo =
            mType === 'show'
              ? await getShowInfoCard(item.show)
              : await getEpisodeInfoCard(item.show, item.episode);
          const myRating = {};
          myRating.my_rating = ratingsObj?.ratings.find((rating) => {
            if (mType === 'show') {
              return !('episode' in rating) && rating.show.ids.trakt === item.show.ids.trakt;
            }
            return rating.episode.ids.trakt === item.episode.ids.trakt;
          });
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
