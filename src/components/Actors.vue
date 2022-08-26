<template>
  <template v-if="actors.length > 0">
    <div v-if="horizontal" class="actors-container-small">
      <div :class="['full-height']">
        <q-scroll-area class="full-height" dark>
          <h1 :class="['q-mb-none', 'q-mt-auto']">Starring</h1>
          <div :class="['flex', 'no-wrap', 'q-pb-sm']">
            <div
              :class="['actor-small', { 'q-mr-md': index !== actors.length - 1 }]"
              v-for="(actor, index) in actors"
              :key="actor.ids.trakt"
            >
              <ActorImage :actor="actor" small />
            </div>
          </div>
        </q-scroll-area>
      </div>
    </div>
    <div v-else :class="['actors-container', 'text-white', 'q-pl-sm']">
      <q-scroll-area
        :class="['actors-container-scroll', 'full-height', 'full-width', 'q-pa-sm']"
        :thumb-style="{ opacity: 0.5 }"
      >
        <h1 :class="['q-mb-none', 'q-mt-auto']">Starring</h1>
        <div v-for="actor in actors" :key="actor.ids.trakt">
          <ActorImage :actor="actor" />
        </div>
        <q-btn label="See All" :class="['full-width', 'q-mt-sm']" :ripple="false" />
      </q-scroll-area>
    </div>
  </template>
</template>

<script>
import ActorImage from '@/components/ActorImage.vue';

export default {
  name: 'Actors',
  components: { ActorImage },
  props: {
    horizontal: {
      type: Boolean,
      default: false,
    },
    actors: {
      type: Array,
      required: true,
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/css/quasar.variables.scss';
.actors-container {
  width: 200px;
  & > .actors-container-scroll {
    @include background-style;
  }
}
.actors-container-small {
  height: 200px;
  color: white;
  width: 100%;
  margin-bottom: $space-md;
  position: relative;
  & .actor-small {
    width: 100px;
  }
}
</style>
