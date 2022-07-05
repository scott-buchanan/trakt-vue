<template>
  <q-dialog v-if="show" v-model="show">
    <q-card class="review-card">
      <q-img height="200px" :src="`https://image.tmdb.org/t/p/w780/${background}`" />

      <q-item>
        <q-item-section avatar>
          <q-avatar>
            <img src="https://cdn.quasar.dev/img/avatar2.jpg" alt="" />
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label class="flex items-center">
            <div v-for="star in userRatingStars" :key="star">
              <q-icon
                :name="star === 'full' ? 'star' : 'star_half'"
                color="secondary"
                size="1.5em"
              />
            </div>
            <!-- <span>
              {{ userRating }}
            </span>
            <small>/10</small> -->
          </q-item-label>
          <q-item-label caption>{{
            review.user.name ? review.user.name : review.user.username
          }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref } from 'vue';
import { getEpisodeBackdrops } from '@/api/tmdb';

export default {
  name: 'ReviewCardDetails',
  props: {
    modalShow: {
      type: Boolean,
      default: false,
    },
    review: {
      type: Object,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
  },
  computed: {
    userRatingStars() {
      const arrStars = [];
      const total = this.review.userating ? this.review.user_rating : this.review.user_stats.rating;
      for (let i = 0; i < total; i += 2) {
        arrStars.push('full');
      }
      if (total < 2 || total % 2 !== 0) {
        arrStars.push('half');
      }
      return arrStars;
    },
  },
  methods: {},
  setup() {
    return {
      background: ref(null),
      show: ref(false),
    };
  },
  async created() {
    this.show = this.modalShow;
    console.log(this.data);
    const backgroundResp = await getEpisodeBackdrops(
      this.data.show.ids.tmdb,
      this.data.episode.season,
      this.data.episode.number,
    );
    this.background = backgroundResp[Math.floor(Math.random() * backgroundResp.length)].file_path;
    console.log(this.background);
  },
};
</script>

<style lang="scss" scoped>
.review-card {
  width: 50%;
}
</style>
