<template>
  <!-- TODO: enhance localization
  -   title="Error"
  -   submit-action-label="Close"
   -->
  <rc-dialog
    :title="title"
    :show.sync="show"
    :submit-action-label="submitActionLabel"
    :show-cancel="false"
    content-padding="6"
    :content-only-scrolling="true"
    :persistent="true"
    :max-width="maxWidth"
    :min-height="minHeight"
    @close="onClose"
    @submit="onClose">
    <div
      class="rc-body14"
      data-test="error-message">
      {{ message }}
    </div>
  </rc-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import RcDialog from './RcDialog.vue';

export default Vue.extend({
  name: 'RcErrorDialog',
  components: {
    RcDialog,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      default: '',
    },
    minHeight: {
      type: [String, Number],
      default: 100,
    },
    maxWidth: {
      type: [String, Number],
      default: 500,
    },
    submitActionLabel: {
      type: String,
      default: 'Close',
    },
  },
  methods: {
    onClose() {
      this.$emit('update:show', false);
    },
  },
});
</script>
