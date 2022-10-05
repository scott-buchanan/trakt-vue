<template>
  <a v-if="actor.ids.imdb" :href="`https://imdb.com/name/${actor.ids.imdb}`" target="blank">
    <q-img
      :ratio="1.5 / 1"
      :class="['actor-image', { small: small }]"
      :src="actor.profile_path ? actor.profile_path : noActorImage"
      :alt="actor.name"
    >
      <div :class="['actor-image-text', { small: small }, 'absolute-bottom']">
        <strong>{{ actor.name }}</strong>
        <br />
        as {{ actor.character }}
      </div>
    </q-img>
  </a>
  <q-img
    v-else
    :ratio="1.5 / 1"
    :class="['actor-image', { small: small }]"
    :src="actor.profile_path ? actor.profile_path : noActorImage"
    :alt="actor.name"
  >
    <div :class="['actor-image-text', { small: small }, 'absolute-bottom']">
      <strong>{{ actor.name }}</strong>
      <br />
      as {{ actor.character }}
    </div>
  </q-img>
  <q-tooltip v-if="small" :delay="500" anchor="top middle" self="center middle">
    {{ getActorTooltip(actor) }}
  </q-tooltip>
</template>

<script>
import * as noActor from '@/assets/no-actor.jpg';

export default {
  name: 'ActorImage',
  props: {
    actor: {
      type: Object,
      required: true,
    },
    small: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    return {
      noActorImage: noActor.default,
    };
  },
  methods: {
    getActorTooltip(actor) {
      return `${actor.name} as ${actor.character}`;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/css/quasar.variables.scss';
.actor-image {
  border-radius: 5px;
  min-height: 264px;
  &.small {
    min-height: 150px;
  }
}
.actor-image-text {
  font-size: 0.85em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: $space-sm;
  &.small > strong {
    font-size: 1em;
  }
  & strong {
    font-size: 1.3em;
  }
}
</style>
