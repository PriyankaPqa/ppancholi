<template>
  <v-menu bottom :close-on-click="closeOnClick">
    <template #activator="{ on, attrs }">
      <v-btn :color="color" class="secondaryButton" v-bind="attrs" v-on="on">
        {{ buttonLabel }}
        <v-icon right dark>
          mdi-chevron-down
        </v-icon>
      </v-btn>
    </template>

    <v-list>
      <v-list-item v-for="(item, index) in items" :key="index" @click="$emit('click', item.value)">
        <v-list-item-content>
          <v-list-item-title>{{ getItemText(item) }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'RcMenu',
  props: {
    items: {
      type: Array as () => Record<string, string>[],
      required: true,
    },
    buttonLabel: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      default: 'primary',
    },
    /**
     * Either the name of the object property to render as the item text, or a function to call to get the text
     */
    itemText: {
      type: [String, Function],
      default: 'text',
    },
  },
  data: () => ({
    closeOnClick: true,
  }),
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
  },

});
</script>

<style lang="scss" scoped>

</style>
