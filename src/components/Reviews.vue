<template>
  <q-timeline v-if="reviews.length > 0" color="secondary" class="q-mb-lg" dark>
    <q-timeline-entry heading class="review-heading" tag="h2"> User Reviews </q-timeline-entry>
    <q-timeline-entry v-for="review in filteredReviews" :key="review.id">
      <template #title>
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
import ReviewCardDetails from '@/components/ReviewCardDetailsDialog.vue';
import dayjs from 'dayjs';
import { getTvThumb } from '@/api/fanart';

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
    };
  },
  computed: {
    filteredReviews() {
      return this.reviewsMore ? this.reviews : this.reviews.slice(0, 2);
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
      return emoji.emojify(text).replace('[spoiler]', '').replace('[/spoiler]', '');
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
::v-deep .q-timeline__dot {
  top: 10px;
}
.review-rating {
  min-height: auto;
  opacity: 0.8;
  & .star {
    opacity: 1;
    margin-right: 3px;
  }
}
</style>
