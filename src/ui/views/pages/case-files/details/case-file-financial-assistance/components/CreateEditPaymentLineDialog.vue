<template>
  <ValidationObserver ref="form" v-slot="{ failed }" slim>
    <rc-dialog
      :title="$t('caseFile.financialAssistance.addNewPaymentLine')"
      :show.sync="show"
      :cancel-action-label="$t('common.buttons.cancel')"
      :submit-action-label="$t('common.apply')"
      :submit-button-disabled="failed"

      :persistent="true"
      data-test="payment_title"
      :tooltip-label="$t('common.tooltip_label')"
      fullscreen
      @cancel="$emit('cancelChange')"
      @close="$emit('cancelChange')"
      @submit="onSubmit">
      <v-row justify="center" class="pa-0">
        <v-col cols="8">
          <v-row>
            <span class="rc-body16 fw-bold pa-3">
              {{ $t('caseFile.financialAssistance.paymentLineDetails.title') }}
            </span>
          </v-row>
          <v-row>
            <v-col cols="6">
              <v-autocomplete-with-validation
                v-model="currentPaymentLine.mainCategoryId"
                :label="`${$t('financialAssistance.nestedTable.headers.item')} *`"
                :item-text="(item) => item.mainCategory ? $m(item.mainCategory.name) : ''"
                :item-value="(item) => item.mainCategory ? item.mainCategory.id : null"
                :items="items"
                :rules="rules.item"
                data-test="payment_item"
                @change="resetSubCategory" />
            </v-col>
            <v-col cols="6">
              <v-autocomplete-with-validation
                v-model="currentPaymentLine.subCategoryId"
                :label="`${$t('financialAssistance.nestedTable.headers.subItem')} *`"
                :item-text="(item) => item.subCategory ? $m(item.subCategory.name) : ''"
                :item-value="(item) => item.subCategory ? item.subCategory.id : null"
                :items="subItems"
                :disabled="!currentPaymentLine.mainCategoryId"
                :rules="rules.subitem"
                data-test="payment_subItem"
                @change="resetDocuments" />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="6">
              <v-select-with-validation
                v-model="paymentGroup.groupingInformation.modality"
                :items="paymentModalities"
                :rules="rules.modalities"
                :label="`${$t('caseFile.financialAssistance.paymentModality')} *`"
                data-test="payment_modalities" />
            </v-col>
            <v-col cols="6">
              <!-- ToDo : Document requirement validation -->
              <v-checkbox-with-validation
                v-model="currentPaymentLine.documentReceived"
                :disabled="!currentPaymentLine.subCategoryId"
                data-test="checkbox_consent"
                class="rc-body12"
                :label="`${$t('caseFile.financialAssistance.supportingDocuments')} *`" />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="3">
              <v-text-field-with-validation
                v-model="currentPaymentLine.amount"
                data-test="txt_amount"
                autocomplete="nope"
                type="number"
                prefix="$"
                :rules="rules.amount"
                :label="`${$t(showIssuedActualAmounts ? 'caseFile.financialAssistance.issuedAmount': 'caseFile.financialAssistance.amount')} *`" />
            </v-col>
          </v-row>
          <v-row v-if="showIssuedActualAmounts">
            <v-col cols="3">
              <v-text-field-with-validation
                v-model="currentPaymentLine.actualAmount"
                data-test="txt_actualamount"
                autocomplete="nope"
                type="number"
                prefix="$"
                :disabled="!canSetActualAmount"
                :rules="rules.actualAmount"
                :label="`${$t('caseFile.financialAssistance.actualAmount')}`" />
            </v-col>
          </v-row>
          <v-row v-if="showRelatedNumber">
            <v-col cols="6">
              <v-text-field-with-validation
                v-model="currentPaymentLine.relatedNumber"
                data-test="txt_related_number"
                autocomplete="nope"
                :rules="rules.relatedNumber"
                :label="`${$t('caseFile.financialAssistance.relatedNumber')}`" />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </rc-dialog>
  </ValidationObserver>
</template>

<script lang='ts'>
import Vue from 'vue';
import _orderBy from 'lodash/orderBy';
import {
  RcDialog,
  VAutocompleteWithValidation,
  VCheckboxWithValidation,
  VTextFieldWithValidation,
  // VTextAreaWithValidation,
  VSelectWithValidation,
} from '@crctech/component-library';
import { IFinancialAssistanceTableItem, IFinancialAssistanceTableSubItem } from '@/entities/financial-assistance';
import {
  PayeeType,
  FinancialAssistancePaymentGroup,
  IFinancialAssistancePaymentGroup,
  IFinancialAssistancePaymentLine,
  PaymentStatus,
} from '@/entities/financial-assistance-payment';
import { EPaymentModalities, IProgramEntity } from '@/entities/program';
import helpers from '@/ui/helpers';
import { VForm } from '@/types';
// import PaymentTypeHandler from './PaymentTypes/PaymentTypeHandler.vue';
// import { VForm } from '@/types';

export default Vue.extend({
  name: 'CreateEditPaymentLineDialog',

  components: {
    RcDialog,
    VAutocompleteWithValidation,
    VCheckboxWithValidation,
    VTextFieldWithValidation,
    VSelectWithValidation,
    // PaymentTypeHandler,
  },

  props: {
    show: {
      type: Boolean,
      required: true,
    },

    program: {
      type: Object as () => IProgramEntity,
      required: true,
    },

    items: {
      type: Array as () => IFinancialAssistanceTableItem[],
      required: true,
    },

    currentLine: {
      type: Object as () => IFinancialAssistancePaymentLine,
      default: null,
    },

    currentGroup: {
      type: Object as () => IFinancialAssistancePaymentGroup,
      default: null,
    },
  },

  data() {
    return {
      paymentGroup: null as IFinancialAssistancePaymentGroup,
      rules: {
        item: {
          required: true,
        },
        subitem: {
          required: true,
        },
        modalities: {
          required: true,
        },
        amount: {
          required: true,
          min_value: 0.01,
          max_value: 99999999,
        },
        actualAmount: {
          min_value: 0,
          max_value: 99999999,
        },
      },
    };
  },

  computed: {
    paymentModalities(): Array<{ text: string, value: unknown }> {
      const paymentModalities = helpers.enumToTranslatedCollection(EPaymentModalities, 'event.programManagement.paymentModalities')
        .filter((p) => this.program.paymentModalities.find((payment : EPaymentModalities) => payment === p.value));
      return _orderBy(paymentModalities, 'text');
    },

    subItems() : Array<IFinancialAssistanceTableSubItem> {
      return this.items.find((i) => i.mainCategory?.id === this.currentPaymentLine.mainCategoryId)?.subItems;
    },

    currentPaymentLine(): IFinancialAssistancePaymentLine {
      return this.paymentGroup.lines[0];
    },

    showRelatedNumber(): boolean {
      return this.paymentGroup?.groupingInformation?.modality === EPaymentModalities.PrepaidCard
        || this.paymentGroup?.groupingInformation?.modality === EPaymentModalities.GiftCard
        || this.paymentGroup?.groupingInformation?.modality === EPaymentModalities.Voucher
        || this.paymentGroup?.groupingInformation?.modality === EPaymentModalities.Invoice;
    },

    showIssuedActualAmounts(): boolean {
      return this.paymentGroup?.groupingInformation?.modality === EPaymentModalities.Voucher
        || this.paymentGroup?.groupingInformation?.modality === EPaymentModalities.Invoice;
    },

    canSetActualAmount(): boolean {
      return this.paymentGroup?.paymentStatus === PaymentStatus.Completed;
    },
  },

  async created() {
    this.initCreateMode();
  },

  methods: {
    async initCreateMode() {
      const cf = this.$storage.caseFile.getters.get(this.$route.params.id).metadata;
      this.paymentGroup = new FinancialAssistancePaymentGroup();

      this.paymentGroup.lines.push({
        id: this.currentLine?.id,
        mainCategoryId: this.currentLine?.mainCategoryId || null,
        subCategoryId: this.currentLine?.subCategoryId || null,
        documentReceived: this.currentLine?.documentReceived || null,
        amount: this.currentLine?.amount || null,
        actualAmount: this.currentLine?.actualAmount || 0,
        relatedNumber: this.currentLine?.relatedNumber || null,
        careOf: this.currentLine?.careOf || null,
        address: this.currentLine?.address || null,
      });

      this.paymentGroup.groupingInformation = {
        modality: this.currentGroup?.groupingInformation?.modality || null,
        payeeType: this.currentGroup?.groupingInformation?.payeeType || PayeeType.Beneficiary,
        payeeName: `${cf.primaryBeneficiaryFirstName} ${cf.primaryBeneficiaryLastName}`,
      };
    },

    async onSubmit() {
      if (this.currentPaymentLine.amount) {
        this.currentPaymentLine.amount = Number(this.currentPaymentLine.amount);
      }

      const isValid = await (this.$refs.form as VForm).validate();
      if (isValid) {
        this.$emit('submit', this.paymentGroup);
      }
    },

    resetSubCategory() {
      this.currentPaymentLine.subCategoryId = null;
      this.resetDocuments();
    },

    resetDocuments() {
      this.currentPaymentLine.documentReceived = false;
    },
  },
});
</script>

<style>

</style>
