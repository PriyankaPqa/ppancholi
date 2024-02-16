<template>
  <a v-if="showAsLink" :href="`tel:${formattedPhoneNumber}`">
    <span v-bind="$attrs">{{ formattedPhoneNumber }}</span>
  </a>
  <span v-else v-bind="$attrs">{{ formattedPhoneNumber }}</span>
</template>

<script lang="ts">
import Vue from 'vue';
import { parsePhoneNumber, ParsedPhoneNumber } from 'awesome-phonenumber';

/**
   * A phone number label with automatic formatting.
   */
export default Vue.extend({
  name: 'RcPhoneDisplay',

  props: {
    /**
       * The value for the phone label in E.164 format eg +15149876543
       */
    value: {
      type: [String],
      default: '',
    },

    /**
     * Whether or not to show the country code before the number
     */
    showCountryCode: {
      type: Boolean,
      default: true,
    },

    /**
    * Whether the number should be displayed as a call-able link
    */
    showAsLink: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    phoneObject(): ParsedPhoneNumber {
      if (!this.value) {
        return null;
      }
      return parsePhoneNumber(this.value);
    },

    formattedPhoneNumber(): string {
      if (this.phoneObject?.valid) {
        if (this.showCountryCode) {
          return `${this.phoneObject.countryCode} ${this.phoneObject.number.national}`;
        }

        return this.phoneObject.number.national;
      }
      return this.value;
    },
  },
});
</script>
