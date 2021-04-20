<template>
  <div>
    Case file details
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'CaseFileDetails',

  components: {

  },

  props: {
    /**
     * The id of the current case file
     */
    id: {
      type: String,
      required: true,
    },
  },

  data() {
    return {

    };
  },

  computed: {

  },

  methods: {

  },
});
</script>

<style scoped lang="scss">

</style>
