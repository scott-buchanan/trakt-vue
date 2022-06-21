<template>
  <q-layout view="lHh LpR lFf" class="bg-dark">
    <HeaderBar :page="data.$state.page" />
    <q-drawer v-model="drawer" :width="200" persistent class="bg-primary" bordered dark>
      <q-scroll-area class="scroll-area">
        <q-list class="text-white">
          <q-item
            clickable
            active-class="bg-secondary text-dark"
            :active="link === 'tvshows'"
            @click="link = 'tvshows'"
          >
            <q-item-section avatar>
              <q-icon name="tvshow" />
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
      </q-scroll-area>

      <q-img
        class="absolute-top header-image"
        src="@/assets/drawer-image-1.jpg"
        style="height: 150px"
        fit="none"
      >
        <div class="absolute-bottom bg-transparent">
          <q-avatar size="56px" class="q-mb-sm">
            <img src="@/assets/me.jpg" alt="Scott Buchanan" />
          </q-avatar>
          <div class="text-weight-bold">Scott Buchanan</div>
          <div><a href="https://trakt.tv/users/bukes" target="blank">@bukes</a></div>
        </div>
      </q-img>
      <div class="bottom-links text-white">
        <div>Powered by</div>
        <div>
          <img src="@/assets/vuejs.png" alt="Vue.js" />
          <img src="@/assets/trakt-wide-red-white.svg" alt="The Movie DB" />
          <img
            src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg"
            alt="The Movie DB"
          />
          <img src="@/assets/fanart.tv.png" alt="fanart.tv" />
        </div>
      </div>
    </q-drawer>
    <q-page-container class="bg-dark full-height">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { useStore } from '@/store/index';
import { ref } from 'vue';
import HeaderBar from './components/Header.vue';

export default {
  name: 'TraktVueApp',
  components: {
    HeaderBar,
  },
  setup() {
    const data = useStore();
    return {
      drawer: ref(true),
      link: ref('tvshows'),
      data,
    };
  },
};
</script>

<style lang="scss">
a,
a:hover,
a:active {
  color: white;
}
.scroll-area {
  height: calc(100% - 150px);
  margin-top: 150px;
}
.bottom-links {
  position: absolute;
  width: 100%;
  bottom: 0;
  font-size: 0.8em;
  text-align: right;
  display: flex;
  align-items: flex-end;
  & > div:first-child {
    flex-grow: 1;
    margin-right: 15px;
    padding-bottom: 7px;
  }
  & > div > img {
    &:first-child {
      margin-left: -22px;
      width: 112px;
    }
    width: 90px;
    margin: 0 7px 7px 0;
    display: block;
  }
}
</style>
