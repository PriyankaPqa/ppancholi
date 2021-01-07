<template>
  <div class="secondary-right-menu grey lighten-4" v-bind="$attrs">
    <slot name="right-menu-top" />
    <slot name="right-menu-default" />
  </div>
</template>

<script>
export default {
  name: 'SecondaryRightMenu',
};
</script>

<style scoped lang="scss">
.secondary-right-menu {
  width: 298px;
  padding: 16px;
  padding-left: 0;
}

.full-row {
  width: 100%;
}
</style>
