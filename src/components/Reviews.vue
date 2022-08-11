<template>
  <q-timeline v-if="reviews.length > 0" color="secondary" class="q-mb-lg" dark>
    <div class="flex items-start justify-between">
      <q-timeline-entry heading class="review-heading" tag="h2"> User Reviews </q-timeline-entry>
      <div class="unrated-toggle">
        Unrated <q-toggle class="q-ml-xs" v-model="showUnrated" color="secondary" dark dense />
      </div>
    </div>
    <q-timeline-entry v-for="review in truncateReviews" :key="review.id">
      <template v-if="review.user_rating || review.user_stats.rating" #title>
        <q-item class="review-rating q-pa-none">
          <q-item-section>
            <q-item-label class="flex items-center">
              <q-icon name="star" color="yellow" size="1.5em" class="star_rate" />
              <span>
                {{ review.userating ? review.user_rating : review.user_stats.rating }}
              </span>
              <small>&nbsp;/10</small>
            </q-item-label>
          </q-item-section>
        </q-item>
      </template>
      <template #subtitle>
        <q-item class="q-pa-none">
          <q-item-section avatar>
            <q-avatar>
              <q-img :src="review.avatar" alt="" referrerpolicy="no-referrer" />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            {{ review.user.name ? review.user.name : review.user.username }}<br />
            <small>{{ formattedDate(review.created_at) }}</small>
          </q-item-section>
        </q-item>
      </template>
      <div v-if="formatReviews(review.comment).length > 300">
        {{ truncateReviewCard(formatReviews(review.comment), 300) }}
        <a href="#" @click="modalData = { review }">Read more</a>
      </div>
      <div v-else>{{ formatReviews(review.comment) }}</div>
    </q-timeline-entry>
    <div class="text-right">
      <q-btn
        v-if="reviews.length > 2"
        color="secondary"
        outline
        no-caps
        size="md"
        :icon-right="reviewsMore ? 'expand_less' : 'expand_more'"
        :label="reviewsMore ? 'See Less' : 'See More'"
        @click="reviewsMore = !reviewsMore"
      />
    </div>
    <ReviewCardDetails :data="modalData" @closeDialog="closeReviewDetails" />
  </q-timeline>
</template>

<script>
import { ref } from 'vue';
import * as emoji from 'node-emoji';
import dayjs from 'dayjs';
// api
import { getTvThumb } from '@/api/fanart';
// components
import ReviewCardDetails from '@/components/ReviewCardDetailsDialog.vue';

export default {
  name: 'Reviews',
  components: { ReviewCardDetails },
  props: {
    reviews: {
      type: Array,
      required: true,
    },
    showIds: {
      type: Object,
      required: true,
    },
  },
  setup() {
    return {
      reviewsMore: ref(false),
      reviewDetails: ref(null),
      episodeBackdrop: ref(null),
      showUnrated: ref(false),
    };
  },
  computed: {
    filteredReviews() {
      if (this.showUnrated) {
        return this.reviews;
      }
      return this.reviews.filter((review) => review.user_rating !== null);
    },
    truncateReviews() {
      return this.reviewsMore ? this.filteredReviews : this.filteredReviews.slice(0, 2);
    },
    modalData: {
      get() {
        return this.reviewDetails;
      },
      async set(data) {
        const cardBack = await getTvThumb(this.showIds.tvdb);
        this.reviewDetails = {
          review: data.review,
          background: cardBack,
          show: true,
        };
      },
    },
  },
  methods: {
    truncateReviewCard(text, length) {
      return `${text.substring(0, length)}...`;
    },
    formatReviews(text) {
      return emoji.emojify(text).replaceAll('[spoiler]', '').replaceAll('[/spoiler]', '');
    },
    formattedDate(wDate) {
      return dayjs(wDate).format('MMM DD, YYYY');
    },
    closeReviewDetails() {
      this.reviewDetails.show = false;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/css/quasar.variables.scss';
:deep(.q-timeline__dot) {
  top: 10px;
}
:deep(.q-timeline__subtitle) {
  opacity: 1;
  color: $accent;
}
.review-rating {
  min-height: auto;
  & .star {
    opacity: 1;
    margin-right: 3px;
  }
}
.unrated-toggle {
  @include darkText;
}
</style>
