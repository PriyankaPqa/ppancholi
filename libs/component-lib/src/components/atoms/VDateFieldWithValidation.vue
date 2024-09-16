<template>
  <v-menu
    v-model="menuModel"
    :data-test="`${dataTest}-menu`"
    v-bind="$attrs"
    transition="scale-transition"
    :close-on-content-click="false"
    offset-y
    min-width="290px">
    <template #activator="{ on }">
      <v-text-field-with-validation
        :data-test="dataTest"
        :value="innerValue"
        :label="$attrs.label"
        :disabled="$attrs.disabled"
        clearable
        readonly
        background-color="white"
        :rules="rules"
        v-bind="$attrs"
        v-on="on"
        @click:clear="innerValue = null" />
    </template>
    <validation-provider v-slot="{ errors, classes }" :name="$attrs.name" :rules="rules">
      <v-date-picker
        v-model="innerValue"
        :data-test="`${dataTest}-date-picker`"
        no-title
        :class="classes"
        :error-messages="errors"
        :locale="locale"
        :max="$attrs.max"
        :min="$attrs.min"
        role="none"
        v-on="addA11yAttribute($listeners)" />
    </validation-provider>
  </v-menu>
</template>

<script lang="ts">
import { ValidationProvider } from 'vee-validate';
import helpers from '@libs/component-lib/helpers';
import VTextFieldWithValidation from './VTextFieldWithValidation.vue';

export default {
  name: 'VDateFieldWithValidation',

  components: {
    VTextFieldWithValidation,
    ValidationProvider,
  },
  props: {
    locale: {
      type: String,
      default: 'en',
    },
    rules: {
      type: [Object, String],
      default: '',
    },

    // must be included in props
    value: {
      type: String,
      default: '',
    },

    dataTest: {
      type: String,
      default: 'dateField',
    },

  },
  data: () => ({
    menuModel: false,
    innerValue: '',
  }),
  watch: {
    // Handles internal model changes.
    innerValue(newVal) {
      this.$emit('input', newVal);
      this.$emit('change', newVal);
      this.menuModel = false;
    },
    // Handles external model changes.
    value(newVal) {
      this.innerValue = newVal;
    },
  },
  created() {
    if (this.value) {
      this.innerValue = this.value;
    }
  },

  methods: {
    addA11yAttribute(listeners: any) {
      helpers.setElementA11yAttribute('.v-menu__content.theme--light.menuable__content__active', 'role', 'none');
      return listeners;
    },
  },
};
</script>
