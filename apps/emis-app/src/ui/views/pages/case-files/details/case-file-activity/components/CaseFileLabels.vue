<template>
  <div class="flex-row caseFileLabels__row pl-6" data-test="row-label">
    <v-btn
      :disabled="readonly"
      class="mr-4"
      small
      data-test="caseFileActivity-add-label-btn"
      @click="showLabelsDialog = true">
      <v-icon small>
        mdi-plus
      </v-icon>
      {{ $t('caseFileActivity.labels.addLabel') }}
    </v-btn>

    <div v-for="label in labelsSorted" :key="label.order" class="rc-body14 caseFileLabels__label">
      {{ label.name }}
    </div>

    <validation-observer ref="form" v-slot="{ dirty, failed }" slim>
      <rc-dialog
        v-if="showLabelsDialog"
        data-test="case-file-labels-dialog"
        :title="$t('caseFileActivity.labels.addLabel')"
        :cancel-action-label="$t('common.cancel')"
        :submit-action-label="$t('common.save')"
        :show.sync="showLabelsDialog"
        :content-only-scrolling="true"
        :persistent="true"
        :max-width="750"
        :min-height="480"
        :submit-button-disabled="!dirty || failed"
        :loading="loading"
        @cancel="closeDialog"
        @close="closeDialog"
        @submit="submitAddLabels()">
        <div>
          <v-text-field-with-validation
            v-for="(label, $index) in labels"
            :key="label.order"
            v-model="label.name"
            :data-test="`case-file-labels-${$index + 1}`"
            :label="$t(`caseFileActivity.labels.label${$index + 1}`)"
            :rules="rules.label" />
        </div>
      </rc-dialog>
    </validation-observer>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import _orderBy from 'lodash/orderBy';
import { RcDialog, VTextFieldWithValidation } from '@libs/component-lib/components';
import { ICaseFileLabel } from '@libs/entities-lib/case-file';
import { MAX_LENGTH_SM } from '@libs/shared-lib/constants/validations';
import { VForm } from '@libs/shared-lib/types';
import { useCaseFileStore } from '@/pinia/case-file/case-file';

const NUM_LABELS = 4;

export default Vue.extend({
  name: 'CaseFileLabels',

  components: {
    RcDialog,
    VTextFieldWithValidation,
  },

  props: {
    caseFileLabels: {
      type: Array as ()=> ICaseFileLabel[],
      required: true,
    },
    caseFileId: {
      type: String,
      required: true,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      showLabelsDialog: false,
      loading: false,
      labels: [],
    };
  },

  computed: {
    labelsSorted(): ICaseFileLabel[] {
      const filtered = this.caseFileLabels.filter((l) => !!l.name);
      const sorted = _orderBy(filtered, 'order');

      return sorted;
    },

    rules(): Record<string, unknown> {
      return {
        label: {
          max: MAX_LENGTH_SM,

        },
      };
    },
  },

  mounted() {
    this.labels = this.copyLabels(this.caseFileLabels);
  },

  methods: {
    closeDialog() {
      this.showLabelsDialog = false;
      this.labels = this.copyLabels(this.caseFileLabels);
      },

    copyLabels(labels: ICaseFileLabel[]) {
      const mappedLabels = [];
      for (let x = 0; x < NUM_LABELS; x += 1) {
        if (labels && labels[x]) {
          mappedLabels.push({
            name: this.caseFileLabels[x].name.trim(),
            order: x + 1,
          });
        } else {
          mappedLabels.push({
            name: '',
            order: x + 1,
          });
        }
      }
      return mappedLabels;
    },

    async submitAddLabels() {
      const isValid = await (this.$refs.form as VForm).validate();

      if (isValid) {
          const copyOriginalLabels = this.copyLabels(this.caseFileLabels);
          if (!this.isNewLabelChangeValid(copyOriginalLabels, this.labels)) {
            this.labels = copyOriginalLabels;
            this.$toasted.global.info(this.$t('caseFileActivity.labels.info.labelNotModified'));
            this.showLabelsDialog = false;
            return;
          }

        this.loading = true;

        try {
          await useCaseFileStore().setCaseFileLabels(this.caseFileId, this.labels);
          this.$toasted.global.success(this.$t('caseFileActivity.labels.success.labelsModified'));
          this.showLabelsDialog = false;
        } finally {
          this.loading = false;
        }
      }
    },

    // To check if the update of labels is valid, avoiding generate invalid activity when only white spaces added or deleted
    isNewLabelChangeValid(oldLabels: ICaseFileLabel[], newLabels: ICaseFileLabel[]) :Boolean {
      for (let i = 0; i < NUM_LABELS; i += 1) {
        if (oldLabels[i].name.trim().replace(/\s+/g, ' ') !== newLabels[i].name.trim().replace(/\s+/g, ' ')) {
          return true;
        }
      }
      return false;
    },
  },
});
</script>

<style scoped lang="scss">
.caseFileLabels__row {
  width: 100%;
  padding: 16px;
  border-bottom: 1px solid var(--v-grey-lighten2);
}

.caseFileLabels__label {
  padding-left: 12px;
  padding-right: 12px;
  border-left: 1px solid var(--v-grey-lighten2);
}

.caseFileLabels__label:last-child {
  border-right: 1px solid var(--v-grey-lighten2);
}
</style>
