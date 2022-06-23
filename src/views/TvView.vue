<template>
  <div v-if="loaded">
    <card-container :data="data" :mType="mType" />
    <q-footer v-if="data.pagesTotal > 1" elevated class="text-white bg-dark">
      <q-toolbar class="flex flex-center">
        <q-pagination
          v-model="page"
          color="secondary"
          active-color="secondary"
          outline
          :max="data.pagesTotal"
          :max-pages="maxPages"
          boundary-numbers
          ripple
          unelevated
          @click="changePage"
        />
      </q-toolbar>
    </q-footer>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useStore } from '@/store/index';
import CardContainer from '@/components/CardContainer.vue';
// import { Scraper, CollectContent } from 'nodejs-web-scraper';
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
      data: ref(null),
      filter: ref('history'),
      mType: ref(null),
      loaded: ref(false),
      myRatings: ref(JSON.parse(localStorage.getItem('trakt-vue-ratings'))),
      // scraper: ref(null),
      // scraperConfig: ref({
      //   baseSiteUrl: 'https://imdb.com',
      //   startUrl: 'https://www.imdb.com/title/',
      //   maxRetries: 3,
      // }),
    };
  },
  async created() {
    // this.scraper = new Scraper(this.scraperConfig);
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
    } else {
      window.location = // eslint-disable-line
        'https://trakt.tv/oauth/authorize?response_type=code&client_id=8b333edc96a59498525b416e49995b338e2c53a03738becfce16461c1e1086a3&redirect_uri=http://localhost:8080';
    }
    this.loadData();
  },
  methods: {
    async loadData() {
      this.loaded = false;

      switch (this.filter) {
        case 'history':
          console.log('load history');
          this.data = await trakt.getHistoryEpisodes(this.page);
          trakt.getMyEpisodeRatings(1).then((ratings) => {
            const storedRatings = JSON.parse(localStorage.getItem('trakt-vue-ratings'));
            if (storedRatings?.lastModified !== ratings.lastModified) {
              this.myRatings = { ...ratings };
              console.log('getting the big ass rating object');
              trakt.getMyEpisodeRatings().then((remainingRatings) => {
                this.myRatings = { ...this.myRatings, ...remainingRatings };
                localStorage.setItem('trakt-vue-ratings', JSON.stringify(this.myRatings));
              });
            }
          });
          this.mType = 'episode';
          break;

        case 'recommended':
          console.log('load recommended');
          this.data = await trakt.getRecommendationsFromMe('shows', this.page);
          this.mType = 'show';
          break;

        default:
          this.data = null;
      }

      for (let i = 0; i < this.data?.items.length; i += 1) {
        const data = this.data.items[i];
        data.loaded = false;
        if (this.mType === 'episode') {
          // this.scraperConfig.startUrl = `${this.scraperConfig.startUrl}${data.episode.ids.imdb}`;
          // data.imdb_rating = new CollectContent('.details-desc a.tel', { name: 'phone' });
          // get background image for episode
          getEpisodeInfo(data.show.ids, data.episode.season, data.episode.number).then(
            async (info) => {
              data.backdrop = info.image;
              data.tmdb_rating = info.tmdb_rating;
              data.clear_logo = info.clear_logo;
              data.trakt_rating = await trakt.getEpisodeRating(
                data.show.ids.trakt,
                data.episode.season,
                data.episode.number,
              );
            },
          );
          data.my_rating = this.myRatings.ratings.find(
            (rating) => rating.episode.ids.tmdb === data.episode.ids.tmdb,
          );
        } else {
          getShowInfo(data.show.ids).then(async (info) => {
            data.backdrop = info.image;
            data.tmdb_rating = info.tmdb_rating;
            data.clear_logo = info.clear_logo;
            data.genres = info.genres;
            data.trakt_rating = await trakt.getShowRating(data.show.ids.trakt);
          });
        }
        // data.imdb_rating = new CollectContent('.details-desc a.tel', { name: 'phone' });
        this.loaded = true;
      }
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

<style lang="scss" scoped></style>
