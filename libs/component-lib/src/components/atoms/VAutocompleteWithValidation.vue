<template>
  <validation-provider
    v-slot="{ errors, classes }"
    :name="$attrs.name"
    :rules="rules"
    :mode="mode"
    tag="div">
    <v-autocomplete
      v-model="selectedItem"
      :items="items"
      :class="[$attrs.class, classes]"
      :chips="multiple"
      :multiple="multiple"
      :item-text="itemText"
      :return-object="returnObject"
      :error-messages="errors"
      outlined
      :attach="attach"
      :menu-props="{ contentClass: 'v-autocomplete-with-validation-dropdown' }"
      v-bind="$attrs"
      onfocus="this.setAttribute('autocomplete','nope');"
      v-on="$listeners">
      <template v-if="asyncMode && $attrs['loading']" #prepend-item>
        <div class="v-list-item">
          {{ $t(loadingLabel) }}  <v-progress-circular class="ml-2" size="20" width="3" color="primary" indeterminate />
        </div>
      </template>

      <template v-if="multiple" #selection="{ item, index }">
        <v-chip
          small
          close
          color="primary"
          class="white--text"
          :disabled="disableChipDelete"
          @click:close="removeItem(index)">
          <span :data-test="`${$attrs['data-test']}__selection--${getItemDataTest(item)}`">
            {{ getItemText(item) }}
          </span>
        </v-chip>
      </template>

      <template #item="{ item, attrs }">
        <div v-if="multiple" class="v-list-item__action">
          <div class="v-simple-checkbox">
            <div class="v-input--selection-controls__ripple primary--text" />
            <i
              aria-hidden="true"
              :class="{
                'v-icon notranslate mdi theme--light': true,
                'mdi-checkbox-marked': attrs['aria-selected'] === 'true',
                'mdi-checkbox-blank-outline': attrs['aria-selected'] !== 'true',
              }" />
          </div>
        </div>

        <div
          :class="`${$attrs['data-test']}__item`"
          :data-test="`${$attrs['data-test']}__item--${getItemDataTest(item)}`">
          {{ getItemText(item) }}
        </div>
      </template>
    </v-autocomplete>
  </validation-provider>
</template>

<script lang="ts">
import Vue from 'vue';
import { ValidationProvider } from 'vee-validate';

export default Vue.extend({
  name: 'VAutocompleteWithValidation',
  components: {
    ValidationProvider,
  },
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

    /**
     * Vee Validate rules
     */
    rules: {
      type: [String, Array, Object],
      default: null,
    },

    /**
     * Validation Provider mode
     */
    mode: {
      type: String,
      default: 'aggressive',
    },

    attach: {
      type: [String, Boolean, Object],
      default: true,
    },

    /**
     * Determine if the component will be used with async request to get items
     */
    asyncMode: {
      type: Boolean,
      default: false,
    },

    loadingLabel: {
      type: String,
      default: 'common.search.request_ongoing',
    },

    noResultLabel: {
      type: String,
      default: 'common.search.no_result',
    },

    initialLabel: {
      type: String,
      default: 'common.inputs.start_typing_to_search',
    },

    disableChipDelete: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      selectedItem: this.value,
    };
  },

  watch: {
    selectedItem(newVal) {
      this.$emit('input', newVal);
    },

    value(newVal) {
      this.selectedItem = newVal;
    },
  },

  methods: {
    /**
     * Get the string to use as the text in the select and items
     */
    getItemText(item: Record<string, string>) {
      if (typeof this.itemText === 'function') {
        return this.itemText(item);
      }

      if (typeof item === 'string') {
        return item;
      }

      return item[this.itemText];
    },

    /**
     * Get the string to use as the data-test attribute
     */
    getItemDataTest(item: Record<string, string>) {
      let dataTest;

      if (typeof this.itemDataTest === 'function') {
        dataTest = this.itemDataTest(item);
      } else if (typeof item === 'string') {
        dataTest = item;
      } else if (!this.itemDataTest) {
        dataTest = this.getItemText(item);
      } else {
        dataTest = item[this.itemDataTest];
      }

      return dataTest.replace(/\s|\./g, '');
    },

    getItemIndex(item: Record<string, unknown>): number {
      return this.items.indexOf(item);
    },

    /**
     * Remove an item when clicking on the X in a chip (only used in multiple mode)
     */
    removeItem(index: number) {
      if (this.multiple) {
        this.selectedItem = [
          ...this.selectedItem.slice(0, index),
          ...this.selectedItem.slice(index + 1),
        ];
      }
      this.$emit('delete', this.selectedItem);
    },
  },
});

</script>

<style lang="scss">
.v-select.v-select--chips:not(.v-text-field--single-line).v-text-field--enclosed .v-select__selections {
  min-height: 42px !important;
}
.v-autocomplete-with-validation-dropdown {
  .v-list-item {
    word-break: break-word;
  }
}
</style>
