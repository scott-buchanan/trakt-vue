<template>
  <DetailsTemplate
    v-if="loaded"
    :info="info"
    :poster="info.show_poster"
    :title="info.title"
    :subTitle="info.year"
    :technicalDetails="arrDetails"
    :linkIds="info.ids"
    mType="show"
  >
    <template #show-seasons>
      <div class="q-mt-lg">
        <h2>
          {{ seasonLength }}
          {{ seasonLength > 1 ? 'Seasons' : 'Season' }}
        </h2>
        <div class="seasons">
          <div v-for="(season, index) in seasons" :key="season.id">
            <router-link
              class="relative-position"
              :to="{
                name: 'season-details',
                params: { show: $route.params.show, season: season.season_number },
              }"
            >
              <q-img width="150px" :ratio="1 / 1.5" :src="season.poster_path" :alt="season.name">
                <div v-if="user && season.name.toLowerCase() !== 'specials'" class="season-watched">
                  <q-knob
                    readonly
                    :max="1"
                    :model-value="seasons[index]?.watched_progress"
                    show-value
                    size="30px"
                    :thickness="0.2"
                    color="secondary"
                    track-color="grey-9"
                    class="text-white"
                  >
                    <q-icon name="check_circle_outline" size="xs" color="positive" />
                  </q-knob>
                  <q-tooltip>
                    {{ seasons[index]?.watched_percent }}
                  </q-tooltip>
                </div>
                <!-- <div :class="['season-caption', 'absolute-bottom']">
                  {{ season.name }}
                </div> -->
              </q-img>
            </router-link>
          </div>
        </div>
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
      seasons: ref(null),
      loaded: ref(false),
      user: ref(JSON.parse(localStorage.getItem('trakt-vue-user'))?.user),
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
    seasonLength() {
      return this.info.tmdb_data.seasons.filter(
        (season) => season.name.toLowerCase() !== 'specials'
      ).length;
    },
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
        { label: 'premiered', value: this.formattedDate(this.info.first_aired) },
        { label: 'runtime', value: `${this.info.runtime} minutes` },
        { label: 'genres', value: this.genreListString },
        { label: 'country', value: this.info.country.toUpperCase() },
        { label: 'network', value: this.info.network },
        { label: 'languages', value: this.languageListString },
      ];
      this.seasons = [...this.info.tmdb_data.seasons];
      // set watched progress for each season and add delay (animation)
      this.info.watched_progress?.seasons.forEach((season, index) => {
        if (this.seasons[index]) {
          const delay = season.number > 1 ? season.number * 200 + 500 : 500;
          this.seasons[index].watched_progress = 0;
          setTimeout(() => {
            this.seasons[index].watched_progress = season.completed / season.aired;
            this.seasons[
              index
            ].watched_percent = `${season.completed} out of ${season.aired} watched`;
          }, delay);
        }
      });

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

.seasons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 25px;
  & :deep(.q-img) {
    border-radius: 5px;
  }
  & .season-caption {
    font-size: 0.85em;
    padding: 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  & .season-watched {
    padding: 5px;
    position: absolute;
    top: 5px;
    right: 5px;
    border-radius: 5px;
  }
}
</style>
