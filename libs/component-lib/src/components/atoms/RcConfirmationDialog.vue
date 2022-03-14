<template>
  <rc-dialog
    :title="title"
    :cancel-action-label="$t(cancelButtonKey)"
    :submit-action-label="$t(submitButtonKey)"
    :submit-button-disabled="submitButtonDisabled"
    :show-cancel="showCancel"
    :show-close="showClose"
    :show.sync="show"
    :persistent="true"
    :max-width="maxWidth"
    :min-height="minHeight"
    :loading="loading"
    :show-help="showHelp"
    :help-link="helpLink"
    :tooltip-label="$t(tooltipLabel)"
    @cancel="cancel"
    @close="close"
    @submit="submit">
    <template v-if="messages">
      <template v-if="Array.isArray(messages)">
        <div
          v-for="(m, i) in messages"
          :key="i"
          :class="{'rc-body14': true, 'pre-formatted': true, 'mt-4': i >= 1}"
          :data-test="`message__line_${i}`">
          <span>{{ m }}</span>
        </div>
      </template>
      <div v-else class="rc-body14 pre-formatted" data-test="message__line_0">
        <span>{{ messages }}</span>
      </div>
    </template>
    <slot v-else name="default" />
  </rc-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import RcDialog from './RcDialog.vue';

export default Vue.extend({
  name: 'RcConfirmationDialog',
  components: {
    RcDialog,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    show: {
      type: Boolean,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    messages: {
      type: [String, Array],
      default: '',
    },
    submitButtonKey: {
      type: String,
      default: 'common.buttons.yes',
    },
    submitButtonDisabled: {
      type: Boolean,
      default: false,
    },
    cancelButtonKey: {
      type: String,
      default: 'common.buttons.no',
    },
    showHelp: {
      type: Boolean,
      default: false,
    },
    showCancel: {
      type: Boolean,
      default: true,
    },
    showClose: {
      type: Boolean,
      default: true,
    },
    helpLink: {
      type: String,
      default: '',
    },
    tooltipLabel: {
      type: String,
      default: 'common.tooltip_label',
    },
    maxWidth: {
      type: String,
      default: '750',
    },
    minHeight: {
      type: String,
      default: '100',
    },
  },
  data() {
    return {
      answer: null,
    };
  },

  methods: {
    // Used to open programmatically the dialog
    // The promise is used only in cases such as beforeRouteLeave
    open(): Promise<boolean> {
      this.$emit('update:show', true);
      return new Promise((resolve) => {
        this.answer = resolve;
      });
    },
    cancel(): void {
      if (this.answer) {
        this.answer(false);
      }
      this.$emit('update:show', false);
      this.$emit('cancel');
    },
    close(): void {
      if (this.answer) {
        this.answer(false);
      }
      this.$emit('update:show', false);
      this.$emit('close');
    },
    submit(): void {
      if (this.answer) {
        this.answer(true);
      }
      this.$emit('submit');
    },
  },
});
</script>
