<template>
  <div class="flex-row caseFileLabels__row pl-6">
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
import { RcDialog, VTextFieldWithValidation } from '@crctech/component-library';
import { ICaseFileLabel } from '@/entities/case-file';
import { MAX_LENGTH_SM } from '@/constants/validations';
import { VForm } from '@/types';

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
    this.copyLabels();
  },

  methods: {
    closeDialog() {
      this.showLabelsDialog = false;
      this.copyLabels();
    },

    copyLabels() {
      this.labels = [];

      for (let x = 0; x < NUM_LABELS; x += 1) {
        if (this.caseFileLabels && this.caseFileLabels[x]) {
          this.labels.push({
            name: this.caseFileLabels[x].name,
            order: x + 1,
          });
        } else {
          this.labels.push({
            name: '',
            order: x + 1,
          });
        }
      }
    },

    async submitAddLabels() {
      const isValid = await (this.$refs.form as VForm).validate();

      if (isValid) {
        this.loading = true;

        try {
          await this.$storage.caseFile.actions.setCaseFileLabels(this.caseFileId, this.labels);
          this.loading = false;
          this.showLabelsDialog = false;
        } catch {
          this.loading = false;
        }
      }
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
