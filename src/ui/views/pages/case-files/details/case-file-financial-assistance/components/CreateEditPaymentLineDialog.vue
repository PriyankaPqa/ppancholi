<template>
  <ValidationObserver ref="form" v-slot="{ failed }" slim>
    <rc-dialog
      v-if="loaded"
      :title="currentLine ? $t('caseFile.financialAssistance.editPaymentLine'): $t('caseFile.financialAssistance.addNewPaymentLine')"
      :show.sync="show"
      :cancel-action-label="$t('common.buttons.cancel')"
      :submit-action-label="currentLine ? $t('common.buttons.save'): $t('common.buttons.add')"
      :submit-button-disabled="failed"

      :persistent="true"
      data-test="payment_title"
      :tooltip-label="$t('common.tooltip_label')"
      fullscreen
      @cancel="onCancel"
      @close="onCancel"
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
                :label="`${$t(showIssuedActualAmounts(paymentGroup) ? 'caseFile.financialAssistance.issuedAmount'
                  : 'caseFile.financialAssistance.amount')} *`" />
            </v-col>
          </v-row>
          <v-row v-if="showIssuedActualAmounts(paymentGroup)">
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
          <v-row v-if="showRelatedNumber(paymentGroup)">
            <v-col cols="6">
              <v-text-field-with-validation
                v-model="currentPaymentLine.relatedNumber"
                data-test="txt_related_number"
                autocomplete="nope"
                :rules="rules.relatedNumber"
                :label="`${$t('caseFile.financialAssistance.relatedNumber')}`" />
            </v-col>
          </v-row>

          <div v-if="showPayee(paymentGroup)" data-test="payeeSection">
            <v-row>
              <v-col cols="12">
                <span class="rc-body16 fw-bold">
                  {{ $t('caseFile.financialAssistance.payee') }}
                </span>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-select-with-validation
                  v-model="paymentGroup.groupingInformation.payeeType"
                  :items="payeeTypes"
                  :label="`${$t('caseFile.financialAssistance.payee.paymentMadeTo')} *`"
                  data-test="payment_payeetypes"
                  @change="resetPayeeInformation" />
              </v-col>
              <v-col cols="6">
                <v-text-field-with-validation
                  v-model="paymentGroup.groupingInformation.payeeName"
                  data-test="payment_payeename"
                  autocomplete="nope"
                  :rules="rules.payeeName"
                  :label="`${$t('caseFile.financialAssistance.payee.payeeName')} *`" />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-text-field-with-validation
                  v-model="currentPaymentLine.careOf"
                  data-test="payment_careof"
                  autocomplete="nope"
                  :rules="rules.careOf"
                  :label="`${$t('caseFile.financialAssistance.payee.careOf')}`" />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <address-form
                  :key="paymentGroup.groupingInformation.payeeType"
                  :api-key="apiKey"
                  :canadian-provinces-items="canadianProvincesItems"
                  prefix-data-test="address"
                  :home-address="address"
                  @change="setAddress($event)" />
              </v-col>
            </v-row>
          </div>
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
  VSelectWithValidation,
} from '@crctech/component-library';
import { AddressForm } from '@crctech/registration-lib';
import libHelpers from '@crctech/registration-lib/src/ui/helpers';
import { Address } from '@crctech/registration-lib/src/entities/value-objects/address';
import { IFinancialAssistanceTableItem, IFinancialAssistanceTableSubItem } from '@/entities/financial-assistance';
import {
  PayeeType,
  FinancialAssistancePaymentGroup,
  IFinancialAssistancePaymentGroup,
  IFinancialAssistancePaymentLine,
  FinancialAssistancePaymentLine,
  PaymentStatus,
} from '@/entities/financial-assistance-payment';
import { EPaymentModalities, IProgramEntity } from '@/entities/program';
import helpers from '@/ui/helpers';
import { IAddress, VForm } from '@/types';
import { localStorageKeys } from '@/constants/localStorage';
import { MAX_LENGTH_MD } from '@/constants/validations';

export default Vue.extend({
  name: 'CreateEditPaymentLineDialog',

  components: {
    RcDialog,
    VAutocompleteWithValidation,
    VCheckboxWithValidation,
    VTextFieldWithValidation,
    VSelectWithValidation,
    AddressForm,
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
      address: new Address(),
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
        relatedNumber: {
          max: MAX_LENGTH_MD,
        },
        careOf: {
          max: MAX_LENGTH_MD,
        },
        payeeName: {
          required: true,
          max: MAX_LENGTH_MD,
        },
      },
      payeeTypes: helpers.enumToTranslatedCollection(PayeeType, 'enums.payeeType'),
      loaded: false,
      defaultBeneficiaryData: {
        address: null as IAddress,
        name: '',
      },
      showRelatedNumber: FinancialAssistancePaymentGroup.showRelatedNumber,
      showIssuedActualAmounts: FinancialAssistancePaymentGroup.showIssuedActualAmounts,
      showPayee: FinancialAssistancePaymentGroup.showPayee,
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

    apiKey(): string {
      return localStorage.getItem(localStorageKeys.googleMapsAPIKey.name)
        ? localStorage.getItem(localStorageKeys.googleMapsAPIKey.name)
        : process.env.VUE_APP_GOOGLE_API_KEY;
    },

    canadianProvincesItems(): Record<string, unknown>[] {
      return libHelpers.getCanadianProvincesWithoutOther(this.$i18n);
    },

    canSetActualAmount(): boolean {
      return this.paymentGroup?.paymentStatus === PaymentStatus.Completed;
    },
  },

  async created() {
    await this.initCreateMode();
    this.loaded = true;
  },

  methods: {
    async initCreateMode() {
      const cf = this.$storage.caseFile.getters.get(this.$route.params.id);
      const household = await this.$storage.household.actions.fetch(cf.entity.householdId);
      this.defaultBeneficiaryData = {
        name: `${cf.metadata.primaryBeneficiaryFirstName} ${cf.metadata.primaryBeneficiaryLastName}`,
        address: household?.entity?.address?.address,
      };
      this.paymentGroup = new FinancialAssistancePaymentGroup();

      this.paymentGroup.lines.push(new FinancialAssistancePaymentLine(this.currentLine));

      this.paymentGroup.groupingInformation = {
        modality: this.currentGroup?.groupingInformation?.modality || null,
        payeeType: this.currentGroup?.groupingInformation?.payeeType || PayeeType.Beneficiary,
        payeeName: this.currentGroup?.groupingInformation?.payeeName
          || this.defaultBeneficiaryData.name,
      };

      this.address = new Address(this.currentLine?.address || this.defaultBeneficiaryData.address);
    },

    setAddress(address: IAddress) {
      this.address = new Address(address);
    },

    async onSubmit() {
      if (this.showPayee(this.paymentGroup)) {
        this.currentPaymentLine.address = this.address;
      } else {
        // reset non-editable fields if they had been changed
        this.currentPaymentLine.address = null;
        this.currentPaymentLine.careOf = null;
        this.paymentGroup.groupingInformation.payeeType = PayeeType.Beneficiary;
        this.paymentGroup.groupingInformation.payeeName = this.defaultBeneficiaryData.name;
      }

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

    resetPayeeInformation() {
      if (this.paymentGroup.groupingInformation.payeeType === PayeeType.Beneficiary) {
        this.paymentGroup.groupingInformation.payeeName = this.defaultBeneficiaryData.name;
        this.address = new Address(this.defaultBeneficiaryData.address);
      } else {
        this.paymentGroup.groupingInformation.payeeName = '';
        this.address = new Address();
      }
    },

    async onCancel() {
      if (await helpers.confirmBeforeLeaving(this, (this.$refs.form as VForm).flags.dirty)) this.$emit('cancelChange');
    },
  },
});
</script>

<style>

</style>
