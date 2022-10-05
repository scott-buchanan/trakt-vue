<template>
  <DetailsTemplate
    v-if="loaded"
    :info="info"
    :poster="info.poster"
    :title="info.title"
    :subTitle="info.tmdb_data.name"
    :technicalDetails="arrDetails"
    :linkIds="info.show.ids"
    mType="season"
  >
    <template #season-episode-list>
      <div class="q-mt-lg">
        <h1>
          {{ info.tmdb_data?.episodes.length }} Episodes
          <small v-if="unairedEpisodes > 0"> ({{ unairedEpisodes }} unaired episodes) </small>
        </h1>
        <ItemCardContainer oneRowLonger>
          <ItemCard
            episode
            v-for="episode in info.tmdb_data?.episodes"
            :key="episode.name"
            v-show="isBeforeToday(episode.air_date)"
            :title="episodeTitle(episode)"
            :poster="episode.backdrop.backdrop_sm"
            :overview="episode.overview"
            :aired="episode.air_date"
            :backdrop="episode.backdrop.backdrop_lg"
            @click="handleEpisodeClick(episode)"
          />
        </ItemCardContainer>
      </div>
    </template>
  </DetailsTemplate>
</template>

<script>
import { ref } from 'vue';
import dayjs from 'dayjs';
// store
import { useStore } from '@/store/index';
// api
import { getSeasonDetails } from '@/api/combinedCalls';
// components
import DetailsTemplate from '@/components/DetailsTemplate.vue';
import ItemCard from '@/components/ItemCard.vue';
import ItemCardContainer from '@/components/ItemCardContainer.vue';

export default {
  components: { DetailsTemplate, ItemCardContainer, ItemCard },
  name: 'seasonDetails',
  setup() {
    const store = useStore();
    return {
      arrDetails: ref([]),
      loaded: ref(false),
      store,
    };
  },
  async created() {
    this.store.$subscribe((mutated, state) => {
      this.loaded = state.loaded;
    });

    this.store.updateLoading(false);
    this.store.updateFilterType('show');

    await this.getData();

    this.store.updateLoading(true);
  },
  computed: {
    unairedEpisodes() {
      let count = 0;
      this.info.tmdb_data?.episodes.forEach((episode) => {
        if (new Date(episode.air_date) > new Date()) count += 1;
      });
      return count;
    },
    detailsBackground() {
      return `linear-gradient(to top right, rgba(0,0,0,.8), rgba(0,0,0,.5) 70%, rgba(0,0,0,.3)),
              linear-gradient(to top      , rgba(0,0,0,.5), rgba(0,0,0,.2) 70%, rgba(0,0,0,0)),
              linear-gradient(to right    , rgba(0,0,0,.5), rgba(0,0,0,.2) 70%, rgba(0,0,0,0)),
              url(${this.info?.backdrop.backdrop_lg})`;
    },
    screenGreaterThan() {
      return this.$q.screen.gt;
    },
  },
  methods: {
    episodeTitle(episode) {
      return `${episode.season_number}x${episode.episode_number.toString().padStart(2, 0)} ${
        episode.name
      }`;
    },
    isBeforeToday(episodeDate) {
      return new Date(episodeDate) < new Date();
    },
    async getData() {
      this.store.updateLoading(false);

      this.info = await getSeasonDetails(this.$route.params.show, this.$route.params.season);
      this.arrDetails = [
        { label: 'aired', value: this.formattedDate(this.info.tmdb_data.air_date) },
        { label: 'network', value: this.info.network },
      ];

      this.store.updateLoading(true);
    },
    handleEpisodeClick(episode) {
      this.$router.push({
        name: 'episode-details',
        params: {
          show: this.info.show.ids.slug,
          season: episode.season_number,
          episode: episode.episode_number,
        },
      });
    },
    formattedDate(wDate) {
      return dayjs(wDate).format('MMM DD, YYYY');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/css/quasar.variables.scss';

h1 {
  font-weight: 400;
}
</style>
