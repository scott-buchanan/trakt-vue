<template>
  <div class="card-container"><slot></slot></div>
</template>

<script>
export default {
  name: 'ItemCardContainer',
};
</script>

<style lang="scss" scoped>
@import '@/css/quasar.variables.scss';
.card-container {
  display: grid;
  grid-gap: 15px;
  grid-template-columns: repeat(1, 1fr);
  @media only screen and (min-width: $breakpoint-lg) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
