<template>
  <div class="row" v-if="data?.items.length > 0">
    <div
      class="col-12 col-sm-6 col-xl-4 show-card"
      v-for="item in data.items"
      :key="mType === 'episode' ? item.episode.ids.trakt : item.show.ids.trakt"
    >
      <q-img
        no-spinner
        :src="item.backdrop"
        :alt="mType === 'episode' ? item.episode.title : item.show.title"
        fit="cover"
        :ratio="16 / 9"
      >
        <div class="rating absolute-top-right">
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
              <img src="@/assets/me.jpg" alt="Scott Buchanan" />
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
          <div v-show="!item.clear_logo" class="clearlogoNoImg flex items-center">
            {{ item.show.title }}
          </div>
          <div v-if="mType === 'episode'" class="title">
            <div>
              <b>{{ item.episode.season }}x{{ item.episode.number.toString().padStart(2, '0') }}</b>
              {{ item.episode.title }}
            </div>
            <div class="watched-time">
              <span>
                <q-icon name="o_watch_later" />
              </span>
              <span>{{ formattedDate(item.watched_at) }}</span>
              <q-tooltip :delay="500" :offset="[0, 5]">
                Watched on {{ formattedDateTime(item.watched_at) }}
              </q-tooltip>
            </div>
          </div>
          <div v-else class="text-right">
            <div>
              <b>{{ item.show.year }}</b>
            </div>
            <span class="tags" v-for="genre in item.genres" :key="genre.id">
              <q-badge color="secondary" class="text-dark">
                {{ genre.name }}
              </q-badge>
            </span>
          </div>
        </div>
      </q-img>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs';

export default {
  name: 'CardContainer',
  props: {
    data: {
      type: Object,
      default: () => {},
    },
    mType: {
      type: String,
      default: 'show',
    },
  },
  methods: {
    formattedDate(wDate) {
      return dayjs(wDate).format('MMM DD, YYYY');
    },
    formattedDateTime(wDate) {
      return `${dayjs(wDate).format('MMM DD, YYYY')} at ${dayjs(wDate).format('h:mma')}`;
    },
  },
};
</script>

<style lang="scss" scoped>
.show-card {
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
  word-wrap: break-word;
  text-align: right;
}
.clearlogo {
  width: 100px;
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
