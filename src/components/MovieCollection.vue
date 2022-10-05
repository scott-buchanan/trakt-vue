<template>
  <div v-if="info" class="q-mt-lg">
    <h2>{{ info.name }}</h2>
    <div class="posters wrap">
      <div v-for="item in info.parts" :key="item.id">
        <q-img
          v-if="movie.ids.tmdb === item.id"
          :src="item.poster_path"
          :alt="item.title"
          :ratio="1 / 1.5"
          width="150px"
          class="poster"
        >
          <div v-if="item.watched_progress" class="poster-watched">
            <q-icon name="check_circle_outline" size="sm" color="positive" />
          </div>
        </q-img>
        <router-link v-else :to="{ name: 'movie-details', params: { movie: item.slug } }">
          <q-img
            :src="item.poster_path"
            :alt="item.title"
            :ratio="1 / 1.5"
            width="150px"
            class="poster"
          >
            <div v-if="item.watched_progress" class="poster-watched">
              <q-icon name="check_circle_outline" size="sm" color="positive" />
            </div>
          </q-img>
        </router-link>
      </div>
    </div>
  </div>
  <div v-else>penis</div>
</template>

<script>
import { ref } from 'vue';
// api
import { getMovieCollection } from '@/api/combinedCalls';

export default {
  name: 'MovieCollection',
  props: {
    movie: {
      type: Object,
      required: true,
    },
    collectionId: {
      type: Number,
      required: true,
    },
  },
  setup() {
    return {
      info: ref(null),
    };
  },
  async created() {
    this.info = await getMovieCollection(this.collectionId);
  },
};
</script>

<style lang="scss" scoped>
@import '@/css/quasar.variables.scss';

h2 {
  all: revert;
  margin: 0 0 $space-sm 0;
}
.posters {
  display: flex;
  gap: 10px;
  & .poster {
    border-radius: 5px;
    & .poster-watched {
      position: absolute;
      top: 5px;
      right: 5px;
      padding: 5px;
      border-radius: 5px;
    }
  }
}
</style>
