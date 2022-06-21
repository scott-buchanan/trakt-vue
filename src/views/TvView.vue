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
        } else {
          getShowInfo(data.show.ids).then(async (info) => {
            data.backdrop = info.image;
            data.tmdb_rating = info.tmdb_rating;
            data.clear_logo = info.clear_logo;
            data.genres = info.genres;
            data.trakt_rating = await trakt.getShowRating(data.show.ids.trakt);
          });
        }
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
