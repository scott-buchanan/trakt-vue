<template>
  <DetailsTemplate
    v-if="loaded"
    :title="info.show.title"
    :subTitle="episodeTitle"
    :info="info"
    :poster="info.season_poster"
    :technicalDetails="arrDetails"
    mType="episode"
  />
</template>

<script>
import { ref } from 'vue';
import dayjs from 'dayjs';
// store
import { useStore } from '@/store/index';
// api
import { getEpisodeDetails } from '@/api/combinedCalls';
// components
import DetailsTemplate from '@/components/DetailsTemplate.vue';

export default {
  components: { DetailsTemplate },
  name: 'episodeDetails',
  setup() {
    const store = useStore();
    return {
      info: ref({}),
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

    this.info = await getEpisodeDetails(
      this.$route.params.show,
      this.$route.params.season,
      this.$route.params.episode
    );

    this.arrDetails = [
      { label: 'runtime', value: `${this.info.runtime} minutes` },
      { label: 'aired', value: this.formattedDate(this.info.first_aired) },
    ];

    this.store.updateLoading(true);
  },
  computed: {
    episodeTitle() {
      return `${this.info.season}x${this.info.number.toString().padStart(2, '0')} ${
        this.info.title
      }`;
    },
  },
  methods: {
    formattedDate(wDate) {
      return dayjs(wDate).format('MMM DD, YYYY');
    },
  },
};
</script>
