<template>
  <q-layout
    view="lHh LpR lFf"
    class="layout full-height"
    :style="{ backgroundImage: `url(${backgroundImg})` }"
  >
    <Header :page="store.$state.page" />
    <q-drawer
      v-if="$q.screen.xs === false"
      show-if-above
      :breakpoint="1"
      v-model="drawer"
      :overlay="false"
      class="app-drawer"
      :width="200"
      persistent
      dark
    >
      <div>
        <q-img
          :src="
            store.myInfo?.account.cover_image
              ? `${store.myInfo?.account.cover_image}.webp`
              : defaultBack
          "
          style="height: 150px"
          referrerpolicy="no-referrer"
        >
          <div v-if="store.myInfo" class="absolute-bottom bg-transparent">
            <q-avatar size="60px" class="q-mb-sm">
              <q-img
                :src="store.myInfo?.user.images.avatar.full"
                :alt="store.myInfo?.user.name"
                referrerpolicy="no-referrer"
              />
            </q-avatar>
            <div>
              <div class="text-weight-bold">{{ store.myInfo?.user.name }}</div>
              <div>
                <a :href="`https://trakt.tv/users/${store.myInfo?.user.username}`" target="blank">
                  @{{ store.myInfo?.user.username }}
                </a>
              </div>
            </div>
          </div>
        </q-img>

        <q-list dark>
          <q-item-label header>TV Shows</q-item-label>
          <q-item
            v-for="link in filterOptions.show"
            :key="link"
            dense
            clickable
            color="secondary"
            active-class="bg-secondary"
            :active="store.filter?.value === link.value && store.filterType === 'show'"
            @click="handleMenuClick(link, 'show')"
          >
            <q-item-section dark>{{ link.label }} </q-item-section>
          </q-item>
        </q-list>

        <q-list dark>
          <q-item-label header>Movies</q-item-label>
          <q-item
            v-for="link in filterOptions.movie"
            :key="link"
            dense
            clickable
            color="secondary"
            active-class="bg-secondary"
            :active="store.filter?.value === link.value && store.filterType === 'movie'"
            @click="handleMenuClick(link, 'movie')"
          >
            <q-item-section dark>{{ link.label }} </q-item-section>
          </q-item>
        </q-list>

        <div class="bottom-links text-white">
          <div>Powered by</div>
          <div>
            <a href="https://vuejs.org/" target="blank">
              <img src="@/assets/vuejs.png" alt="Vue.js" />
            </a>
            <a href="https://trakt.tv/" target="blank">
              <img src="@/assets/trakt-wide-red-white.svg" alt="The Movie DB" />
            </a>
            <a href="https://www.themoviedb.org/" target="blank">
              <img src="@/assets/tmdb.svg" alt="The Movie DB" />
            </a>
            <a href="https://fanart.tv/" target="blank">
              <img src="@/assets/fanart.tv.png" alt="fanart.tv" />
            </a>
          </div>
        </div>
      </div>
    </q-drawer>

    <q-page-container class="full-height">
      <div class="loader" v-if="!store.loaded">
        <div class="full-height full-width">
          <loader-fingers />
        </div>
      </div>

      <!-- page renders here -->
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref } from 'vue';
import { useStore } from '@/store/index';
// components
import LoaderFingers from '@/components/LoaderFingers.vue';
import Header from '@/components/Header.vue';
// api
import { getAppBackgroundImg } from '@/api/tmdb';
// assets
import * as defaultImage from '@/assets/drawer-image-1.jpg';

export default {
  name: 'TraktVueApp',
  components: {
    Header,
    LoaderFingers,
  },
  setup() {
    const store = useStore();
    return {
      drawer: ref(true),
      store,
      defaultBack: defaultImage.default,
      backgroundImg: ref(''),
    };
  },
  async created() {
    this.backgroundImg = await getAppBackgroundImg();
  },
  computed: {
    filterOptions() {
      const options = { ...this.store.filterOptions };
      if (!this.store.myInfo) {
        Object.entries(this.store.filterOptions).forEach((mType) => {
          options[mType[0]] = mType[1].filter((item) => item.auth === false);
        });
      }
      return options;
    },
  },
  methods: {
    handleMenuClick(item, filterType) {
      this.store.updateLoading(false);
      this.store.updateFilterType(filterType);
      this.store.updatePage(1);
      this.store.updateFilter(item);
      this.$router.push({
        path: filterType === 'movie' ? `/movie/${item.value}` : `/tv/${item.value}`,
      });
    },
    goToPage(page) {
      this.store.updateLoading(false);
      const pathName = page === 'movie' ? 'movie' : 'tv';
      this.store.updateFilterType(page);
      this.$router.push({ name: pathName });
    },
  },
};
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400&&display=swap');
@import '@/css/quasar.variables.scss';

* {
  box-sizing: border-box;
}

html,
body {
  height: 100%;
  min-height: 100%;
  overflow: hidden;
  color: white;
}
a,
a:visited,
a:active {
  text-decoration: none;
  // color: $accent !important;
}
a:hover {
  text-decoration: underline;
}
h1 {
  font-size: 24px;
  line-height: 1;
}
h2 {
  font-size: 24px;
  line-height: 1;
}
a,
a:hover,
a:active {
  color: white;
}
button {
  background: none;
  border: none;
  cursor: pointer;
  color: white;
  padding: 0;
}
.q-dialog__backdrop {
  background: rgba(0, 0, 0, 0.9) !important;
}
.layout {
  background-size: cover;
  background-repeat: no-repeat;
  background-attachment: fixed;
}
.q-pa-sm-ov {
  padding: $space-sm !important;
}
.scroll-area {
  height: calc(100% - 150px);
}
.app-drawer {
  padding: $space-sm;
  padding-right: 0;
  & > div {
    display: flex;
    flex-direction: column;
    & .bottom-links {
      flex-grow: 1;
      width: 100%;
      font-size: 0.8em;
      text-align: right;
      display: flex;
      align-items: flex-end;
      justify-content: flex-end;
      & > div:first-child {
        flex-grow: 1;
        margin-right: 15px;
        padding-bottom: 7px;
      }
      & > div > a {
        &:first-child > img {
          margin-left: -22px;
          width: 112px;
        }
        & > img {
          width: 90px;
          margin: 0 7px 7px 0;
          display: block;
        }
      }
    }
  }
}
.q-drawer {
  background: none !important;
  & > div > div {
    background-color: rgba(0, 0, 0, $opacity-back) !important;
    height: 100%;
    border-radius: 5px;
    overflow: hidden;
  }
}
.loader {
  padding: 0 $space-sm $space-sm $space-sm;
  height: 100%;
  & > div {
    @include background-style;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

body::-webkit-scrollbar-track-piece {
  display: none;
}

/* width */
::-webkit-scrollbar {
  display: none;
  width: 10px;
  background: url('@/assets/transparent.png') repeat;
}

/* Track */
::-webkit-scrollbar-track {
  display: block;
  background: url('@/assets/transparent.png') repeat;
}

/* Handle */
::-webkit-scrollbar-thumb {
  display: block;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 2px;
}
:deep(.q-notify) {
  height: 0;
  min-height: 0;
}
</style>
