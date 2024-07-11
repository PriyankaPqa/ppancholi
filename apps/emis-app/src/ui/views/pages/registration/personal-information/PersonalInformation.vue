<template>
  <personal-information-lib skip-phone-email-rules :is-edit-mode="isEditMode" />
</template>

<script lang="ts">
import Vue from 'vue';
import PersonalInformationLib from '@libs/registration-lib/components/personal-information/PersonalInformationLib.vue';

export default Vue.extend({
  name: 'PersonalInformation',

  components: {
    PersonalInformationLib,
  },

  props: {
    isEditMode: {
      type: Boolean,
      default: false,
    },
  },
});
</script>
