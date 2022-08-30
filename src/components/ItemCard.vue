<template>
  <button :class="['text-left']" @click="handleClick">
    <div
      class="card"
      :style="{
        backgroundImage: `${backgroundGradient()} url(https://image.tmdb.org/t/p/w1280/${backdrop})`,
      }"
    >
      <div class="card-image" v-if="screenGreaterThan.sm">
        <q-img
          v-if="poster"
          height="100%"
          :width="episode ? '250px' : '133px'"
          :ratio="episode ? 16 / 9 : 1 / 1.5"
          :src="`https://image.tmdb.org/t/p/w500/${poster}`"
          :alt="title"
        />
        <q-img
          v-else
          :width="episode ? '250px' : '133px'"
          :ratio="episode ? 16 / 9 : 1 / 1.5"
          :src="fallbackImage"
          alt="generic poster"
        />
      </div>
      <div class="q-pa-md no-wrap card-content">
        <h1 class="title">{{ title }}</h1>
        <h2 v-if="mediaType && !episode">{{ mediaType === 'tv' ? 'TV Show' : 'Movie' }}</h2>
        <p :class="['q-mb-none', 'truncate-text']">
          {{ overview }}
        </p>
      </div>
    </div>
  </button>
</template>

<script>
import * as fallBackImg from '@/assets/fallback-tv.jpg';

export default {
  name: 'ItemCard',
  props: {
    title: {
      type: String,
      required: true,
    },
    poster: {
      type: String,
      default: null,
    },
    backdrop: {
      type: String,
      required: true,
    },
    mediaType: {
      type: String,
      required: false,
      default: 'tv',
    },
    overview: {
      type: String,
      required: true,
    },
    episode: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    return {
      fallbackImage: fallBackImg.default,
    };
  },
  computed: {
    screenGreaterThan() {
      return this.$q.screen.gt;
    },
  },
  methods: {
    handleClick() {
      this.$emit('click');
    },
    backgroundGradient() {
      return `linear-gradient(to top right, rgba(0,0,0,.8), rgba(0,0,0,.5) 70%, rgba(0,0,0,.3)),
         linear-gradient(to top      , rgba(0,0,0,.5), rgba(0,0,0,.2) 70%, rgba(0,0,0,0)),
         linear-gradient(to right    , rgba(0,0,0,.5), rgba(0,0,0,.2) 70%, rgba(0,0,0,0)),`;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/css/quasar.variables.scss';
@import url('https://fonts.googleapis.com/css2?family=Comfortaa:wght@300&display=swap');

h2 {
  font-size: 20px;
}
.title {
  @include text-ellipsis;
}
button {
  background: none;
  border: none;
  padding: 0;
  min-width: 0;
}
.card {
  height: 200px;
  width: 100%;
  @include background-style;
  overflow: hidden;
  color: white;
  background-position: top center;
  background-size: cover;
  border: none;
  padding: 0;
  display: flex;
  & .card-content {
    min-width: 0;
  }
}
.truncate-text {
  overflow: hidden;
  display: -webkit-box !important;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  white-space: normal;
}
</style>
