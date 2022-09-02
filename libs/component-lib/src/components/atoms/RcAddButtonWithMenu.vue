<template>
  <v-menu absolute nudge-right="20">
    <template #activator="{ on: menu, attrs, value }">
      <rc-tooltip bottom>
        <template #activator="{ on: tooltip }">
          <v-btn
            v-bind="attrs"
            class="mr-3"
            :data-test="$attrs['data-test']"
            fab
            color="white"
            small
            v-on="{ ...tooltip, ...menu }">
            <v-icon color="primary" :class="{ 'addButton': true, 'active': value }">
              mdi-plus
            </v-icon>
          </v-btn>
        </template>
        {{ addButtonLabel }}
      </rc-tooltip>
    </template>

    <v-list>
      <v-list-item v-for="item in items" :key="item.value" :data-test="item.dataTest" :disabled="item.disabled" @click="$emit('click-item', item)">
        <v-icon class="mr-4" color="primary darken-1" :disabled="item.disabled">
          {{ item.icon }}
        </v-icon>
        {{ item.text }}
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import Vue from 'vue';
import RcTooltip from '@libs/component-lib/components/atoms/RcTooltip.vue';

export default Vue.extend({
  name: 'RcAddButtonWithMenu',

  components: {
    RcTooltip,
  },

  props: {
    /**
     * Array of items to render in the menu when the button is clicked
     * { text: string, value: string, icon: string, dataTest: string }
     */
    items: {
      type: Array,
      required: true,
    },
    addButtonLabel: {
      type: String,
      default: 'Add',
    },
  },
});
</script>

<style scoped lang="scss">
.addButton.active {
  transform: rotate(45deg);
}
</style>
