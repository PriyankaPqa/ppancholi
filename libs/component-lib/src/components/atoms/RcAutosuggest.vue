<template>
  <div>
    <v-text-field-with-validation
      v-model="localValue"
      v-bind="$attrs"
      autocomplete="off"
      :rules="rules"
      @keydown="menuActive = true"
      @click="menuActive = true">
      <template #append>
        <v-icon :class="{ rotate: menuActive }">
          mdi-menu-down
        </v-icon>
      </template>
    </v-text-field-with-validation>
    <div :id="attach" class="anchor" />

    <v-menu
      v-model="menuActive"
      :attach="`#${attach}`"
      max-height="304"
      min-width="100%"
      :position-x="0"
      :position-y="-30"
      offset-y
      @input="menuActive = $event">
      <v-list>
        <v-list-item
          v-for="(item, index) in itemsFiltered"
          :key="index"
          :data-test="getItemDataTest(item)"
          @click="localValue = item">
          {{ getItemText(item) }}
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import helpers from '@libs/shared-lib/helpers/helpers';
import { IMultilingual } from '@libs/shared-lib/types';
import VTextFieldWithValidation from './VTextFieldWithValidation.vue';

export default Vue.extend({
  name: 'RcAutosuggest',

  components: {
    VTextFieldWithValidation,
  },

  props: {
    value: {
      type: String,
      required: true,
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
    * Vee Validate rules
    */
    rules: {
      type: [Object, String],
      required: true,
    },

    /**
    * Unique ID used to anchor the menu to the input
    */
    attach: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      menuActive: false,
    };
  },

  computed: {
    localValue: {
      get(): string {
        return this.value;
      },

      set(value: string | Record<string, unknown>) {
        if (typeof value !== 'string') {
          this.menuActive = false;
        }

        this.$emit('input', value);
      },
    },

    itemsFiltered(): Array<unknown> {
      const search = this.localValue as string;

      if (search) {
        const normalizedSearch = helpers.getNormalizedString(search).toLowerCase();

        const searched = this.items.filter((i) => {
          const normalizedName = helpers.getNormalizedString(this.getItemText(i as Record<string, string>)).toLowerCase();

          return normalizedName.indexOf(normalizedSearch) > -1;
        });

        return searched.length ? searched : [search];
      }

      return this.items;
    },
  },

  methods: {
    /**
    * Get the string to use as the text in the select and items
    */
    getItemText(item: Record<string, string>) {
      if (typeof item === 'string') {
        return item;
      }

      if (typeof this.itemText === 'function') {
        return this.itemText(item);
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
        dataTest = (item?.name as unknown as IMultilingual)?.translation?.en ?? item?.dataTest ?? this.getItemText(item);
      } else {
        dataTest = item[this.itemDataTest];
      }
      return dataTest.replace(/\s|\./g, '');
    },
  },
});
</script>

  <style scoped lang="scss">
    .rotate {
    transform: rotate(180deg);
    }

    .anchor {
    position: relative;
    }
  </style>
