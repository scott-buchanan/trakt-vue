<template>
  <div class="full-height">
    <div class="details-container" v-if="loaded">
      <q-scroll-area
        class="background text-white"
        :style="{
          backgroundImage: detailsBackground,
        }"
        :thumb-style="{ opacity: 0.5 }"
      >
        <div :class="['flex', 'no-wrap', 'q-pa-md']">
          <div class="poster">
            <div class="relative-position">
              <q-img :src="poster" alt="" />
              <q-linear-progress
                size="10px"
                class="absolute-bottom"
                :value="watchedProgress"
                color="secondary"
                dark
                stripe
              />
              <q-tooltip :delay="500">
                {{ watchedPercent }}
              </q-tooltip>
            </div>
          </div>
          <div :class="['q-pl-md', 'flex', 'full-width']">
            <div class="col-grow">
              <q-img
                role="heading"
                aria-level="1"
                v-if="info.clear_logo"
                class="show-logo"
                :src="info.clear_logo"
                :alt="info.show.title"
              />
              <h1 v-else>{{ info.show.title }}</h1>
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
                  <img
                    src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_2-d537fb228cf3ded904ef09b136fe3fec72548ebc1fea3fbbd1ad9e36364db38b.svg"
                    alt="The Movie DB"
                  />
                  <div>{{ info.tmdb_rating }}</div>
                </div>
                <div
                  @mouseenter="openRatingPopup(true)"
                  @mouseleave="closeRatingPopup(true)"
                  @focus="openRatingPopup"
                  @blur="closeRatingPopup"
                >
                  <q-menu
                    v-if="info.my_rating?.rating"
                    dark
                    v-model="ratingPopOpen"
                    transition-show="jump-down"
                    transition-hide="jump-up"
                    anchor="top middle"
                    self="top middle"
                    class="q-pa-sm"
                    :offset="[0, 50]"
                    @focus="openRatingPopup"
                    @mouseenter="openRatingPopup"
                    @mouseleave="closeRatingPopup(true)"
                    @blur="closeRatingPopup"
                  >
                    <q-rating
                      v-model="myRating"
                      max="10"
                      size="1.5em"
                      color="seconary"
                      icon="star_border"
                      icon-selected="star"
                      icon-half="star_half"
                      @update:model-value="rateShow"
                    />
                  </q-menu>
                  <q-avatar size="35px">
                    <q-img
                      :src="user.images.avatar.full"
                      :alt="user.name"
                      referrerpolicy="no-referrer"
                    />
                  </q-avatar>
                  <div v-if="info.my_rating?.rating">
                    <div>{{ info.my_rating.rating }}</div>
                  </div>
                  <q-rating
                    v-else
                    v-model="myRating"
                    max="10"
                    size="1.5em"
                    color="seconary"
                    icon="star_border"
                    icon-selected="star"
                    icon-half="star_half"
                    @update:model-value="rateShow"
                  />
                </div>
              </div>
              <div class="q-mt-md">
                <p class="q-mb-lg">{{ info.overview }}</p>
                <Reviews :showIds="info.show.ids" :reviews="reviews" />
                <q-carousel
                  v-if="showVideos?.length > 0"
                  v-model="videoSlide"
                  animated
                  swipeable
                  infinite
                  navigation
                  control-type="outline"
                  transition-prev="slide-right"
                  transition-next="slide-left"
                  class="videos-carousel"
                >
                  <q-carousel-slide v-for="video in showVideos" :key="video.key" :name="video.key">
                    <q-video
                      :ratio="16 / 9"
                      class="absolute-full"
                      :src="`https://www.youtube.com/embed/${video.key}`"
                    />
                  </q-carousel-slide>
                </q-carousel>
              </div>
            </div>
          </div>
        </div>
        <Actors v-if="screenGreaterThan.sm === false" :actors="actors" horizontal />
      </q-scroll-area>
      <Actors v-if="screenGreaterThan.sm" :actors="actors" />
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import dayjs from 'dayjs';
// store
import { useStore } from '@/store/index';
// api
import { getShowPoster, getActorImage, getShowVideos } from '@/api/tmdb';
import trakt from '@/api/trakt';
// components
import Actors from '@/components/Actors.vue';
import Reviews from '@/components/Reviews.vue';

export default {
  components: { Actors, Reviews },
  name: 'TvView',
  setup() {
    const store = useStore();
    return {
      actors: ref([]),
      info: ref({}),
      loaded: ref(false),
      poster: ref(null),
      myRating: ref(0),
      ratingPopOpen: ref(false),
      ratingTimeoutId: ref(null),
      reviews: ref([]),
      showVideos: ref([]),
      store,
      user: ref(JSON.parse(localStorage.getItem('trakt-vue-user'))),
      videoSlide: ref(null),
      watchedProgress: ref(0),
    };
  },
  async created() {
    this.store.$subscribe((mutated, state) => {
      this.loaded = state.loaded;
    });

    this.store.updateLoading(false);

    this.info = JSON.parse(sessionStorage.getItem('trakt-vue-current-item'));
    this.myRating = this.info.my_rating?.rating;

    this.poster = await getShowPoster(this.info.show.ids.tmdb);

    const traktActors = await trakt.getShowActors(this.info.show.ids.trakt);

    // get actors
    await Promise.all(
      traktActors.cast.map(async (actor) => {
        const imageData = await getActorImage(actor.person.ids.tmdb);
        if (imageData.profiles.length > 0) {
          const url = `https://image.tmdb.org/t/p/w200${imageData.profiles[0].file_path}`;
          this.actors.push({ ...actor, ...{ image: url } });
        }
      }),
    );

    // get reviews
    const arrReviews = await trakt.getComments(this.info.show.ids.trakt);
    // filter out reviews with no ratings (didn't do this in api because might
    // use a filter to display all)
    this.reviews = arrReviews.filter((review) => review.user_rating !== null);

    const watchedProgress = await trakt.getShowWatchedProgress(this.info.show.ids.trakt);
    this.watchedProgress = parseFloat(
      (watchedProgress.completed / watchedProgress.aired).toFixed(2),
    );

    this.showVideos = await getShowVideos(this.info.show.ids.tmdb);
    this.videoSlide = this.showVideos[0].key;
    console.log(this.showVideos);

    this.store.updateLoading(true);
  },
  computed: {
    watchedPercent() {
      return `${this.watchedProgress * 100}% watched`;
    },
    detailsBackground() {
      return `linear-gradient(to top right, rgba(0,0,0,.8), rgba(0,0,0,.7) 30%, rgba(0,0,0,0)),
              linear-gradient(to top      , rgba(0,0,0,.5), rgba(0,0,0,.2) 30%, rgba(0,0,0,0)),
              linear-gradient(to right    , rgba(0,0,0,.5), rgba(0,0,0,.2) 30%, rgba(0,0,0,0)),
              url(${this.info?.backdrop_lg})`;
    },
    screenGreaterThan() {
      return this.$q.screen.gt;
    },
  },
  methods: {
    formattedDate(wDate) {
      return dayjs(wDate).format('MMM DD, YYYY');
    },
    rateShow() {
      const response = trakt.rateShow(this.info.show, this.myRating);
      if (response) {
        this.info.my_rating = { rating: this.myRating };
        sessionStorage.setItem('trakt-vue-current-item', JSON.stringify(this.info));
        this.$q.notify({
          message: 'Rating saved successfully!',
          position: 'top',
          icon: 'done',
          iconColor: 'green',
          badgeColor: 'secondary',
          badgeTextColor: 'dark',
          progress: true,
          timeout: 2500,
        });
      }
    },
    openRatingPopup(delay = false) {
      clearTimeout(this.ratingTimeoutId);
      setTimeout(
        () => {
          this.ratingPopOpen = true;
        },
        delay ? 100 : 0,
      );
    },
    closeRatingPopup(delay = false) {
      this.ratingTimeoutId = setTimeout(
        () => {
          this.ratingPopOpen = false;
        },
        delay ? 500 : 0,
      );
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/css/quasar.variables.scss';

h1 {
  font-size: 18px !important;
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
.videos-carousel {
  background: transparent;
}
</style>
