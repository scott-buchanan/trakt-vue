<template>
  <DetailsTemplate
    v-if="loaded"
    :info="info"
    :poster="info.show_poster"
    :title="info.title"
    :subTitle="info.year"
    :technicalDetails="arrDetails"
    mType="show"
  />
</template>

<script>
import { ref } from 'vue';
import dayjs from 'dayjs';
// store
import { useStore } from '@/store/index';
// api
import { getShowDetails } from '@/api/combinedCalls';
// components
import DetailsTemplate from '@/components/DetailsTemplate.vue';

export default {
  components: { DetailsTemplate },
  name: 'tv',
  setup() {
    const store = useStore();
    return {
      info: ref({}),
      arrDetails: ref([]),
      loaded: ref(false),
      // watchedProgress: ref(0),
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
  async updated() {
    if (this.info && this.$route.params.show) {
      const params = this.$route.params.show;
      const showId = this.info.show.ids.slug;
      if (showId !== params) {
        await this.getData();
      }
    }
  },
  computed: {
    languageListString() {
      const langs = this.info.tmdb_data.spoken_languages;
      let strLang = '';
      for (let i = 0; i < langs.length; i += 1) {
        strLang += `${langs[i].english_name}${i !== langs.length - 1 ? ', ' : ''}`;
      }
      return strLang;
    },
    genreListString() {
      const { genres } = this.info.tmdb_data;
      let strGenres = '';
      for (let i = 0; i < genres.length; i += 1) {
        strGenres += `${genres[i].name}${i !== genres.length - 1 ? ', ' : ''}`;
      }
      return strGenres;
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
    async getData() {
      this.store.updateLoading(false);

      this.info = await getShowDetails(this.$route.params.show);

      this.arrDetails = [
        { label: 'seasons', value: this.info.tmdb_data.number_of_seasons },
        { label: 'episodes', value: this.info.tmdb_data.number_of_episodes },
        { label: 'runtime', value: `${this.info.runtime} minutes` },
        { label: 'genres', value: this.genreListString },
        { label: 'first aired', value: this.formattedDate(this.info.first_aired) },
        { label: 'country', value: this.info.country.toUpperCase() },
        { label: 'network', value: this.info.network },
        { label: 'languages', value: this.languageListString },
      ];

      this.store.updateLoading(true);
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
.background {
  background-size: cover;
  background-position: center;
  background-color: transparent;
  height: 100%;
  border-radius: 5px;
  overflow: hidden;
  & .show-logo {
    width: 100%;
    max-width: 250px;
    height: 97px;
  }
}
.details-container {
  padding: 0 $space-sm $space-sm 0;
  display: flex;
  height: 100%;
  & > div:first-child {
    flex: 1;
  }
}
.poster {
  width: 50%;
  min-width: 200px;
  max-width: 400px;
  & > div {
    border-radius: 5px;
    overflow: hidden;
  }
}
.ratings {
  display: flex;
  & > div {
    display: flex;
    align-items: center;
  }
  & > div > img {
    width: 35px;
  }
  & > div > div:nth-child(2) {
    font-size: 24px;
    margin: 0 10px 0 10px;
  }
}
.certification {
  border: 1px solid $secondary;
  color: $secondary;
  border-radius: 3px;
  padding: 3px 5px;
  font-size: 0.75em;
}
.show-info {
  flex-wrap: wrap;
  & > div {
    margin-right: $space-md;
  }
  & span {
    @include darkText;
  }
}
</style>
