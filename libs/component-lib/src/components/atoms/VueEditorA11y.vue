<template>
  <vue-editor
    :id="`${$attrs['id']}_inner`"
    ref="vueEditorA11y"
    v-bind="$attrs"
    v-on="$listeners" />
</template>

<script lang="ts">
import Vue from 'vue';
// eslint-disable-next-line import/no-extraneous-dependencies
import { VueEditor } from 'vue2-editor';
import helpers from '@libs/component-lib/helpers';

export default Vue.extend({
  name: 'VueEditorA11y',

  components: {
    VueEditor,
  },

  async mounted() {
    await this.setButtonsA11y();
  },

  methods: {
    setButtonsA11y() {
      setTimeout(() => {
        helpers.setElementA11yAttribute('span .ql-picker-label', 'aria-label', 'button', (this.$refs.vueEditorA11y as Vue)?.$el);
        helpers.setElementA11yAttribute('button', 'aria-label', 'button', (this.$refs.vueEditorA11y as Vue)?.$el);
      }, 0);
    },
  },
});
</script>

<style scoped>

</style>
