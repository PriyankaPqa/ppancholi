<template>
  <validation-provider v-slot="{ errors, classes }" :name="$attrs.name" :rules="rules" :mode="mode">
    <rc-phone :value="innerValue" :class="classes" :error-messages="errors" v-bind="$attrs" v-on="$listeners" />
  </validation-provider>
</template>

<script lang="ts">
import Vue from 'vue';
import { ValidationProvider } from 'vee-validate';
import RcPhone from './RcPhone.vue';

export default Vue.extend({
  name: 'RcPhoneWithValidation',

  components: {
    ValidationProvider,
    RcPhone,
  },

  props: {
    /**
     * The value for the input, bound with v-model. Example: { number: '514-521-9999', countryISO2: 'CA', e164Number: '+514521999' }
     */
    value: {
      type: Object as () => { number: string; countryISO2: string; e164Number: string },
      default: () => ({ number: '', countryISO2: '', e164Number: '' }),
    },

    rules: {
      type: [Object, String],
      default: null,
    },

    mode: {
      type: String,
      default: 'lazy',
    },
  },

  data() {
    return {
      innerValue: null,
    };
  },

  watch: {
    value: {
      deep: true,
      immediate: true,
      handler(newValue) {
        this.innerValue = newValue;
      },
    },
  },
});
</script>
