<template>
  <q-header reveal height-hint="98" class="header">
    <div
      :class="['header-back', 'row', 'items-center', 'justify-between', 'q-pa-sm']"
      :style="backgroundStyle"
    >
      <q-input
        ref="searchInput"
        v-model="searchTypedValue"
        color="secondary"
        label-color="white"
        label="Search"
        outlined
        dense
        dark
        :class="[
          { 'order-last full-width': screenGreaterThan.xs === false },
          screenGreaterThan.xs === false ? 'q-mt-sm' : 'aq-my-sm',
          'col-xs-grow',
          'col-xs-shrink',
          'col-sm-6',
          'q-mr-sm',
        ]"
        clearable
        @update:model-value="doSearch"
        @focus="searchHasFocus = true"
        @blur="handleSearchBlur"
        @clear="autocompleteApiResults = []"
        @keydown="goSearch"
      >
        <template v-slot:append>
          <button @click="goSearch"><q-icon name="search" /></button>
        </template>
      </q-input>
      <q-menu
        :model-value="showMenu"
        :target="$refs.searchInput"
        no-parent-event
        no-focus
        :offset="[0, 5]"
        max-height="90vh"
        fit
        persistent
        no-refocus
        class="autocomplete-menu"
        transition-show="jump-up"
        transition-hide="jump-down"
      >
        <q-list>
          <q-item
            v-for="result in autocompleteApiResults"
            :key="result.value"
            class="autocomplete-item"
            clickable
            @click="goToDetails(result)"
            v-close-popup
          >
            <q-item-section
              :style="{
                height: '90px',
              }"
              class="q-pl-sm"
              thumbnail
            >
              <img class="full-height" :src="result.thumbnail" alt="" />
            </q-item-section>
            <q-item-section>
              <div class="q-mb-xs flex items-center">
                <b>{{ result.label }}</b>
                <q-chip
                  :label="result.type === 'movie' ? 'Movie' : 'TV Show'"
                  square
                  color="white"
                  dense
                  size="sm"
                  icon-right
                  :icon="result.type === 'movie' ? 'theaters' : 'tv'"
                  class="q-ml-sm"
                />
              </div>
              <div>{{ result.year }}</div>
              <div>
                <template v-for="(genre, index) in result.genres" :key="genre">
                  <small class="text-capitalize">
                    {{ genre }}<template v-if="index !== result.genres.length - 1">, </template>
                  </small>
                </template>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-menu>
      <q-select
        v-if="screenGreaterThan.xs === false"
        v-model="selectFilterModel"
        :options="selectFilterOptions"
        :label="selectFilterLabel"
        color="secondary"
        label-color="white"
        :class="['filter-select']"
        dense
        dark
        outlined
      >
        <template #option="props">
          <q-list>
            <q-item-label v-if="props.opt.isFirst" header>{{ props.opt.filter }}</q-item-label>
            <q-item clickable @click="handleMenuClick(props.opt, props.opt.filter)">
              <span class="q-ml-md">{{ props.opt.label }}</span>
            </q-item>
          </q-list>
        </template>
      </q-select>
      <q-btn-dropdown v-if="store.myInfo" flat no-caps dense :ripple="false" class="col-auto">
        <template #label>
          <!-- <q-avatar size="md">
            <img :src="store.myInfo?.user.images.avatar.full" alt="" referrerpolicy="no-referrer" />
          </q-avatar> -->
          <span class="q-ml-sm">{{ store.myInfo.user.name }}</span>
        </template>
        <q-list class="bg-grey-10">
          <q-item clickable v-close-popup @click="logout">
            <q-item-section>
              <q-item-label>Logout</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="logout" color="white" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
      <q-btn
        v-else
        class="login-button"
        text-color="white"
        outline
        :ripple="false"
        @click="goToLogin"
      >
        <q-avatar size="20px">
          <img :src="traktIcon" alt="" />
        </q-avatar>
        <div class="q-pl-sm">Login</div>
      </q-btn>
    </div>
  </q-header>
</template>

<script>
import { ref } from 'vue';
import dayjs from 'dayjs';
import * as fallbackPoster from '@/assets/fallback-tv.jpg';
import * as traktIcon from '@/assets/trakt-icon-red.svg';
import * as defaultImage from '@/assets/drawer-image-1.jpg';
// store
import { useStore } from '@/store/index';
// api
import { getSearchResults } from '@/api/tmdb';

export default {
  name: 'Header',
  props: {
    page: {
      type: Number,
      default: 1,
    },
  },
  setup() {
    const store = useStore();
    return {
      store,
      filterModel: ref(store.filter?.label),
      autocompleteApiResults: ref([]),
      selectModel: ref(null),
      searchHasFocus: ref(false),
      searchTypedValue: ref(null),
      menuVisible: ref(store.menuVisible),
      autocompleteTimer: ref(null),
      traktIcon: traktIcon.default,
      defaultBack: defaultImage.default,
    };
  },
  created() {
    this.store.$subscribe((mutated, state) => {
      this.menuVisible = state.menuVisible;
    });
  },
  computed: {
    selectFilterModel() {
      return this.store.filter.label ? this.store.filter.label : 'Make a selection';
    },
    selectFilterLabel() {
      if (this.store.filter.label) {
        return this.store.filterType === 'movie' ? 'Movies' : 'TV';
      }
      return 'Filter';
    },
    selectFilterOptions() {
      const arrOptions = [];
      Object.entries(this.store.filterOptions).forEach((filter) => {
        filter[1].forEach((item, index) => {
          const header = {};
          header.filter = filter[0] === 'movie' ? 'Movies' : 'TV';
          if (index === 0) header.isFirst = true;

          if (!this.store.myInfo) {
            if (!item.auth) arrOptions.push({ ...header, ...item });
          } else {
            arrOptions.push({ ...header, ...item });
          }
        });
      });
      return arrOptions;
    },
    showMenu() {
      return this.searchHasFocus && this.menuVisible && this.autocompleteApiResults.length > 0;
    },
    screenGreaterThan() {
      return this.$q.screen.gt;
    },
    backgroundStyle() {
      if (this.screenGreaterThan.xs === false) {
        if (this.store.myInfo?.account.cover_image) {
          return {
            backgroundImage: `${this.backgroundGradient()} url(${
              this.store.myInfo?.account.cover_image
            }.webp)`,
          };
        }
        return {
          backgroundImage: `${this.backgroundGradient()} url(${this.defaultBack})`,
        };
      }
      return null;
    },
  },
  methods: {
    handleMenuClick(item, filterType) {
      this.store.updateLoading(false);
      this.store.updateFilterType(filterType === 'Movies' ? 'movie' : 'show');
      this.store.updatePage(1);
      this.store.updateFilter({ label: item.label, value: item.value });
      this.$router.push({
        path: filterType === 'Movies' ? `/movie/${item.value}` : `/tv/${item.value}`,
      });
    },
    handleSearchBlur() {
      if (!document.activeElement.className.includes('autocomplete-item')) {
        this.searchHasFocus = false;
      }
    },
    async doSearch(value) {
      this.store.updateMenuVisible(true);
      this.searchTypedValue = value;
      if (value?.length > 1) {
        if (this.autocompleteTimer) {
          clearTimeout(this.autocompleteTimer);
        }
        this.autocompleteTimer = setTimeout(async () => {
          const results = await getSearchResults(value);
          this.autocompleteApiResults = [];
          results.forEach(async (result) => {
            this.autocompleteApiResults.push({
              ids: result.ids,
              label: result.media_type === 'movie' ? result.title : result.name,
              value: result.id,
              type: result.media_type,
              thumbnail: result.poster_path
                ? `https://image.tmdb.org/t/p/w200/${result.poster_path}`
                : fallbackPoster.default,
              year: dayjs(
                result.media_type === 'movie' ? result.release_date : result.first_air_date
              ).format('YYYY'),
              genres: result.genres,
            });
          });
        }, 300);
      } else this.autocompleteApiResults = [];
    },
    async goToDetails(item) {
      const mType = item.type === 'movie' ? 'movie' : 'show';
      const urlTitle = item.ids.slug;
      const params = {
        [mType]: urlTitle,
      };

      this.searchTypedValue = null;
      this.autocompleteApiResults = [];

      if (mType === 'show' && item.episode) {
        params.season = item.episode.season;
        params.episode = item.episode.number;
      }
      this.$router.push({
        name: `${mType}-details`,
        params,
      });
    },
    goSearch(event) {
      if (this.searchTypedValue?.length > 0) {
        if (event.key?.toLowerCase() === 'enter' || event.type === 'click') {
          this.store.updateMenuVisible(false);
          const searchTerm = this.searchTypedValue;
          this.searchTypedValue = null;
          this.autocompleteApiResults = [];
          this.$router.push({ name: 'search', query: { term: searchTerm } });
        }
      }
    },
    goToLogin() {
      window.location =
        'https://trakt.tv/oauth/authorize?response_type=code&client_id=8b333edc96a59498525b416e49995b338e2c53a03738becfce16461c1e1086a3&redirect_uri=http://localhost:8080';
    },
    logout() {
      localStorage.clear();
      this.$router.go('/');
    },
    backgroundGradient() {
      return `linear-gradient(to top right, rgba(0,0,0,.8), rgba(0,0,0,.5) 70%, rgba(0,0,0,.3)),
         linear-gradient(to top      , rgba(0,0,0,.5), rgba(0,0,0,.2) 70%, rgba(0,0,0,0)),
         linear-gradient(to right    , rgba(0,0,0,.5), rgba(0,0,0,.2) 70%, rgba(0,0,0,0)),`;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/css/quasar.variables.scss';

.header {
  background: transparent;
  padding: $space-sm;
  & > div {
    @include background-style;
  }
  & .header-back {
    background-size: cover;
    background-position: center center;
  }
  & .login-button {
    height: 40px;
    &::before {
      border-color: rgba(255, 255, 255, 0.6);
    }
  }
}
.scroll-area {
  width: 100%;
  height: 90vh;
}
.autocomplete-item {
  background-color: #1f1f1f;
  border-bottom: 1px solid $accent;
  font-size: 1.2em;
  &:hover {
    background-color: #313131;
  }
  &:last-child {
    border: none;
  }
  & :first-child {
    width: auto;
    padding: 0;
  }
  & img {
    object-fit: cover;
    aspect-ratio: 1/1.5;
  }
}
</style>
