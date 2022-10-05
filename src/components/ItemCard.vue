<template>
  <button :class="['text-left']" @click="$emit('click')">
    <div
      class="card"
      :style="{
        backgroundImage: `${backgroundGradient()} ${
          backdrop ? `url(https://image.tmdb.org/t/p/w1280/${props.backdrop})` : ''
        }`,
      }"
    >
      <div class="card-image" v-if="screenGreaterThan.sm">
        <q-img
          v-if="props.poster"
          height="100%"
          :width="props.episode ? '250px' : '133px'"
          :ratio="props.episode ? 16 / 9 : 1 / 1.5"
          :src="`https://image.tmdb.org/t/p/w500/${props.poster}`"
          :alt="title"
        />
        <q-img
          v-else
          :width="props.episode ? '250px' : '133px'"
          :ratio="props.episode ? 16 / 9 : 1 / 1.5"
          :src="fallbackImage"
          alt="generic poster"
        />
      </div>
      <div class="q-pa-md no-wrap card-content">
        <h1 class="title">{{ props.title }}</h1>
        <h2 v-if="props.mediaType && !props.episode">
          {{ props.mediaType === 'tv' ? 'TV Show' : 'Movie' }}
        </h2>
        <p v-if="props.aired">
          {{ formattedDate(props.aired) }}
          <span v-if="props.episode">
            - <i>{{ props.mediaLength }}</i>
          </span>
        </p>
        <p :class="['q-mb-none', 'truncate-text']">
          {{ props.overview }}
        </p>
      </div>
    </div>
  </button>
</template>

<script setup>
import { computed } from 'vue';
import { useQuasar } from 'quasar';
import * as fallBackImg from '@/assets/fallback-tv.jpg';
import dayjs from 'dayjs';

const $q = useQuasar();
const props = defineProps({
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
    default: null,
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
  aired: {
    type: String,
    default: null,
  },
  episode: {
    type: Boolean,
    default: false,
  },
});
// data
const fallbackImage = fallBackImg.default;
// computed
const screenGreaterThan = computed(() => $q.screen.gt);
// methods
const formattedDate = (wDate) => dayjs(wDate).format('MMM DD, YYYY');
const backgroundGradient =
  () => `linear-gradient(to top right, rgba(0,0,0,.8), rgba(0,0,0,.5) 70%, rgba(0,0,0,.3)),
         linear-gradient(to top      , rgba(0,0,0,.5), rgba(0,0,0,.2) 70%, rgba(0,0,0,0)),
         linear-gradient(to right    , rgba(0,0,0,.5), rgba(0,0,0,.2) 70%, rgba(0,0,0,0)),`;
</script>

<style lang="scss" scoped>
@import '@/css/quasar.variables.scss';

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
