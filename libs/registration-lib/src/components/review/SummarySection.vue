<template>
  <div>
    <div class="title-container mb-2 mt-8">
      <div data-test="title" class="rc-heading-5 flex-grow-1 fw-bold">
        {{ title }}
      </div>
      <template v-if="showEditButton">
        <v-btn
          v-if="!inlineEdit"
          :aria-label="`${title} ${$t('common.buttons.edit')}`"
          data-test="inlineEdit__open"
          icon
          @click.native="edit()">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
      </template>
    </div>

    <slot v-if="inlineEdit" name="inline" />
    <slot v-else />

    <div v-if="inlineEdit" class="inline__actions">
      <v-btn class="mr-2" data-test="inlineEdit__cancel" @click.native="cancel()">
        {{ $t('common.cancel') }}
      </v-btn>
      <v-btn class="ml-2" color="primary" data-test="inlineEdit__save" :loading="loading" :disabled="submitDisabled" @click.native="onSubmit()">
        {{ $t('common.save') }}
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'SummarySection',

  props: {

    title: {
      type: String,
      required: true,
    },

    inlineEdit: {
      type: Boolean,
      required: false,
    },

    showEditButton: {
      type: Boolean,
      default: true,
    },

    loading: {
      type: Boolean,
      default: false,
    },

    submitDisabled: {
      type: Boolean,
      default: false,
    },
  },

  methods: {
    edit() {
      this.$emit('edit');
    },

    cancel() {
      this.$emit('cancel');
    },
    onSubmit() {
      this.$emit('submit');
    },
  },
});
</script>

<style lang="scss" scoped>
.title-container {
  display: flex;
  justify-items: center;
  align-items: center;
}

.inline__actions {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}
</style>
