<template>
  <div class="full-height">
    <div class="details-container">
      <q-scroll-area
        :class="['background', 'text-white']"
        :style="{
          backgroundImage: detailsBackground,
        }"
        :thumb-style="{ opacity: 0.5 }"
      >
        <div :class="['flex', 'no-wrap', 'q-pa-md']">
          <div v-if="screenGreaterThan.md" :class="['poster', 'q-pr-md']">
            <div class="relative-position">
              <router-link
                v-if="mType === 'episode'"
                :to="{
                  name: 'season-details',
                  params: {
                    show: info.show.ids.slug,
                    season: info.season,
                  },
                }"
              >
                <q-img :src="poster" alt="" />
              </router-link>
              <q-img v-else :src="poster" alt="" />
            </div>
          </div>
          <div :class="['flex', 'full-width']">
            <div class="col-grow">
              <div class="flex no-wrap">
                <div v-if="screenGreaterThan.md === false" class="q-pr-md q-pb-md">
                  <router-link
                    v-if="mType === 'episode'"
                    :to="{
                      name: 'season-details',
                      params: {
                        show: info.show.ids.slug,
                        season: info.season,
                      },
                    }"
                  >
                    <q-img
                      class="poster-small"
                      width="12vw"
                      :ratio="1 / 1.5"
                      :src="poster"
                      alt=""
                    />
                  </router-link>
                  <q-img
                    v-else
                    class="poster-small"
                    width="12vw"
                    :ratio="1 / 1.5"
                    :src="poster"
                    alt=""
                  />
                </div>
                <div class="titles full-width">
                  <router-link
                    v-if="mType === 'episode' || mType === 'season'"
                    :to="{ name: 'show-details', params: { show: info.show.ids.slug } }"
                  >
                    <q-img
                      role="heading"
                      aria-level="1"
                      v-if="info.clear_logo && screenGreaterThan.xs"
                      class="show-logo"
                      :src="info.clear_logo"
                      :alt="title"
                    />
                    <h1 v-else>{{ title }}</h1>
                  </router-link>
                  <template v-else>
                    <q-img
                      role="heading"
                      aria-level="1"
                      v-if="info.clear_logo && screenGreaterThan.xs"
                      class="show-logo"
                      :src="info.clear_logo"
                      :alt="title"
                    />
                    <h1 v-else>{{ title }}</h1>
                  </template>
                  <div v-if="subTitle" :class="['sub-title', 'q-mt-sm']">
                    <div :class="['q-mb-md', 'q-mr-sm']">
                      {{ subTitle }}
                    </div>
                    <div v-if="info.certification" :class="['certification', 'q-mr-sm', 'q-mb-md']">
                      {{ info.certification }}
                    </div>
                    <div v-if="info.tmdb_data?.tagline" :class="['tagline', 'q-mb-md']">
                      - "{{ info.tmdb_data.tagline }}"
                    </div>
                  </div>
                  <div v-if="info.tmdb_data?.genres" class="q-mb-md">
                    <span class="tags" v-for="genre in info.tmdb_data.genres" :key="genre.id">
                      <q-badge color="secondary" class="text-dark">
                        {{ genre.name }}
                      </q-badge>
                    </span>
                  </div>
                </div>
              </div>
              <div class="flex no-wrap">
                <div :class="['flex', 'q-mb-md', 'info']">
                  <div v-for="item in technicalDetails" :key="item.value">
                    <template v-if="item.label !== 'production companies' && item.value">
                      <span>{{ item.label }}: </span>{{ item.value }}
                    </template>
                    <template v-else-if="item.value">
                      <span>{{ item.label }}: </span>{{ truncateDetails(item.value) }}
                      <a href="javascript:" @click="seeMoreDetails = !seeMoreDetails">{{
                        seeMoreDetails ? 'See less' : 'See more'
                      }}</a>
                    </template>
                  </div>
                </div>
                <q-space />
                <div v-show="info.watched_progress">
                  <q-knob
                    readonly
                    :max="1"
                    v-model="watchedProgress"
                    show-value
                    size="50px"
                    :thickness="0.2"
                    color="secondary"
                    track-color="grey-8"
                    class="text-white"
                  >
                    <q-icon name="check_circle_outline" size="sm" color="positive" />
                  </q-knob>
                  <q-tooltip :delay="500">
                    {{ watchedPercent }}
                  </q-tooltip>
                </div>
              </div>
              <div class="ratings">
                <div v-if="info.imdb_rating">
                  <img src="@/assets/imdb_tall.png" :alt="`IMDb rating ${info.imdb_rating}`" />
                  <div>{{ info.imdb_rating }}</div>
                </div>
                <div v-if="info.trakt_rating && info.trakt_rating !== '0.0'">
                  <img src="@/assets/trakt-icon-red.svg" alt="Trakt" />
                  <div>{{ info.trakt_rating }}</div>
                </div>
                <div v-if="info.tmdb_rating && info.tmdb_rating !== '0.0'">
                  <img src="@/assets/tmdb_tall.svg" alt="The Movie DB" />
                  <div>{{ info.tmdb_rating }}</div>
                </div>
                <div>
                  <Rating :item="info" :rating="info.my_rating" />
                </div>
                <div v-if="info.trailer">
                  <q-btn
                    icon="slideshow"
                    label="Trailer"
                    color="secondary"
                    dense
                    flat
                    @click="showTrailer = true"
                  />
                </div>
              </div>
              <div>
                <p class="q-mb-lg">{{ info.overview }}</p>
                <!-- list show seasons -->
                <div v-if="mType === 'show'">
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
                        <q-img
                          width="150px"
                          :ratio="1 / 1.5"
                          :src="season.poster_path"
                          :alt="season.name"
                        >
                          <div
                            v-if="season.name.toLowerCase() !== 'specials'"
                            class="season-watched"
                          >
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
                          <div :class="['season-caption', 'absolute-bottom']">
                            {{ season.name }}
                          </div>
                        </q-img>
                      </router-link>
                    </div>
                  </div>
                </div>
                <!-- List episodes in season -->
                <div v-if="mType === 'season'">
                  <h1>{{ info.tmdb_data?.episodes.length }} Episodes</h1>
                  <div class="row">
                    <ItemCard
                      episode
                      v-for="episode in info.tmdb_data?.episodes"
                      :key="episode.name"
                      :title="episodeTitle(episode)"
                      :poster="episode.backdrop.backdrop_sm"
                      :overview="episode.overview"
                      :backdrop="episode.backdrop.backdrop_lg"
                      @click="handleEpisodeClick(episode)"
                    />
                  </div>
                </div>
                <Actors
                  v-if="screenGreaterThan.sm === false && info.actors?.length > 0"
                  :actors="info.actors"
                  horizontal
                />
                <Reviews :reviews="info.reviews" :reviewCount="info.comment_count" />
              </div>
            </div>
          </div>
        </div>
      </q-scroll-area>
      <Actors v-if="screenGreaterThan.sm && info.actors?.length > 0" :actors="info.actors" />
    </div>
  </div>
  <q-dialog v-model="showTrailer" :transition-duration="500" @hide="closeTrailer">
    <div class="trailer">
      <div v-if="trailerHasError" :style="{ backgroundImage: `url(${trailerErrorBack})` }">
        <div class="trailer-error-text">
          Oops, trailer crashed. Search YouTube for a trailer
          <a
            :href="`https://www.youtube.com/results?search_query=${info.title} trailer`"
            target="blank"
          >
            here</a
          >.
        </div>
      </div>
      <div v-else :style="{ opacity: isTrailerVisible ? 1 : 0 }">
        <YoutubeIframe
          :style="{
            width: '100%',
            height: '100%',
          }"
          :video-id="info.trailer.split('v=')[1]"
          @ready="trailerReady"
          @error="trailerError"
          vi
        />
      </div>
    </div>
  </q-dialog>
</template>

<script>
import { ref } from 'vue';
import { YoutubeIframe } from '@vue-youtube/component';
// store
import { useStore } from '@/store/index';
// components
import Actors from '@/components/Actors.vue';
import Rating from '@/components/Rating.vue';
import Reviews from '@/components/Reviews.vue';
import ItemCard from '@/components/ItemCard.vue';
// assets
import * as trailerErrorPic from '@/assets/trailer-error.jpg';

export default {
  components: { Actors, Reviews, Rating, YoutubeIframe, ItemCard },
  name: 'detailsTemplate',
  props: {
    info: {
      type: Object,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    subTitle: {
      type: [String, Number],
      required: false,
      default: null,
    },
    poster: {
      type: String,
      required: true,
    },
    technicalDetails: {
      type: Array,
      validator: (prop) =>
        prop.every((obj) => 'label' in obj && 'value' in obj && Object.keys(obj).length === 2),
      default: () => [],
    },
    mType: {
      type: String,
      required: true,
    },
  },
  setup() {
    const store = useStore();
    return {
      actors: ref([]),
      loaded: ref(false),
      myRating: ref(0),
      ratingPopOpen: ref(false),
      ratingTimeoutId: ref(null),
      reviews: ref([]),
      store,
      user: ref(JSON.parse(localStorage.getItem('trakt-vue-user'))),
      watchedProgress: ref(0),
      showTrailer: ref(false),
      trailerVisible: ref(false),
      trailerHasError: ref(false),
      trailerErrorBack: trailerErrorPic.default,
      seeMoreDetails: ref(false),
      seasons: ref(null),
    };
  },
  created() {
    this.store.updateMenuVisible(false);

    if (this.mType === 'show') {
      this.seasons = [...this.info.tmdb_data.seasons];
      if (this.seasons[0].name.toLowerCase() === 'specials') {
        const specials = this.seasons.shift();
        this.seasons.push(specials);
      }
      this.info.watched_progress.seasons.forEach((season, index) => {
        const delay = season.number > 1 ? season.number * 200 + 500 : 500;
        this.seasons[index].watched_progress = 0;
        setTimeout(() => {
          this.seasons[index].watched_progress = season.completed / season.aired;
          this.seasons[
            index
          ].watched_percent = `${season.completed} out of ${season.aired} watched`;
        }, delay);
      });
    }

    // for animation purposes
    if (this.info?.watched_progress) {
      setTimeout(() => {
        const watchedProgress = this.info.watched_progress;
        this.watchedProgress = watchedProgress.completed / watchedProgress.aired;
      }, 500);
    }
  },
  computed: {
    seasonLength() {
      return this.info.tmdb_data.seasons.filter(
        (season) => season.name.toLowerCase() !== 'specials'
      ).length;
    },
    watchedPercent() {
      return `${this.info.watched_progress.completed} of ${this.info.watched_progress.aired} episodes watched`;
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
    isTrailerVisible() {
      return this.trailerVisible;
    },
  },
  methods: {
    episodeTitle(episode) {
      return `${episode.season_number}x${episode.episode_number.toString().padStart(2, 0)} ${
        episode.name
      }`;
    },
    handleEpisodeClick(item) {
      this.$emit('episodeClick', item);
    },
    seasonWatchedProgress(season) {
      return season.completed / season.aired;
    },
    trailerReady(event) {
      console.log(event.target);
      event.target.playVideo();
      setTimeout(() => {
        this.trailerVisible = true;
        event.target.hideVideoInfo();
      }, 500);
    },
    trailerError(e) {
      console.log(e.target);
      this.trailerVisible = true;
      this.trailerHasError = true;
    },
    closeTrailer() {
      this.trailerVisible = false;
      this.trailerHasError = false;
    },
    truncateDetails(details) {
      return this.seeMoreDetails ? details : details.split(',', 2).toString();
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/css/quasar.variables.scss';

h1 {
  font-size: 18px !important;
}
button {
  font-weight: 600;
}
.background {
  background-size: cover;
  background-position: center;
  background-color: transparent;
  height: 100%;
  border-radius: 5px;
  overflow: hidden;
  & > div {
    overflow-x: hidden;
  }
  & .show-logo {
    width: 100%;
    width: 250px;
    height: 97px;
  }
}
.titles {
  word-break: break-word;
}
.sub-title {
  font-size: 1.5em;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  & i {
    font-size: 0.6em;
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
  width: 40%;
  min-width: 200px;
  max-width: 600px;
  & > div {
    border-radius: 5px;
    overflow: hidden;
  }
}
.poster-small {
  border-radius: 5px;
  min-width: 120px;
  overflow: hidden;
}
.ratings {
  display: flex;
  flex-wrap: wrap;
  & > div {
    display: flex;
    align-items: center;
    margin-bottom: $space-md;
  }
  & > div > img {
    width: 35px;
  }
  & > div > div:nth-child(2) {
    font-size: 24px;
    margin: 0 10px 0 10px;
  }
}
.info {
  flex-wrap: wrap;
  & > div {
    margin-right: $space-md;
  }
  & span {
    @include darkText;
  }
}
.certification {
  border: 1px solid $secondary;
  color: $secondary;
  border-radius: 3px;
  padding: 2px 5px;
  font-size: 0.75em;
}
.tagline {
  font-style: italic;
  font-size: 0.65em;
  font-weight: 300;
}
:deep(.q-dialog) > * {
  padding: 0 !important;
}
.trailer {
  background-color: black;
  width: 100vw;
  max-width: 100vw;
  height: 70vw;
  max-height: 70vh;
  position: relative;
  & > div {
    height: 70vw;
    max-height: 70vh;
    transition: opacity 5s;
  }
  & .trailer-error-text {
    position: absolute;
    top: 50%;
    width: 100%;
    text-align: center;
    padding: 25px;
    background: rgba(0, 0, 0, 0.8);
    font-size: 2em;
  }
}
.tags {
  margin-right: 5px;
  &:last-child {
    margin-right: 0;
  }
}
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
