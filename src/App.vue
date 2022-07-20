<template>
  <q-layout
    view="lHh LpR lFf"
    class="layout full-height"
    :style="{ backgroundImage: `url(${backgroundImg})` }"
  >
    <HeaderBar :page="store.$state.page" />
    <q-drawer v-model="drawer" class="app-drawer" :width="200" persistent dark>
      <q-img class="header-image" src="@/assets/drawer-image-1.jpg" style="height: 150px">
        <div class="absolute-bottom bg-transparent">
          <q-avatar size="56px" class="q-mb-sm">
            <img
              :src="myInfo?.user.images.avatar.full"
              :alt="myInfo?.user.name"
              referrerpolicy="no-referrer"
            />
          </q-avatar>
          <div class="text-weight-bold">{{ myInfo?.user.name }}</div>
          <div>
            <a :href="`https://trakt.tv/users/${myInfo?.user.username}`" target="blank">
              @{{ myInfo?.user.username }}
            </a>
          </div>
        </div>
      </q-img>

      <q-list class="text-white">
        <q-item
          clickable
          active-class="bg-secondary text-dark"
          :active="link === 'tv'"
          @click="goToPage('tv')"
        >
          <q-item-section avatar>
            <q-icon name="tv" />
          </q-item-section>
          <q-item-section> TV Shows </q-item-section>
        </q-item>

        <q-item
          clickable
          active-class="bg-secondary text-dark"
          :active="link === 'movies'"
          @click="link = 'movies'"
        >
          <q-item-section avatar>
            <q-icon name="movie" />
          </q-item-section>

          <q-item-section> Movies </q-item-section>
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
import trakt from '@/api/trakt';

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
      link: ref('tv'),
      store,
      myInfo: ref(null),
      loaded: ref(false),
      backgroundImg: ref(''),
    };
  },
  async created() {
    const urlParams = new URLSearchParams(window.location.search);

    // get updates from store
    this.store.$subscribe((mutated, state) => {
      this.loaded = state.loaded;
    });

    let authTokens;
    if (localStorage.getItem('trakt-vue-token')) {
      // if local storage has tokens, get the accessToken from the refreshToken
      const tokens = JSON.parse(localStorage.getItem('trakt-vue-token'));
      authTokens = await trakt.getTokenFromRefresh(tokens.refreshToken, this.$route.path);
      localStorage.setItem('trakt-vue-token', JSON.stringify(authTokens));
    } else if (urlParams.get('code')) {
      // if no tokens were present and we fell into the else, we get redirected
      // with query: code and put tokens into local storage
      authTokens = await trakt.getToken(urlParams.get('code'), this.$route.path);
      localStorage.setItem('trakt-vue-token', JSON.stringify(authTokens));
    } else {
      window.location = `https://trakt.tv/oauth/authorize?response_type=code&client_id=8b333edc96a59498525b416e49995b338e2c53a03738becfce16461c1e1086a3&redirect_uri=http://localhost:8080${this.$route.path}`;
    }

    // get trakt settings
    this.myInfo = await trakt.getTraktSettings(authTokens.accessToken);
    localStorage.setItem('trakt-vue-user', JSON.stringify(this.myInfo.user));

    this.backgroundImg = await getAppBackgroundImg();
  },
  methods: {
    goToPage(page) {
      this.link = page;
      this.$router.push({ name: page });
    },
  },
};
</script>

<style lang="scss">
@import '@/css/quasar.variables.scss';

html,
body {
  height: 100%;
  min-height: 100%;
  overflow: hidden;
  & > div {
    height: 100%;
    min-height: 100%;
  }
}
h1 {
  font-size: 24px !important;
  line-height: 1 !important;
}
h2 {
  font-size: 18px !important;
  line-height: 1 !important;
}
a,
a:hover,
a:active {
  color: white;
}
.layout {
  background-size: cover;
  background-repeat: no-repeat;
  background-attachment: fixed;
}
.scroll-area {
  height: calc(100% - 150px);
}
.app-drawer {
  display: flex;
  flex-direction: column;
  > div:nth-child(2) {
    flex-grow: 1;
  }
}
.q-drawer {
  padding: 5px;
  background: none !important;
  > div {
    border-radius: 5px;
    background-color: rgba(0, 0, 0, $opacity-back) !important;
  }
}
.bottom-links {
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
.loader {
  padding: 5px 5px 5px 0;
  height: 100%;
  & > div {
    @include background-style;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
