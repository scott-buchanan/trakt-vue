<template>
  <q-scroll-area :thumb-style="{ opacity: 0.5 }" :class="['full-height', 'full-width']">
    <div class="row">
      <button
        v-for="item in data"
        :key="item.id"
        :class="[
          'search-result-button',
          'q-mb-sm',
          'text-left',
          screenGreaterThan.md ? 'col-6 pad' : 'col-12',
        ]"
        @click="goToDetails(item)"
      >
        <div
          class="search-result"
          :style="{
            backgroundImage: `${backgroundGradient()} url(https://image.tmdb.org/t/p/w1280/${
              item.backdrop_path
            })`,
          }"
        >
          <img
            v-if="item.poster_path"
            :src="`https://image.tmdb.org/t/p/w500/${item.poster_path}`"
            :alt="result.name"
          />
          <img v-else src="@/assets/fallback-tv.jpg" alt="generic poster" />
          <div class="q-pa-md column no-wrap">
            <h1 class="q-mt-none">
              {{ item.media_type === 'tv' ? item.name : item.title }}
            </h1>
            <h2>{{ item.media_type === 'tv' ? 'TV Show' : 'Movie' }}</h2>
            <p :class="['q-mb-none', 'col-grow', 'truncate-text']">
              {{ item.overview }}
            </p>
          </div>
        </div>
      </button>
    </div>
  </q-scroll-area>
</template>

<script>
import { ref } from 'vue';
import dayjs from 'dayjs';
// store
import { useStore } from '@/store/index';

export default {
  name: 'ListContainer',
  props: {
    data: {
      type: Array,
      default: () => [],
    },
  },
  setup() {
    const store = useStore();
    return {
      store,
    };
  },
  computed: {
    isEpisode() {
      return this.store.filterType === 'show' && this.store.filter.value === 'history';
    },
  },
  methods: {
    formattedDate(wDate) {
      return dayjs(wDate).format('MMM DD, YYYY');
    },
    formattedDateTime(wDate) {
      return `${dayjs(wDate).format('MMM DD, YYYY')} at ${dayjs(wDate).format('h:mma')}`;
    },
    clickDetails(item) {
      const mType = item.type === 'movie' ? 'movie' : 'show';
      const urlTitle = item[mType].ids.slug;
      const params = {
        [mType]: urlTitle,
      };
      if (item.type === 'episode') {
        params.season = item.episode.season;
        params.episode = item.episode.number;
      }
      this.$router.push({
        name: `${item.type}-details`,
        params,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Comfortaa:wght@300&display=swap');
.show-card {
  cursor: pointer;
  position: relative;
  & > img {
    width: 100%;
    display: block;
  }
}
.caption > div::first-letter {
  text-transform: uppercase;
}
.caption > .title {
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.clearlogo {
  width: 100px;
  min-width: 100px;
  height: 39px;
}
.clearlogoNoImg {
  height: 39px;
}
.rating {
  display: flex;
  padding: 10px 20px;
  text-align: center;
  line-height: 1em;
  font-family: 'Comfortaa', cursive;
  border-radius: 5px;
  & > div:not(:last-child) {
    margin-right: 10px;
  }
  & img {
    height: 20px;
    display: block;
    margin-bottom: 8px;
  }
}
.tags {
  margin-right: 5px;
  &:last-child {
    margin-right: 0;
  }
}
.watched-time {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: -2px;
  & > span:first-child {
    font-size: 1.2em;
    margin-right: 5px;
  }
  & > span:nth-child(2) {
    font-size: 1em;
    line-height: 1;
    margin-bottom: -1px;
    font-size: 0.8em;
  }
}
</style>
