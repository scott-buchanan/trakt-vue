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
          src="@/assets/drawer-image-1.jpg"
          :class="{ 'avatar-mini': isSmall }"
          :style="`height: ${$q.screen.xs ? '50px' : '150px'}`"
        >
          <div class="absolute-bottom bg-transparent">
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
            <q-item-section class="gt-xs"> TV Shows </q-item-section>
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
// import trakt from '@/api/trakt';

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
      myInfo: ref(store.myInfo),
      loaded: ref(false),
      backgroundImg: ref(''),
    };
  },
  async created() {
    // get updates from store
    this.store.$subscribe((mutated, state) => {
      this.loaded = state.loaded;
      this.myInfo = state.myInfo;
    });
    console.log('piss');

    // const urlParams = new URLSearchParams(window.location.search);
    // let authTokens;
    // if (localStorage.getItem('trakt-vue-token')) {
    //   // if local storage has tokens, get the accessToken from the refreshToken
    //   const tokens = JSON.parse(localStorage.getItem('trakt-vue-token'));
    //   authTokens = await trakt.getTokenFromRefresh(tokens.refreshToken, this.$route.path);
    //   localStorage.setItem('trakt-vue-token', JSON.stringify(authTokens));
    //   this.store.updateTokens(authTokens);
    // } else if (urlParams.get('code')) {
    //   // if no tokens were present and we fell into the else, we get redirected
    //   // with query: code and put tokens into local storage
    //   authTokens = await trakt.getToken(urlParams.get('code'), this.$route.path);
    //   localStorage.setItem('trakt-vue-token', JSON.stringify(authTokens));
    //   this.store.updateTokens(authTokens);
    // } else {
    //   window.location = `https://trakt.tv/oauth/authorize?response_type=code&client_id=8b333edc96a59498525b416e49995b338e2c53a03738becfce16461c1e1086a3&redirect_uri=http://localhost:8080${this.$route.path}`;
    // }

    // this.myInfo = await trakt.getTraktSettings(authTokens.accessToken);

    this.backgroundImg = await getAppBackgroundImg();
  },
  computed: {
    isSmall() {
      return this.$q.screen.xs;
    },
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
.q-pa-sm-ov {
  padding: $space-sm !important;
}
.scroll-area {
  height: calc(100% - 150px);
}
.app-drawer > div {
  display: flex;
  flex-direction: column;
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
</style>
