<template>
  <q-layout
    view="lHh LpR lFf"
    class="layout full-height"
    :style="{ backgroundImage: `url(${backgroundImg})` }"
  >
    <HeaderBar :page="store.$state.page" />
    <q-drawer
      show-if-above
      :breakpoint="-1"
      v-model="drawer"
      :overlay="false"
      :mini="$q.screen.xs"
      class="app-drawer q-pa-sm"
      :width="200"
      persistent
      dark
    >
      <div>
        <q-img
          :src="myInfo?.account.cover_image ? myInfo?.account.cover_image : defaultBack"
          :class="{ 'avatar-mini': isSmall }"
          :style="`height: ${$q.screen.xs ? '50px' : '150px'}`"
          referrerpolicy="no-referrer"
        >
          <div v-if="myInfo" class="absolute-top-right bg-transparent z-top">
            <q-btn icon="logout" dense rounded flat @click="logout" />
          </div>
          <div v-if="myInfo" class="absolute-bottom bg-transparent">
            <q-avatar :size="$q.screen.xs ? '30px' : '56px'" class="q-mb-sm">
              <q-img
                :src="myInfo?.user.images.avatar.full"
                :alt="myInfo?.user.name"
                referrerpolicy="no-referrer"
              />
            </q-avatar>
            <div class="gt-xs">
              <div class="text-weight-bold">{{ myInfo?.user.name }}</div>
              <div>
                <a :href="`https://trakt.tv/users/${myInfo?.user.username}`" target="blank">
                  @{{ myInfo?.user.username }}
                </a>
              </div>
            </div>
          </div>
          <div v-else class="login">
            <q-btn color="white" style="background: rgba(0, 0, 0, 0.8)" flat @click="goToLogin">
              <q-avatar size="20px">
                <img :src="traktIcon" alt="" />
              </q-avatar>
              <div class="q-pl-sm">Login</div>
            </q-btn>
          </div>
        </q-img>

        <!-- <q-list dark>
          <q-item-label header>TV Shows</q-item-label>

          <q-item dense clickable color="secondary">
            <q-item-section avatar>
              <q-icon name="tv" />
            </q-item-section>
            <q-item-section class="gt-xs"> Trending </q-item-section>
          </q-item>
          <q-item dense clickable color="secondary">
            <q-item-section avatar>
              <q-icon name="tv" />
            </q-item-section>
            <q-item-section class="gt-xs"> Watched History </q-item-section>
          </q-item>
          <q-item dense clickable color="secondary">
            <q-item-section avatar>
              <q-icon name="tv" />
            </q-item-section>
            <q-item-section class="gt-xs"> Recommended by me </q-item-section>
          </q-item>
        </q-list> -->
        <q-list dark>
          <q-item
            clickable
            active-class="bg-secondary text-dark"
            :active="store.filterType === 'show'"
            @click="goToPage('show')"
          >
            <q-item-section avatar>
              <q-icon name="tv" />
            </q-item-section>
            <q-item-section class="gt-xs"> TV Shows </q-item-section>
          </q-item>

          <q-item
            clickable
            active-class="bg-secondary text-dark"
            :active="store.filterType === 'movie'"
            @click="goToPage('movie')"
          >
            <q-item-section avatar>
              <q-icon name="movie" />
            </q-item-section>

            <q-item-section class="gt-xs"> Movies </q-item-section>
          </q-item>
        </q-list>

        <div class="gt-xs bottom-links text-white">
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
      <div class="loader" v-if="!loaded">
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
import HeaderBar from '@/components/Header.vue';
// api
import { getAppBackgroundImg } from '@/api/tmdb';
// assets
import * as defaultImage from '@/assets/drawer-image-1.jpg';
import * as traktIcon from '@/assets/trakt-icon-red.svg';

export default {
  name: 'TraktVueApp',
  components: {
    HeaderBar,
    LoaderFingers,
  },
  setup() {
    const store = useStore();
    return {
      drawer: ref(true),
      store,
      myInfo: ref(store.myInfo),
      loaded: ref(false),
      defaultBack: defaultImage.default,
      traktIcon: traktIcon.default,
      backgroundImg: ref(''),
    };
  },
  async created() {
    // get updates from store
    this.store.$subscribe((mutated, state) => {
      this.loaded = state.loaded;
      this.myInfo = state.myInfo;
    });

    this.backgroundImg = await getAppBackgroundImg();
  },
  computed: {
    isSmall() {
      return this.$q.screen.xs;
    },
  },
  methods: {
    goToPage(page) {
      const pathName = page === 'movie' ? 'movie' : 'tv';
      this.store.updateFilterType(page);
      this.store.updateLoading(false);
      this.$router.push({ name: pathName });
    },
    goToLogin() {
      window.location =
        'https://trakt.tv/oauth/authorize?response_type=code&client_id=8b333edc96a59498525b416e49995b338e2c53a03738becfce16461c1e1086a3&redirect_uri=http://localhost:8080';
    },
    logout() {
      // localStorage.removeItem('trakt-vue-user');
      // localStorage.removeItem('trakt-vue-token');
      // localStorage.removeItem('trakt-vue-movie-ratings');
      localStorage.clear();
      this.$router.go();
    },
  },
};
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400&display=swap');
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
.app-drawer > div {
  display: flex;
  flex-direction: column;
  & .login {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
    text-align: center;
    & > button {
      top: calc(50% - 15px);
    }
  }
  & .avatar-mini {
    text-align: center;
    & > div > div {
      padding: 0;
    }
  }
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
  padding: 0 $space-sm $space-sm 0;
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
