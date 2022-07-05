<template>
  <div
    :class="['full-height', 'details-container', actors.length > 0 ? 'no-pad-right' : '']"
    v-if="loaded"
  >
    <q-scroll-area
      class="background text-white"
      :style="{
        backgroundImage: detailsBackground,
      }"
    >
      <div class="row">
        <div class="col-2"><q-img :src="seasonPoster" alt="" /></div>
        <div class="col-10 q-pl-md flex">
          <div class="col-grow">
            <q-img
              role="heading"
              v-if="episodeInfo.clear_logo"
              class="show-logo"
              :src="episodeInfo.clear_logo"
              :alt="episodeInfo.show.title"
            />
            <h1 v-else>{{ episodeInfo.show.title }}</h1>
            <h2 class="episode-title q-mt-lg">
              {{ episodeInfo.episode.season }}x{{
                episodeInfo.episode.number.toString().padStart(2, '0')
              }}
              {{ episodeInfo.episode.title }}
              <i v-if="episodeInfo.runtime">({{ episodeInfo.runtime }} mins)</i>
            </h2>
            <p>Aired: {{ formattedDate(episodeInfo.air_date) }}</p>
            <div class="ratings">
              <div v-if="episodeInfo.imdb_rating">
                <img src="@/assets/imdb_tall.png" :alt="`IMDb rating ${episodeInfo.imdb_rating}`" />
                <div>{{ episodeInfo.imdb_rating }}</div>
              </div>
              <div v-if="episodeInfo.trakt_rating && episodeInfo.trakt_rating !== '0.0'">
                <img src="@/assets/trakt-icon-red.svg" alt="Trakt" />
                <div>{{ episodeInfo.trakt_rating }}</div>
              </div>
              <div v-if="episodeInfo.tmdb_rating && episodeInfo.tmdb_rating !== '0.0'">
                <img
                  src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_2-d537fb228cf3ded904ef09b136fe3fec72548ebc1fea3fbbd1ad9e36364db38b.svg"
                  alt="The Movie DB"
                />
                <div>{{ episodeInfo.tmdb_rating }}</div>
              </div>
              <div
                @mouseenter="openRatingPopup(true)"
                @mouseleave="closeRatingPopup(true)"
                @focus="openRatingPopup"
                @blur="closeRatingPopup"
              >
                <q-menu
                  v-if="episodeInfo.my_rating?.rating"
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
                    @update:model-value="rateEpisode"
                  />
                </q-menu>
                <q-avatar size="35px">
                  <img src="@/assets/me.jpg" alt="Scott Buchanan" />
                </q-avatar>
                <div v-if="episodeInfo.my_rating?.rating">
                  <div>{{ episodeInfo.my_rating.rating }}</div>
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
                  @update:model-value="rateEpisode"
                />
              </div>
            </div>
            <div class="q-mt-md">
              <p>{{ episodeInfo.overview }}</p>
              <!-- <q-timeline color="secondary" dark>
                <q-timeline-entry class="reviews-heading" heading> User Reviews </q-timeline-entry>
                <q-timeline-entry
                  v-for="review in reviews"
                  :key="review.id"
                  :title="review.user_stats.rating ? `${review.user_stats.rating} / 10` : null"
                  :subtitle="review.user.name ? review.user.name : review.user.username"
                >
                  {{ formatReviews(review.comment) }}
                </q-timeline-entry>
              </q-timeline> -->
              <h2>User Reviews</h2>
              <div class="review-card-container">
                <q-card v-for="review in reviews" :key="review.id" class="review-card">
                  <q-item>
                    <q-item-section avatar>
                      <q-avatar>
                        <img src="https://cdn.quasar.dev/img/avatar2.jpg" alt="" />
                      </q-avatar>
                    </q-item-section>

                    <q-item-section>
                      <q-item-label class="flex items-center">
                        <q-icon name="star" color="secondary" size="1.5em" />
                        <span>
                          {{ review.userating ? review.user_rating : review.user_stats.rating }}
                        </span>
                        <small>/10</small>
                      </q-item-label>
                      <q-item-label caption>{{
                        review.user.name ? review.user.name : review.user.username
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <div class="q-pa-md">
                    <div v-if="formatReviews(review.comment).length > 200">
                      {{ truncateReviewCard(formatReviews(review.comment)) }}
                      <a href="#" @click="showReviewModal(review, episode)">Read more</a>
                    </div>
                    <div v-else>{{ formatReviews(review.comment) }}</div>
                  </div>
                </q-card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </q-scroll-area>
    <q-drawer
      v-if="actors.length > 0"
      class="q-pa-sm text-white"
      :width="200"
      show-if-above
      side="right"
      persistent
    >
      <q-scroll-area class="full-height full-width">
        <h1 class="q-mb-none q-mt-auto">Starring</h1>
        <div class="actor" v-for="actor in actors" :key="actor.person.ids.trakt">
          <q-img class="q-my-sm" :src="actor.image" :alt="actor.person.name">
            <div class="actor-image-text absolute-bottom q-pa-xs">
              {{ actor.person.name }}
            </div>
          </q-img>
          <span v-for="(character, index) in actor.characters" :key="character">
            {{ character }}{{ index !== actor.characters.length - 1 ? ' / ' : '' }}
          </span>
        </div>
      </q-scroll-area>
    </q-drawer>
    <ReviewCardDetails
      v-if="showReviewDetails"
      :modalShow="showReviewDetails"
      :review="reviewDetails"
      :data="episodeInfoDetails"
    />
  </div>
</template>

<script>
import { ref } from 'vue';
import { useStore } from '@/store/index';
import dayjs from 'dayjs';
import { getSeasonPoster, getActorImage } from '@/api/tmdb';
import trakt from '@/api/trakt';
import * as emoji from 'node-emoji';
import ReviewCardDetails from '@/components/ReviewCardDetails.vue';

export default {
  components: { ReviewCardDetails },
  name: 'TvView',
  setup() {
    const store = useStore();
    return {
      store,
      episodeInfo: ref({}),
      loaded: ref(false),
      seasonPoster: ref(null),
      myRating: ref(0),
      ratingTimeoutId: ref(null),
      ratingPopOpen: ref(false),
      actors: ref([]),
      reviews: ref([]),
      showReviewDetails: ref(false),
      reviewDetails: ref(null),
      reviewEpisodeDetails: ref(null),
    };
  },
  async created() {
    this.store.$subscribe((mutated, state) => {
      this.loaded = state.loaded;
    });

    this.store.updateLoading(false);

    this.episodeInfo = JSON.parse(sessionStorage.getItem('trakt-vue-current-item'));

    this.seasonPoster = await getSeasonPoster(
      this.episodeInfo.show.ids.tmdb,
      this.episodeInfo.episode.season,
    );

    const traktActors = await trakt.getEpisodeActors(
      this.episodeInfo.show.ids.trakt,
      this.episodeInfo.episode.season,
      this.episodeInfo.episode.number,
    );

    await Promise.all(
      traktActors.cast.map(async (actor) => {
        const imageData = await getActorImage(actor.person.ids.tmdb);
        const url = `https://image.tmdb.org/t/p/w200${imageData.profiles[0].file_path}`;
        this.actors.push({ ...actor, ...{ image: url } });
      }),
    );

    const arrReviews = await trakt.getEpisodeComments(
      this.episodeInfo.show.ids.trakt,
      this.episodeInfo.episode.season,
      this.episodeInfo.episode.number,
    );
    console.log(arrReviews);
    this.reviews = arrReviews.filter((review) => review.user_rating !== null);

    this.store.updateLoading(true);
  },
  computed: {
    detailsBackground() {
      return `linear-gradient(to top right, rgba(0,0,0,.8), rgba(0,0,0,.7) 30%, rgba(0,0,0,0)),
              linear-gradient(to top      , rgba(0,0,0,.5), rgba(0,0,0,.2) 30%, rgba(0,0,0,0)),
              linear-gradient(to right    , rgba(0,0,0,.5), rgba(0,0,0,.2) 30%, rgba(0,0,0,0)),
              url(${this.episodeInfo?.backdrop_lg})`;
    },
  },
  methods: {
    showReviewModal(review, episode) {
      this.showReviewDetails = true;
      this.reviewDetails = review;
      this.reviewEpisodeDetails = episode;
    },
    truncateReviewCard(text) {
      return `${text.substring(0, 200)}...`;
    },
    formatReviews(text) {
      return emoji.emojify(text).replace('[spoiler]', '').replace('[/spoiler]', '');
    },
    formattedDate(wDate) {
      return dayjs(wDate).format('MMM DD, YYYY');
    },
    rateEpisode() {
      const response = trakt.rateEpisode(this.episodeInfo.episode, this.myRating);
      if (response) {
        this.episodeInfo.my_rating = { rating: this.myRating };
        sessionStorage.setItem('trakt-vue-current-item', JSON.stringify(this.episodeInfo));
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
.episode-title {
  & i {
    font-size: 0.8em;
  }
}
.details-container {
  padding: 5px 5px 5px 0;
}
.details-container.no-pad-right {
  padding-right: 0;
}
.background {
  background-size: cover;
  background-position: center;
  background-color: transparent;
  height: 100%;
  border-radius: 5px;
  overflow: hidden;
  & > div > div > div {
    padding: 15px;
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
.star-rating {
  margin: 0;
  padding: 0;
}
.show-logo {
  width: 100%;
  max-width: 250px;
  height: 97px;
}
.actor-image-text {
  font-size: 0.75em;
  padding: 8px;
}
.actor {
  & > div:nth-child(2) :not(:last-child) {
    margin-bottom: 8px;
  }
}
.reviews-heading > h3 {
  font-size: 20px;
  padding: 0;
}
.review-card-container {
  display: flex;
  // flex-wrap: wrap;
  gap: 10px;
  width: 100%;
  & > .review-card {
    background: rgba(255, 255, 255, 0.6);
    width: 25%;
    color: #000;
  }
}
</style>
