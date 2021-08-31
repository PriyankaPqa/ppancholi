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
                data-test="payment_modalities"
                @change="updateForm" />
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
                data-test="reason_specified_other"
                autocomplete="nope"
                type="number"
                prefix="$"
                :rules="rules.amount"
                :label="`${$t('caseFile.financialAssistance.amount')} *`" />
            </v-col>
          </v-row>
          <v-row>
            <v-col v-if="paymentGroup.modality" cols="12">
              <!-- <payment-type-handler :payment-type="paymentLine.modality" /> -->
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
} from '@/entities/financial-assistance-payment';
import { EPaymentModalities, IProgramEntity } from '@/entities/program';
import helpers from '@/ui/helpers';
import { VForm } from '@/types';
// import PaymentTypeHandler from './PaymentTypes/PaymentTypeHandler.vue';
// import { VForm } from '@/types';

export default Vue.extend({
  name: 'CaseFileFinancialAssistancePaymentLineDialog',

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
  },

  async created() {
    this.initCreateMode();
  },

  methods: {
    async initCreateMode() {
      const cf = this.$storage.caseFile.getters.get(this.$route.params.id).metadata;
      this.paymentGroup = new FinancialAssistancePaymentGroup();

      this.paymentGroup.lines.push({
        mainCategoryId: null,
        subCategoryId: null,
        documentReceived: null,
        amount: null,
        actualAmount: 0,
        relatedNumber: null,
        careOf: null,
        address: null,
      });

      this.paymentGroup.groupingInformation = {
        modality: null,
        payeeType: PayeeType.Beneficiary,
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

    updateForm() {
      // ToDO : Adapt form depending on the payment modalities
    },
  },
});
</script>

<style>

</style>
