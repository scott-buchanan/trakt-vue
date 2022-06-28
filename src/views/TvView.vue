<template>
  <div v-if="loaded">
    <card-container :data="data?.items" :mType="mType" />
    <q-footer v-if="data?.pagesTotal > 1" elevated class="text-white bg-dark">
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
  </div>
  <div v-else class="spinner">
    <q-spinner-tail color="secondary" size="5em" />
  </div>
</template>

<script>
import { ref } from 'vue';
import { useStore } from '@/store/index';
import CardContainer from '@/components/CardContainer.vue';
import trakt from '../api/trakt';
import { getTMDBEpisodeInfo } from '../api/tmdb';

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
      myRatings: ref(JSON.parse(localStorage.getItem('trakt-vue-ratings'))),
    };
  },
  async created() {
    this.store.$subscribe((mutated, state) => {
      this.filter = state.filter;
      this.loadData();
    });
    if (this.$router.currentRoute.value.query?.code) {
      if (localStorage.getItem('trakt-vue-page')) {
        this.page = parseInt(localStorage.getItem('trakt-vue-page'), 10);
      }
      this.$router.replace({
        path: '/',
        query: { page: this.page },
      });

      // get trakt token
      const authTokens = await trakt.getToken(this.$router.currentRoute.value.query?.code);
      localStorage.setItem('trakt-vue-token', authTokens.accessToken);

      this.loadData();
    } else {
      window.location = // eslint-disable-line
        'https://trakt.tv/oauth/authorize?response_type=code&client_id=8b333edc96a59498525b416e49995b338e2c53a03738becfce16461c1e1086a3&redirect_uri=http://localhost:8080';
    }
  },
  methods: {
    async loadData() {
      this.loaded = false;

      if (this.filter === 'history') {
        // get Trakt data
        this.data = await trakt.getHistoryEpisodes(this.page);
        this.mType = 'episode';

        // get Ratings
        const ratings = await trakt.getMyEpisodeRatings(1);
        const storedRatings = JSON.parse(localStorage.getItem('trakt-vue-ratings'));
        if (storedRatings?.lastModified !== ratings.lastModified) {
          this.myRatings = { ...ratings };
          console.log('getting the big ass rating object');
          trakt.getMyEpisodeRatings().then((remainingRatings) => {
            this.myRatings = { ...this.myRatings, ...remainingRatings };
            localStorage.setItem('trakt-vue-ratings', JSON.stringify(this.myRatings));
          });
        }

        // get images
        const items = [];
        await Promise.all(
          this.data.items.map(async (item) => {
            const images = await getTMDBEpisodeInfo(item.show, item.episode);
            // insert my rating
            const myRating = {};
            myRating.my_rating = this.myRatings.ratings.find(
              (rating) => rating.episode.ids.tmdb === item.episode.ids.tmdb,
            );
            items.push({ ...item, ...images, ...myRating });
          }),
        );
        items.sort((a, b) => new Date(b.watched_at) - new Date(a.watched_at));
        console.log(items);
        this.data.items = [...items];
        console.log(this.data.items);
      } else if (this.filter === 'recommended') {
        this.data = await trakt.getRecommendationsFromMe('shows', this.page);
        this.mType = 'show';
      }

      this.loaded = true;
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
.spinner {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
