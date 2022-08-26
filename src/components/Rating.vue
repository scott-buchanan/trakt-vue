<template>
  <div
    v-if="myRating"
    class="flex"
    @mouseenter="openRatingPopup(true)"
    @mouseleave="closeRatingPopup(true)"
    @focus="openRatingPopup(true)"
    @blur="closeRatingPopup(true)"
  >
    <q-avatar size="35px" id="avatar">
      <q-img :src="user.images.avatar.full" :alt="user.name" referrerpolicy="no-referrer" />
    </q-avatar>
    <div class="rating">
      <div>{{ myRating === 10 ? myRating : myRating.toFixed(1) }}</div>
    </div>
  </div>
  <q-btn v-else id="btnRate" outline color="secondary" label="Rate" @click="openRatingPopup" />
  <q-menu
    v-model="ratingPopOpen"
    :target="myRating ? '#avatar' : '#btnRate'"
    dark
    transition-show="jump-up"
    transition-hide="jump-down"
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
      icon="star_border"
      icon-selected="star"
      icon-half="star_half"
      @update:model-value="rate"
    />
  </q-menu>
</template>

<script>
import { ref } from 'vue';
// api
import { rateShow, rateEpisode, rateMovie } from '@/api/trakt';

export default {
  name: 'Reviews',
  components: {},
  props: {
    rating: {
      type: Number,
      default: null,
    },
    item: {
      // episode, show, or movie object
      type: Object,
      default: () => {},
    },
  },
  setup() {
    return {
      ratingPopOpen: ref(false),
      user: ref(JSON.parse(localStorage.getItem('trakt-vue-user')).user),
      myRating: ref(0),
      ratingTimeoutId: ref(null),
    };
  },
  created() {
    this.myRating = this.rating === null ? 0 : this.rating;
  },
  computed: {},
  methods: {
    openRatingPopup(delay = false) {
      clearTimeout(this.ratingTimeoutId);
      setTimeout(
        () => {
          this.ratingPopOpen = true;
        },
        delay ? 300 : 0
      );
    },
    closeRatingPopup(delay = false) {
      this.ratingTimeoutId = setTimeout(
        () => {
          this.ratingPopOpen = false;
        },
        delay ? 500 : 0
      );
    },
    rate() {
      let response;
      switch (this.item.type) {
        case 'episode':
          response = rateEpisode(this.item, this.myRating);
          break;
        case 'show':
          response = rateShow(this.item, this.myRating);
          break;
        default:
          // movie
          response = rateMovie(this.item, this.myRating);
      }
      if (response) {
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
        this.closeRatingPopup();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/css/quasar.variables.scss';

button {
  font-weight: 600;
}
.rating {
  font-size: 24px;
  margin: 0 10px 0 10px;
}
</style>
