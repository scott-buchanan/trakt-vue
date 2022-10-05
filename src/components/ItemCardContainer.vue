<template>
  <div :class="['card-container', oneRowLonger ? 'long-row' : 'short-row']"><slot></slot></div>
</template>

<script>
export default {
  name: 'ItemCardContainer',
  props: {
    oneRowLonger: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/css/quasar.variables.scss';

.card-container {
  display: grid;
  grid-gap: $space-sm;
  grid-template-columns: repeat(1, 1fr);
  &.short-row {
    @media only screen and (min-width: $breakpoint-md) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  &.long-row {
    @media only screen and (min-width: $breakpoint-lg) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
}
</style>
