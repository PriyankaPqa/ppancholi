<template>
  <home-level1 />
</template>

<script lang="ts">
import Vue from 'vue';
import HomeLevel1 from '@/ui/views/pages/home/layout/HomeLevel1.vue';

export default Vue.extend({
  name: 'HomeLevel2',
  components: {
    HomeLevel1,
  },
});
</script>
