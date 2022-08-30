<template>
  <DetailsTemplate
    v-if="loaded"
    :info="info"
    :poster="info.poster"
    :title="info.title"
    :subTitle="info.year"
    :technicalDetails="arrDetails"
    :linkIds="info.ids"
    mType="movie"
  />
</template>

<script>
import { ref } from 'vue';
import dayjs from 'dayjs';
// store
import { useStore } from '@/store/index';
// api
import { getMovieDetails } from '@/api/combinedCalls';
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
      store,
    };
  },
  async created() {
    this.store.$subscribe((mutated, state) => {
      this.loaded = state.loaded;
    });

    this.store.updateLoading(false);
    this.store.updateFilterType('movie');

    await this.getData();

    this.store.updateLoading(true);
  },
  async updated() {
    if (this.info && this.$route.params.movie) {
      const params = this.$route.params.movie;
      const movieId = this.info.ids.slug;
      if (movieId !== params) {
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
    PCListString() {
      const pcs = this.info.tmdb_data.production_companies;
      let strPC = '';
      for (let i = 0; i < pcs.length; i += 1) {
        strPC += `${pcs[i].name}${i !== pcs.length - 1 ? ', ' : ''}`;
      }
      return strPC;
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

      this.info = await getMovieDetails(this.$route.params.movie);

      this.arrDetails = [
        { label: 'runtime', value: `${this.info.runtime} minutes` },
        { label: 'released', value: `${this.formattedDate(this.info.released)}` },
        { label: 'country', value: this.info.country?.toUpperCase() },
        { label: 'languages', value: this.languageListString },
        {
          label: 'budget',
          value: this.info.tmdb_data.budget
            ? new Intl.NumberFormat('en-CA', {
                style: 'currency',
                maximumFractionDigits: 0,
                currency: 'CAD',
              }).format(this.info.tmdb_data.budget)
            : null,
        },
        {
          label: 'revenue',
          value: this.info.tmdb_data.revenue
            ? new Intl.NumberFormat('en-CA', {
                style: 'currency',
                maximumFractionDigits: 0,
                currency: 'CAD',
              }).format(this.info.tmdb_data.revenue)
            : null,
        },
        { label: 'production companies', value: this.PCListString },
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
