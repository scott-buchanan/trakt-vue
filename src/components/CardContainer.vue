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
          :src="item.backdrop_sm"
          :alt="item[mType].title"
          fit="cover"
          :ratio="16 / 9"
        >
          <div class="rating absolute-top-right">
            <div v-if="item.imdb_rating">
              <img src="@/assets/imdb.svg" :alt="`IMDb rating ${item.imdb_rating}`" />
              <span>{{ item.imdb_rating }}</span>
            </div>
            <div v-if="item.trakt_rating && item.trakt_rating !== '0.0'">
              <img src="@/assets/trakt-icon-red.svg" alt="Trakt" />
              <span>{{ item.trakt_rating }}</span>
            </div>
            <div v-if="item.tmdb_rating && item.tmdb_rating !== '0.0'">
              <img
                src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_1-5bdc75aaebeb75dc7ae79426ddd9be3b2be1e342510f8202baf6bffa71d7f5c4.svg"
                alt="The Movie DB"
              />
              <span>{{ item.tmdb_rating }}</span>
            </div>
            <div v-if="item.my_rating">
              <q-avatar size="20px" class="block">
                <q-img
                  :src="user?.images.avatar.full"
                  :alt="user?.name"
                  referrerpolicy="no-referrer"
                />
              </q-avatar>
              <span>{{ item.my_rating.rating }}</span>
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
              {{ item.show.title }}
            </div>
            <div v-if="mType === 'episode'" class="title q-pl-sm">
              <b>{{ item.episode.season }}x{{ item.episode.number.toString().padStart(2, '0') }}</b>
              {{ item.episode.title }}
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
              <span class="tags" v-for="genre in item.genres.slice(0, 4)" :key="genre.id">
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
    return {
      user: ref(JSON.parse(localStorage.getItem('trakt-vue-user'))),
    };
  },
  methods: {
    formattedDate(wDate) {
      return dayjs(wDate).format('MMM DD, YYYY');
    },
    formattedDateTime(wDate) {
      return `${dayjs(wDate).format('MMM DD, YYYY')} at ${dayjs(wDate).format('h:mma')}`;
    },
    clickDetails(item) {
      const urlTitle = item.show.title
        .replace(/[^a-zA-Z ]/g, '')
        .replace(/\s/g, '-')
        .toLowerCase();
      sessionStorage.setItem(
        'trakt-vue-current-item',
        JSON.stringify({ ...item, ...{ mType: this.mType } }),
      );
      if (this.mType === 'episode') {
        this.$router.push({
          name: 'episode-details',
          params: { show: urlTitle, season: item.episode.season, episode: item.episode.number },
          props: { data: item },
        });
      } else {
        this.$router.push({
          name: 'show-details',
          params: { show: urlTitle },
          props: { data: item },
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
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
  padding: 10px;
  & > div:first-child {
    margin-top: 0;
  }
  & > div {
    margin-top: 5px;
  }
  text-align: center;
  & > div > img {
    width: 20px;
    display: block;
    margin: 0 auto;
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
