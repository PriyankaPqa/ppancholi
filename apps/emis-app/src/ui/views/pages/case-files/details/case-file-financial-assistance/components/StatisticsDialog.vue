<template>
  <rc-dialog
    :title="$t('caseFile.financialAssistance.statistics.title')"
    :cancel-action-label="$t('common.buttons.close')"
    :show.sync="show"
    content-padding="6"
    content-only-scrolling
    max-width="950"
    min-height="650"
    :fullscreen="$vuetify.breakpoint.smAndDown"
    persistent
    :show-submit="false"
    @close="close"
    @cancel="close">
    <div v-if="summary" class="stats-dg">
      <div class="pb-6">
        <h3 class="pb-2">
          {{ $t('caseFile.financialAssistance.statistics.modalities') }}
        </h3>
        <v-row data-test="paymentModalityCounts_section">
          <v-col v-for="item in summary.paymentModalityCounts" :key="item.modality" cols="6">
            <v-sheet rounded outlined class="pa-3">
              <v-row>
                <v-col cols="10">
                  {{ getTranslatedPaymentModality(item.modality) }}
                </v-col>
                <v-col>
                  {{ item.count }}
                </v-col>
              </v-row>
            </v-sheet>
          </v-col>
        </v-row>
      </div>

      <div>
        <h3 class="pb-2">
          {{ $t('caseFile.financialAssistance.statistics.totals') }}
        </h3>
        <v-row data-test="totals_section">
          <v-col cols="4">
            <v-sheet rounded outlined class="pa-3">
              <div>
                {{ $t('caseFile.financialAssistance.statistics.unapproved') }}
              </div>
              <div class="summaryAmount">
                {{ $formatCurrency(summary.totalAmountUnapproved, true) }}
              </div>
            </v-sheet>
          </v-col>
          <v-col cols="4">
            <v-sheet rounded outlined class="pa-3">
              <div>
                {{ $t('caseFile.financialAssistance.statistics.committed') }}
              </div>
              <div class="summaryAmount">
                {{ $formatCurrency(summary.totalAmountCommitted, true) }}
              </div>
            </v-sheet>
          </v-col>
          <v-col cols="4">
            <v-sheet rounded outlined class="pa-3">
              <div>
                {{ $t('caseFile.financialAssistance.statistics.completed') }}
              </div>
              <div cols="12" class="summaryAmount">
                {{ $formatCurrency(summary.totalAmountCompleted, true) }}
              </div>
            </v-sheet>
          </v-col>
          <v-col cols="12">
            <v-sheet rounded outlined class="pa-3">
              <div>
                {{ $t('caseFile.financialAssistance.statistics.grandTotal') }}
              </div>
              <div cols="12" class="summaryAmount">
                {{ $formatCurrency(summary.grandTotalAmount, true) }}
              </div>
            </v-sheet>
          </v-col>
        </v-row>
      </div>
    </div>
  </rc-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcDialog } from '@libs/component-lib/components';
import { PaymentsSummary } from '@libs/entities-lib/financial-assistance-payment';
import { EPaymentModalities } from '@libs/entities-lib/program';

export default Vue.extend({
  name: 'StatisticsDialog',

  components: {
    RcDialog,
  },

  props: {
    show: {
      type: Boolean,
      required: true,
    },
    caseFileId: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      summary: null as PaymentsSummary,
    };
  },

  async created() {
    this.summary = await this.$services.financialAssistancePaymentsService.getPaymentSummary(this.caseFileId);
  },

  methods: {
    getTranslatedPaymentModality(modality: EPaymentModalities) {
      return this.$t(`enums.PaymentModality.${EPaymentModalities[modality]}`);
    },

    close() {
      this.$emit('update:show', false);
    },
  },
});

</script>
<style lang="scss" scoped>
  .stats-dg {
    font-weight: bold;

    .v-sheet {
      height: 100%;
    }
  }

  .summaryAmount {
    font-size: 250%;
  }
</style>
