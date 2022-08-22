<template>
  <q-timeline v-if="reviews?.length > 0" color="secondary" class="q-mb-lg" dark>
    <div v-if="reply === false" class="flex items-start justify-between">
      <q-timeline-entry heading class="review-heading" tag="h2">
        User Reviews
        <sup>
          <q-badge color="secondary" class="text-dark"> {{ reviewCount }} </q-badge>
        </sup>
      </q-timeline-entry>
      <div v-show="showUnratedButton" class="unrated-toggle">
        Unrated <q-toggle class="q-ml-xs" v-model="showUnrated" color="secondary" dark dense />
      </div>
    </div>
    <q-timeline-entry v-for="review in truncateReviews" :key="review.id">
      <template #title>
        <q-item class="review-rating q-pa-none">
          <q-item-section>
            <q-item-label class="flex items-center">
              <div v-show="review.user_rating || review.user_stats.rating" class="q-mr-sm">
                <q-icon name="star" color="yellow" size="1.5em" class="star_rate" />
                <span>
                  {{ review.userating ? review.user_rating : review.user_stats.rating }}
                </span>
                <small>&nbsp;/10</small>
              </div>
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
          <q-item-section>
            <div class="flex justify-end items-center">
              <div>
                <q-btn
                  :icon="likedReview(review) ? 'thumb_up_alt' : 'thumb_up_off_alt'"
                  color="secondary"
                  size="md"
                  flat
                  dense
                  round
                  :ripple="false"
                  @click="likeReview(review)"
                />
                {{ review.likes === 1 ? `${review.likes} like` : `${review.likes} likes` }}
              </div>
              <div class="q-ml-sm">
                <div v-if="review.replies > 0">
                  <q-btn
                    class="review-likes-comments"
                    flat
                    dense
                    no-caps
                    :ripple="false"
                    @click="getReplies(review)"
                  >
                    <q-icon class="q-pr-xs" name="comment" size="24px" color="secondary" />
                    {{
                      review.replies === 1 ? `${review.replies} reply` : `${review.replies} replies`
                    }}
                    <q-icon
                      :class="reviewReplies[review.id]?.show ? 'expand-less' : 'expand-more'"
                      name="expand_less"
                      size="xs"
                      color="white"
                    />
                  </q-btn>
                </div>
                <div v-else>
                  <q-icon class="q-pr-xs" name="comment" size="24px" color="secondary" />
                  {{ `${review.replies} replies` }}
                </div>
              </div>
            </div>
          </q-item-section>
        </q-item>
      </template>
      <div v-if="formatReviews(review.comment).length > 300" class="review-bubble">
        {{ truncateReviewCard(formatReviews(review.comment), 300) }}
        <a href="#" @click="modalData = { review }">Read more</a>
      </div>
      <div v-else class="review-bubble">{{ formatReviews(review.comment) }}</div>
      <Reviews
        v-if="reviewReplies[review.id]?.show"
        reply
        :reviews="reviewReplies[review.id]?.replies"
        class="review-reply"
      />
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
import { likeComment, getComments } from '@/api/trakt';
// components
import ReviewCardDetails from '@/components/ReviewCardDetailsDialog.vue';

export default {
  name: 'Reviews',
  components: { ReviewCardDetails },
  props: {
    reviews: {
      type: Array,
      default: () => [],
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    reply: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    return {
      reviewsMore: ref(false),
      reviewDetails: ref(null),
      reviewReplies: ref({}),
      episodeBackdrop: ref(null),
      showUnrated: ref(false),
      showUnratedButton: ref(true),
      likes: ref(JSON.parse(localStorage.getItem('trakt-vue-likes'))),
    };
  },
  created() {
    if (!this.reply) {
      const onlyRated = this.reviews.filter((review) => review.user_rating !== null);
      if (onlyRated.length < 1) {
        this.showUnrated = true;
        this.showUnratedButton = false;
      }
    }
  },
  computed: {
    filteredReviews() {
      if (this.showUnrated || this.reply) {
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
      set(data) {
        // const cardBack = await getTvThumb(this.ids.tvdb);
        this.reviewDetails = {
          review: data.review,
          // background: cardBack,
          show: true,
        };
      },
    },
  },
  methods: {
    async getReplies(review) {
      if (!this.reviewReplies[review.id]) {
        const replies = await getComments(review.id, true);
        this.reviewReplies[review.id] = { show: true, replies };
      } else {
        this.reviewReplies[review.id].show = !this.reviewReplies[review.id].show;
      }
    },
    likedReview(review) {
      return this.likes.find((like) => like.comment.id === review.id);
    },
    async likeReview(review) {
      const deleteLike = this.likedReview(review);
      const success = await likeComment(review.id, deleteLike);
      if (deleteLike) {
        this.likes = this.likes.filter((item) => item.comment.id !== review.id);
      } else {
        this.likes.push({ liked_at: new Date().toISOString(), comment: { id: review.id } });
      }
      if (success) {
        const current = this.reviews.find((item) => item.id === review.id);
        if (deleteLike) {
          current.likes -= 1;
        } else {
          current.likes += 1;
        }
        this.$q.notify({
          message: deleteLike ? 'Like removed' : 'Like added',
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
sup {
  font-weight: 400;
  font-size: 0.6em;
  @include darkText;
}
:deep(.q-timeline__dot) {
  top: 10px;
}
:deep(.q-timeline__subtitle) {
  opacity: 1;
  color: $accent;
}
.review-rating {
  min-height: auto;
  & div:not(:first-child),
  button {
    font-size: 12px;
  }
  & .star {
    opacity: 1;
    margin-right: 3px;
  }
}
.review-likes-comments {
  & .expand-more {
    rotate: 180deg;
    transition: rotate 0.5s;
  }
  & .expand-less {
    rotate: 0deg;
    transition: rotate 0.2s;
  }
}
.unrated-toggle {
  @include darkText;
}
.review-reply {
  margin-top: 20px;
  & :deep(.q-timeline__dot) {
    display: none;
  }
  & ul {
    margin-bottom: 0;
  }
}
.review-bubble {
  @include background-style;
  padding: $space-md;
  position: relative;
  &::before {
    // layout
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    bottom: 100%;
    left: 1.5em; // offset should move with padding of parent
    border: 0.75rem solid transparent;
    border-top: none;

    // looks
    border-bottom-color: rgba(0, 0, 0, $opacity-back);
    filter: drop-shadow(0 -0.0625rem 0.0625rem rgba(0, 0, 0, 0.1));
  }
}
</style>
