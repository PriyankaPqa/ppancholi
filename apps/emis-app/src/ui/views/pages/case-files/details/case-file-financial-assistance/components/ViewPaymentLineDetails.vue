<template>
  <rc-page-content
    v-if="!loading"
    :title=" $t('caseFile.financialAssistance.paymentLineDetails.title')">
    <v-row class="justify-center mt-10">
      <v-col cols="12" lg="7">
        <div class="pb-4 d-flex justify-space-between" data-test="detail_modality">
          <h3>
            {{ $t(`enums.PaymentModality.${EPaymentModalities[paymentGroup.groupingInformation.modality]}`) }}
          </h3>
        </div>
        <div class="pb-4 d-flex justify-space-between" data-test="detail_title">
          <h2>
            {{ title }}
          </h2>
        </div>
        <v-sheet rounded outlined>
          <v-simple-table>
            <tbody>
              <tr>
                <td class="label fw-bold">
                  {{ $t("financialAssistance.nestedTable.headers.item") }}
                </td>
                <td class="data" data-test="detail_item">
                  {{ title.split('>')[0] }}
                </td>
              </tr>
              <tr>
                <td class="label fw-bold">
                  {{ $t("financialAssistance.nestedTable.headers.subItem") }}
                </td>
                <td class="data" data-test="detail_subitem">
                  {{ title.split('>')[1] }}
                </td>
              </tr>
              <tr v-if="subItem && subItem.documentationRequired" data-test="doc_required">
                <td class="label fw-bold">
                  {{ $t("caseFile.financialAssistance.paymentLineDetails.supportingDocuments") }}
                </td>
                <td class="data">
                  <v-icon size="18" :class="[paymentLine.documentReceived ? 'status_success--text' : 'status_error--text']">
                    {{ paymentLine.documentReceived ? 'mdi-checkbox-marked-circle' : 'mdi-alert-circle' }}
                  </v-icon>
                  {{ paymentLine.documentReceived ? $t("caseFile.financialAssistance.paymentLineDetails.supportingDocuments.received")
                    : $t("caseFile.financialAssistance.paymentLineDetails.supportingDocuments.notReceived") }}
                </td>
              </tr>
              <tr v-if="paymentGroup.groupingInformation.modality === EPaymentModalities.ETransfer" data-test="eTransfer-email">
                <td class="label fw-bold">
                  {{ $t('caseFile.financialAssistance.ETransfer.email') }}
                </td>
                <td class="data" data-test="eTransfer-email-data">
                  {{ caseFileMetadata.primaryBeneficiary.contactInformation.email }}
                </td>
              </tr>
              <tr v-if="showRelatedNumber(paymentGroup)" data-test="related_number">
                <td class="label fw-bold">
                  {{ $t("caseFile.financialAssistance.relatedNumber") }}
                </td>
                <td class="data">
                  {{ (paymentLine.relatedNumber || '—') }}
                </td>
              </tr>
              <tr :class="{ 'grey-container': !showIssuedActualAmounts(paymentGroup) }">
                <td class="label fw-bold">
                  {{ $t(showIssuedActualAmounts(paymentGroup) ? 'caseFile.financialAssistance.issuedAmount' : 'caseFile.financialAssistance.amount') }}
                </td>
                <td class="data">
                  <v-tooltip v-if="showTooltip" v-bind="$attrs" bottom>
                    <template #activator="{ on, attrs }">
                      <v-icon v-bind="attrs" class="mr-2" color="secondary" small data-test="paymentLineItem__tooltip" v-on="on">
                        mdi-alert-circle-outline
                      </v-icon>
                    </template>

                    <span>
                      {{ $t('caseFile.financialAssistance.amountExceeded', { maximumAmount: subItem.maximumAmount }) }}
                    </span>
                  </v-tooltip>
                  {{ $formatCurrency(paymentLine.amount) }}
                </td>
              </tr>
              <tr v-if="showIssuedActualAmounts(paymentGroup)" class="grey-container">
                <td class="label fw-bold">
                  {{ $t('caseFile.financialAssistance.actualAmount') }}
                </td>
                <td class="data">
                  {{ paymentLine.actualAmount !== null ? $formatCurrency(paymentLine.actualAmount) : '—' }}
                </td>
              </tr>
            </tbody>
          </v-simple-table>
        </v-sheet>
      </v-col>
    </v-row>
    <v-row v-if="showPayee(paymentGroup)" class="justify-center mt-10" data-test="payeeSection">
      <v-col cols="12" lg="7">
        <div class="pb-4 d-flex justify-space-between">
          <h3>
            {{ $t('caseFile.financialAssistance.payee') }}
          </h3>
        </div>
        <v-sheet rounded outlined>
          <v-simple-table>
            <tbody>
              <tr>
                <td class="label fw-bold">
                  {{ $t("caseFile.financialAssistance.payee.paymentMadeTo") }}
                </td>
                <td class="data">
                  {{ $t(`enums.payeeType.${PayeeType[paymentGroup.groupingInformation.payeeType]}`) }}
                </td>
              </tr>
              <tr>
                <td class="label fw-bold">
                  {{ $t('caseFile.financialAssistance.payee.payeeName') }}
                </td>
                <td class="data">
                  {{ paymentGroup.groupingInformation.payeeName }}
                </td>
              </tr>
              <tr>
                <td class="label fw-bold">
                  {{ $t('caseFile.financialAssistance.payee.careOf') }}
                </td>
                <td class="data">
                  {{ paymentLine.careOf }}
                </td>
              </tr>
              <tr>
                <td class="label fw-bold">
                  {{ $t('caseFile.financialAssistance.payee.payeeAddressSmall') }}
                </td>
                <td class="data">
                  {{ addressLines }}
                </td>
              </tr>
            </tbody>
          </v-simple-table>
        </v-sheet>
      </v-col>
    </v-row>
    <template slot="actions">
      <v-btn
        color="primary"
        data-test="back_btn"
        @click="$router.back()">
        {{ $t('financialAssistance.back_to_details') }}
      </v-btn>
    </template>
  </rc-page-content>
</template>

<script lang="ts">
import mixins from 'vue-typed-mixins';
import { RcPageContent } from '@libs/component-lib/components';
import {
  FinancialAssistancePaymentGroup,
  IFinancialAssistancePaymentEntity,
  IFinancialAssistancePaymentGroup,
  IFinancialAssistancePaymentLine,
  PayeeType,
} from '@libs/entities-lib/financial-assistance-payment';
import { IFinancialAssistanceTableItem, IFinancialAssistanceTableSubItem } from '@libs/entities-lib/financial-assistance';
import { EPaymentModalities, IProgramEntity } from '@libs/entities-lib/program/program.types';
import householdHelpers from '@/ui/helpers/household';
import { useProgramStore } from '@/pinia/program/program';
import { useFinancialAssistancePaymentStore } from '@/pinia/financial-assistance-payment/financial-assistance-payment';
import caseFileDetail from '../../caseFileDetail';

export default mixins(caseFileDetail).extend({
  name: 'ViewPaymentLineDetails',

  components: {
    RcPageContent,
  },

  props: {
    financialAssistancePaymentLineId: {
      type: String,
      required: true,
    },

    financialAssistancePaymentId: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      loading: false,
      showRelatedNumber: FinancialAssistancePaymentGroup.showRelatedNumber,
      showIssuedActualAmounts: FinancialAssistancePaymentGroup.showIssuedActualAmounts,
      showPayee: FinancialAssistancePaymentGroup.showPayee,
      PayeeType,
      EPaymentModalities,
    };
  },

  computed: {
    financialAssistance() : IFinancialAssistancePaymentEntity {
      return useFinancialAssistancePaymentStore().getById(this.financialAssistancePaymentId);
    },

    paymentGroup() : IFinancialAssistancePaymentGroup {
      if (!this.financialAssistance) {
        return null;
      }
      return this.financialAssistance.groups.filter((g) => g.lines.filter((l) => l.id === this.financialAssistancePaymentLineId)[0])[0];
    },

    paymentLine() : IFinancialAssistancePaymentLine {
      if (!this.paymentGroup) {
        return null;
      }
      return this.paymentGroup.lines.filter((l) => l.id === this.financialAssistancePaymentLineId)[0];
    },

    items(): Array<IFinancialAssistanceTableItem> {
      return this.$storage.financialAssistance.getters.items();
    },

    mainItem(): IFinancialAssistanceTableItem {
      return this.items.find((i) => i.mainCategory.id === this.paymentLine.mainCategoryId);
    },

    subItem(): IFinancialAssistanceTableSubItem {
      if (!this.mainItem) {
        return null;
      }
      return this.mainItem.subItems.find((s) => s.subCategory.id === this.paymentLine.subCategoryId);
    },

    title(): string {
      if (!this.subItem) {
        return '';
      }
      return `${this.$m(this.mainItem.mainCategory.name)} > ${this.$m(this.subItem.subCategory.name)}`;
    },

    addressLines(): string {
      return householdHelpers.getAddressLines(this.paymentLine.address).join(', ');
    },

    showTooltip(): boolean {
      // Validate if we're over limit
      return this.subItem?.maximumAmount && Number(this.paymentLine.amount) > this.subItem?.maximumAmount;
    },
  },

  async created() {
    this.loading = true;
    await useFinancialAssistancePaymentStore().fetch(this.financialAssistancePaymentId);
    await Promise.all([useFinancialAssistancePaymentStore().fetchFinancialAssistanceCategories(),
      this.$storage.financialAssistance.actions.fetch(this.financialAssistance.financialAssistanceTableId)]);

    await this.setFinancialAssistance();
    this.loading = false;
  },

  methods: {
    async setFinancialAssistance() {
      const tableWithMetadata = this.$storage.financialAssistance.getters.get(this.financialAssistance.financialAssistanceTableId);
      const categories = useFinancialAssistancePaymentStore().getFinancialAssistanceCategories(false);
      const program = await useProgramStore().fetch({
        id: tableWithMetadata.entity.programId,
        eventId: this.caseFile.eventId,
      }) as IProgramEntity;
      this.$storage.financialAssistance.mutations.setFinancialAssistance(tableWithMetadata, categories, program, false);
    },
  },
});
</script>
