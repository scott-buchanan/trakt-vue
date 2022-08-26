<template>
  <q-scroll-area class="full-height full-width" :thumb-style="{ opacity: 0.5 }">
    <div class="row" v-if="data?.length > 0">
      <div
        class="col-12 col-md-6 col-xl-4 show-card"
        v-for="item in data"
        :key="item[mType].ids.trakt"
        @click="clickDetails(item)"
        @keyDown="clickDetails(item)"
      >
        <q-img
          no-spinner
          :src="item.backdrop.backdrop_sm"
          :alt="item[mType].title"
          fit="cover"
          :ratio="16 / 9"
        >
          <div class="rating absolute-top-right q-ma-sm">
            <div v-if="item.imdb_rating">
              <img src="@/assets/imdb_tall.png" :alt="`IMDb rating ${item.imdb_rating}`" />
              <div>{{ item.imdb_rating }}</div>
            </div>
            <div v-if="item.trakt_rating && item.trakt_rating !== '0.0'">
              <img src="@/assets/trakt-icon-red.svg" alt="Trakt" />
              <div>{{ item.trakt_rating }}</div>
            </div>
            <div v-if="item.tmdb_rating && item.tmdb_rating !== '0.0'">
              <img src="@/assets/tmdb_tall.svg" alt="The Movie DB" />
              <div>{{ item.tmdb_rating }}</div>
            </div>
            <div v-if="item.my_rating">
              <q-avatar size="20px" class="q-mb-sm">
                <q-img
                  img-class="user-image"
                  :src="user?.images.avatar.full"
                  :alt="user?.name"
                  referrerpolicy="no-referrer"
                />
              </q-avatar>
              <div>
                {{
                  item.my_rating.rating === 10
                    ? item.my_rating.rating
                    : item.my_rating.rating.toFixed(1)
                }}
              </div>
            </div>
          </div>
          <div
            :class="[
              'absolute-bottom',
              'caption',
              'flex',
              'justify-between',
              'items-center',
              'no-wrap',
            ]"
          >
            <div v-if="item.clear_logo" class="clearlogo">
              <q-img no-spinner :src="item.clear_logo" fit="cover" alt="" />
            </div>
            <div v-else class="clearlogoNoImg flex items-center">
              {{ item[mType].title }}
            </div>
            <div v-if="isEpisode" class="title q-pl-sm">
              <b>
                {{ item.episode?.season }}x{{ item.episode?.number.toString().padStart(2, '0') }}
              </b>
              {{ item.episode?.title }}
              <div class="watched-time">
                <span>
                  <q-icon name="o_watch_later" />
                </span>
                <span>{{ formattedDate(item.watched_at) }}</span>
                <q-tooltip :delay="500" :offset="[0, 5]">
                  {{ formattedDateTime(item.watched_at) }}
                </q-tooltip>
              </div>
            </div>
            <div v-else class="text-right">
              <div>
                <b>{{ item[mType].year }}</b>
              </div>
              <span v-if="item.watchers" class="q-pr-sm">
                <q-icon name="visibility" size="24px" />
                {{ item.watchers }}
                <q-tooltip :delay="500" :offset="[0, 5]">
                  {{ item.watchers }} people watching now
                </q-tooltip>
              </span>
              <span class="tags" v-for="genre in item.genres?.slice(0, 4)" :key="genre.id">
                <q-badge color="secondary" class="text-dark">
                  {{ genre.name }}
                </q-badge>
              </span>
            </div>
          </div>
        </q-img>
      </div>
    </div>
  </q-scroll-area>
</template>

<script>
import { ref } from 'vue';
import dayjs from 'dayjs';
// store
import { useStore } from '@/store/index';

export default {
  name: 'CardContainer',
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    mType: {
      type: String,
      default: 'show',
    },
  },
  setup() {
    const store = useStore();
    return {
      user: ref(JSON.parse(localStorage.getItem('trakt-vue-user'))?.user),
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
