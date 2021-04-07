<template>
  <event-generic-location-dialog v-bind="$attrs" :is-registration-location="false" v-on="$listeners" />
</template>

<script lang="ts">
import Vue from 'vue';
import EventGenericLocationDialog from './EventGenericLocationDialog.vue';

export default Vue.extend({
  name: 'EventShelterLocationDialog',

  components: {
    EventGenericLocationDialog,
  },
});
</script>
