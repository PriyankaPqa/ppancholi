<template>
  <transition
    name="fade"
    mode="out-in">
    <router-view />
  </transition>
</template>

<script>
export default {
  name: 'RouterViewTransition',
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition-duration: 0.15s;
  transition-property: opacity;
  transition-timing-function: ease;
}

.fade-enter,
.fade-leave-active {
  opacity: 0
}

</style>
