<template>
  <q-dialog
    :model-value="data?.show"
    @update:model-value="hideDialog()"
    @hide="hideDialog()"
    prompt
  >
    <q-card class="review-card" close dark>
      <q-btn class="button-close" icon="close" flat round dense v-close-popup />
      <q-img height="200px" position="top" :src="data.background" />
      <q-item class="avatar-rating" dark>
        <q-item-section avatar>
          <q-avatar size="64px">
            <q-img
              :src="data.review.avatar"
              :alt="data.review.user.name ? data.review.user.name : data.review.user.username"
              referrerpolicy="no-referrer"
            />
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label class="flex items-center q-mb-md">
            <div class="q-mr-xs">
              <span>
                {{
                  data.review.userating ? data.review.user_rating : data.review.user_stats.rating
                }}
              </span>
              <small>&nbsp;/10</small>
            </div>
            <div v-for="star in userRatingStars" :key="star">
              <q-icon :name="star === 'full' ? 'star' : 'star_half'" color="yellow" size="1.5em" />
            </div>
            <div class="col-grow text-right">{{ formattedDate(data.review.created_at) }}</div>
          </q-item-label>
          <q-item-label caption class="flex justify-between">
            <div>
              {{ data.review.user.name ? data.review.user.name : data.review.user.username }}
            </div>
          </q-item-label>
        </q-item-section>
      </q-item>
      <div style="max-height: 400px" class="scroll">
        <q-item class="q-pa-md">
          <q-item-section>
            {{ data.review.comment }}
          </q-item-section>
        </q-item>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import dayjs from 'dayjs';

export default {
  name: 'ReviewCardDetails',
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    userRatingStars() {
      const arrStars = [];
      let total;
      if (this.data.review.userating) {
        total = this.data.review.user_rating;
      } else {
        total = this.data.review.user_stats.rating / 2;
      }
      const addHalf = (total * 2) % 2 !== 0;
      for (let i = 0; i < total; i += 1) {
        arrStars.push('full');
      }
      if (addHalf) arrStars.splice(-1, 1, 'half');
      return arrStars;
    },
  },
  methods: {
    formattedDate(wDate) {
      return dayjs(wDate).format('MMM DD, YYYY');
    },
    hideDialog() {
      this.$emit('closeDialog');
    },
  },
};
</script>

<style lang="scss" scoped>
.review-card {
  background: rgba(0, 0, 0, 0.85);
  overflow: hidden;
  width: 100%;
  box-shadow: 0px 0px 80px 0px rgba(255, 255, 255, 0.5);
  & > div:nth-child(3) {
    margin-top: -40px;
  }
  & .avatar-rating {
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.4) 0%,
      rgba(0, 0, 0, 0.4) 52%,
      transparent 52%,
      transparent 100%
    );
  }
  & .button-close {
    z-index: 1;
    position: absolute;
    top: 10px;
    right: 10px;
  }
}
</style>
