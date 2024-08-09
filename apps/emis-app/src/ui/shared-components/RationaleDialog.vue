<template>
  <validation-observer ref="form" v-slot="{ failed }" slim>
    <rc-dialog
      v-if="show"
      :title="title"
      :show.sync="show"
      :cancel-action-label="$t('common.buttons.cancel')"
      :submit-action-label="$t('common.save')"
      :submit-button-disabled="failed"
      :loading="loading"
      :content-only-scrolling="true"
      :persistent="true"
      :show-help="false"
      :tooltip-label="$t('common.tooltip_label')"
      :max-width="750"
      content-padding="5"
      data-test="rationale-dialog"
      @cancel="cancel"
      @close="close"
      @submit="submit">
      <div class="px-16 mx-8 overflow-hidden">
        <v-col
          cols="12"
          class=" mt-2 mb-8 pa-4 border-radius-all background-color rc-body14"
          data-test="rationale-dialog-user-date">
          <span class="font-weight-bold">
            {{ userBoxText }}
          </span>
          <span>{{ `${userInfo} - ${format(new Date(), 'PP')}` }}</span>
        </v-col>

        <v-text-area-with-validation
          v-model="answer.rationale"
          rows="2"
          :label="`${$t('impactedIndividuals.rationale')} *`"
          class="full-width"
          :rules="{ required: true, max: MAX_LENGTH_MD }"
          data-test="rationale-dialog-rationale" />
      </div>
    </rc-dialog>
  </validation-observer>
</template>

<script lang='ts'>
import Vue from 'vue';
import {
  RcDialog,
  VTextAreaWithValidation,
} from '@libs/component-lib/components';
import { MAX_LENGTH_MD } from '@libs/shared-lib/constants/validations';
import { VForm } from '@libs/shared-lib/types';
import { IUserAccountMetadata } from '@libs/entities-lib/user-account';
import { useUserAccountMetadataStore } from '@/pinia/user-account/user-account';
import { useUserStore } from '@/pinia/user/user';
import { format } from 'date-fns';

export default Vue.extend({
  name: 'RationaleDialog',

  components: {
    RcDialog,
    VTextAreaWithValidation,
  },

  data() {
    return {
      userInput: { answered: false, rationale: null as string },
      promise: null,
      format,
      MAX_LENGTH_MD,
      show: false,
      userBoxText: null as string,
      title: null as string,
      loading: false,
    };
  },

  computed: {
    userAccountMetadata(): IUserAccountMetadata {
      return useUserAccountMetadataStore().getById(useUserStore().getUserId());
    },

    userInfo(): string {
      return `${this.userAccountMetadata.displayName} (${this.$m(this.userAccountMetadata.roleName)})`;
    },
  },

  methods: {
    // Used to open programmatically the dialog
    // The promise returns the answer
    open(params: { title: string, userBoxText: string }): Promise<boolean> {
      this.show = true;
      this.title = params.title;
      this.userBoxText = params.userBoxText;
      return new Promise((resolve) => {
        this.promise = resolve;
      });
    },
    cancel(): void {
      this.doClose('cancel');
    },
    close(): void {
      this.doClose('close');
    },
    doClose(emitted: string) {
      this.userInput.answered = false;
      this.userInput.rationale = null;
      if (this.promise) {
        this.promise(this.userInput);
      }
      this.loading = false;
      this.show = false;
      this.$emit(emitted);
    },
    async submit(): Promise<void> {
      const isValid = await (this.$refs.form as VForm).validate();
      if (isValid) {
        this.loading = true;
        this.userInput.answered = true;
        if (this.promise) {
          this.promise(this.userInput);
        }
        this.$emit('submit');
      }
    },
  },

});

</script>

<style lang="scss" scoped>
.background-color {
  background-color: var(--v-status_yellow_pale-base);
}
</style>
