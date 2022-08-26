<template>
  <button :class="['text-left', screenGreaterThan.lg ? 'col-6' : 'col-12']" @click="handleClick">
    <div
      class="card"
      :style="{
        backgroundImage: `${backgroundGradient()} url(https://image.tmdb.org/t/p/w1280/${backdrop})`,
      }"
    >
      <div v-if="screenGreaterThan.sm">
        <q-img
          v-if="poster"
          height="100%"
          width="250px"
          :src="`https://image.tmdb.org/t/p/w500/${poster}`"
          :alt="title"
        />
        <q-img v-else src="@/assets/fallback-tv.jpg" alt="generic poster" />
      </div>
      <div class="q-pa-md column no-wrap">
        <h1 class="q-mt-none">{{ title }}</h1>
        <h2 v-if="mediaType && !episode">{{ mediaType === 'tv' ? 'TV Show' : 'Movie' }}</h2>
        <p :class="['q-mb-none', 'col-grow', 'truncate-text']">
          {{ overview }}
        </p>
      </div>
    </div>
  </button>
</template>

<script>
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

button {
  background: none;
  border: none;
  margin: 0;
  padding: 0 0 $space-sm 0;
  @media only screen and (min-width: $breakpoint-lg) {
    &:nth-child(odd) {
      padding-right: $space-sm;
    }
  }
}
.card {
  height: 200px;
  display: flex;
  @include background-style;
  overflow: hidden;
  color: white;
  background-position: top center;
  background-size: cover;
  border: none;
  padding: 0;
}
.truncate-text {
  overflow: hidden;
  display: -webkit-box !important;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  white-space: normal;
}
</style>
