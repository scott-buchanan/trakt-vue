<template>
  <div v-if="horizontal" class="actors-container-small">
    <div class="q-pa-md full-height">
      <h1 class="q-mb-none q-mt-auto">Starring</h1>
      <q-scroll-area dark class="full-height">
        <div :class="['flex', 'no-wrap', 'q-pb-sm']">
          <div
            :class="['actor-small', { 'q-mr-md': index !== actors.length - 1 }]"
            v-for="(actor, index) in actors"
            :key="actor.person.ids.trakt"
          >
            <a
              v-if="actor.person.ids.imdb"
              :href="`https://imdb.com/name/${actor.person.ids.imdb}`"
              target="blank"
            >
              <q-img class="q-my-sm" :src="actor.image" :alt="actor.person.name">
                <div :class="['actor-image-text', 'absolute-bottom', 'q-pa-sm-ov']">
                  {{ actor.person.name }}
                </div>
              </q-img>
            </a>
            <div class="actor-image-text">
              <template v-for="(character, index) in actor.characters" :key="character">
                {{ character }}{{ index !== actor.characters.length - 1 ? ' / ' : '' }}
              </template>
            </div>
            <q-tooltip :delay="500" anchor="top middle" self="center middle">
              {{ getActorTooltip(actor) }}
            </q-tooltip>
          </div>
        </div>
      </q-scroll-area>
    </div>
  </div>
  <div v-else class="actors-container text-white q-pl-sm">
    <q-scroll-area class="full-height full-width q-pa-sm" :thumb-style="{ opacity: 0.5 }">
      <h1 class="q-mb-none q-mt-auto">Starring</h1>
      <div class="actor" v-for="actor in actors" :key="actor.person.ids.trakt">
        <a
          v-if="actor.person.ids.imdb"
          :href="`https://imdb.com/name/${actor.person.ids.imdb}`"
          target="blank"
        >
          <q-img class="q-my-sm" :src="actor.image" :alt="actor.person.name">
            <div class="actor-image-text absolute-bottom q-pa-xs">
              {{ actor.person.name }}
            </div>
          </q-img>
        </a>
        <q-img v-else class="q-my-sm" :src="actor.image" :alt="actor.person.name">
          <div class="actor-image-text absolute-bottom q-pa-xs">
            {{ actor.person.name }}
          </div>
        </q-img>
        <span v-for="(character, index) in actor.characters" :key="character">
          {{ character }}{{ index !== actor.characters.length - 1 ? ' / ' : '' }}
        </span>
      </div>
    </q-scroll-area>
  </div>
</template>

<script>
export default {
  name: 'Actors',
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
  methods: {
    getActorTooltip(actor) {
      let tooltip = `${actor.person.name} as `;
      actor.characters.forEach((character) => {
        tooltip += `${character}/`;
      });
      return tooltip.slice(0, -1);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/css/quasar.variables.scss';
.actors-container {
  width: 200px;
  & > div {
    @include background-style;
  }
  & .actor > div {
    border-radius: 5px;
  }
}
.actor-image-text {
  font-size: 0.75em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.actors-container-small {
  height: 230px;
  color: white;
  width: 100%;
  & .actor-small {
    width: 100px;
  }
}
</style>
