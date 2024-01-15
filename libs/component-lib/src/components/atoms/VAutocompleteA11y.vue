<template>
  <v-autocomplete
    ref="vAutocomplete"
    v-model="selectedItem"
    :items="items"
    :chips="multiple"
    :multiple="multiple"
    :item-text="itemText"
    :return-object="returnObject"
    :aria-label="ariaLabel"
    :data-test="`${$attrs['data-test']}_input`"
    outlined
    :attach="attach"
    :menu-props="{ contentClass: 'v-autocomplete-with-validation-dropdown' }"
    v-bind="$attrs"
    onfocus="this.setAttribute('autocomplete','on');"
    v-on="setA11yAttribute($listeners)">
    <!-- Pass on all named slots -->
    <slot v-for="slot in Object.keys($slots)" :slot="slot" :name="slot" />

    <!-- Pass on all scoped slots -->
    <template v-for="slot in Object.keys($scopedSlots)" :slot="slot" slot-scope="scope">
      <slot :name="slot" v-bind="scope" />
    </template>
  </v-autocomplete>
</template>

<script lang="ts">
import Vue from 'vue';
import helpers from '@libs/component-lib/helpers';

export default {
  name: 'VAutocompleteA11y',
  props: {
    /**
     * The selected value(s) of the dropdown
     */
    value: {
      type: [Object, Array, String, Number],
      default: () => [] as unknown[],
    },

    /**
     * The items to have in the dropdown list
     */
    items: {
      type: Array,
      default: (): Array<string | Record<string, unknown>> => [],
    },

    /**
     * Either the name of the object property to render as the item text, or a function to call to get the text
     */
    itemText: {
      type: [String, Function],
      default: 'text',
    },

    /**
     * Either the name of the object property to render as the item data-test, or a function to call to get the data-test
     */
    itemDataTest: {
      type: [String, Function],
      default: '',
    },

    /**
     * The return object prop from the v-autocomplete component
     */
    returnObject: {
      type: Boolean,
      default: false,
    },

    /**
     * Whether this is a single or multi select
     */
    multiple: {
      type: Boolean,
      default: false,
    },

    attach: {
      type: [String, Boolean, Object],
      default: true,
    },

    ariaLabel: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      selectedItem: this.value,
    };
  },

  methods: {
    // needed in order to set a11y attributes properly
    setA11yAttribute(listeners: any) {
      helpers.setElementA11yAttribute('.v-list.v-select-list.v-sheet', 'aria-busy', 'true', (this.$refs.vAutocomplete as Vue)?.$el);
      const controlsId = (this.$refs.vAutocomplete as Vue)?.$el.querySelector('.v-input__slot').getAttribute('aria-owns');
      if (controlsId) {
        helpers.setElementA11yAttribute('.v-input__slot', 'aria-controls', controlsId, (this.$refs.vAutocomplete as Vue)?.$el);
      }
      return listeners;
    },
  },

};
</script>
