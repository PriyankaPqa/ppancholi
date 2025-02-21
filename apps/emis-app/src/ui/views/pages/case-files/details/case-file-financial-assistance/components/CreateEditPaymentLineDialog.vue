<template>
  <validation-observer ref="form" v-slot="{ failed }" slim>
    <rc-dialog
      v-if="loaded"
      :title="currentLine ? $t('caseFile.financialAssistance.editPaymentLine') : $t('caseFile.financialAssistance.addNewPaymentLine')"
      :show.sync="show"
      :cancel-action-label="$t('common.buttons.cancel')"
      :submit-action-label="currentLine ? $t('common.buttons.save') : $t('common.buttons.add')"
      :submit-button-disabled="failed"
      :loading="submittingPaymentLine"
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
                :disabled="paymentApproved || paymentPending"
                :items="activeItems"
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
                :disabled="!currentPaymentLine.mainCategoryId || paymentApproved || paymentPending"
                :rules="rules.subitem"
                data-test="payment_subItem"
                @change="categorySelected" />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="6">
              <v-select-with-validation
                v-model="paymentGroup.groupingInformation.modality"
                :items="paymentModalities"
                :disabled="paymentApproved || paymentPending"
                :rules="rules.modalities"
                :label="`${$t('caseFile.financialAssistance.paymentModality')} *`"
                data-test="payment_modalities" />
            </v-col>
            <v-col v-if="subItem && subItem.documentationRequired" cols="6">
              <v-checkbox-with-validation
                v-model="currentPaymentLine.documentReceived"
                :rules="rules.documentReceived"
                :disabled="!currentPaymentLine.subCategoryId || paymentApproved || paymentPending"
                data-test="checkbox_documentReceived"
                class="rc-body12"
                :label="`${$t('caseFile.financialAssistance.supportingDocuments')} *`" />
            </v-col>
          </v-row>
          <div v-if="paymentGroup.groupingInformation.modality === EPaymentModalities.ETransfer" class="d-flex">
            <message-box
              v-if="defaultBeneficiaryData.email"
              icon="mdi-information"
              small-icon
              :message="`${$t('caseFile.financialAssistance.ETransfer.email')}: ${defaultBeneficiaryData.email}`"
              :styles="{
                'background-color': 'var(--v-grey-lighten4)',
                color: 'var(--v-grey-darken4)',
              }"
              icon-color="black"
              data-test="payment_eTransfer_email" />
            <message-box
              v-else
              icon="mdi-information-outline"
              small-icon
              :message="$t('caseFile.financialAssistance.ETransfer.noEmailNotification.individual')"
              :styles="{
                'background-color': 'var(--v-status_yellow_pale-base)',
                color: 'var(--v-grey-darken4)',
              }"
              data-test="payment_eTransfer_noEmail" />
          </div>
          <v-row>
            <v-col cols="3">
              <v-text-field-with-validation
                v-model="currentPaymentLine.amount"
                data-test="txt_amount"
                show-all-decimal
                autocomplete="off"
                type="number"
                prefix="$"
                :disabled="fixedAmount || paymentApproved || paymentPending"
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
                show-all-decimal
                autocomplete="off"
                type="number"
                prefix="$"
                :disabled="!paymentApproved"
                :rules="rules.actualAmount"
                :label="`${$t('caseFile.financialAssistance.actualAmount')}`" />
            </v-col>
          </v-row>
          <v-row v-if="showRelatedNumber(paymentGroup)">
            <v-col cols="6">
              <v-text-field-with-validation
                v-model="currentPaymentLine.relatedNumber"
                data-test="txt_related_number"
                autocomplete="off"
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
                  :disabled="paymentApproved || paymentPending"
                  data-test="payment_payeetypes"
                  @change="resetPayeeInformation" />
              </v-col>
              <v-col cols="6">
                <v-text-field-with-validation
                  v-model="paymentGroup.groupingInformation.payeeName"
                  data-test="payment_payeename"
                  autocomplete="off"
                  :rules="rules.payeeName"
                  :disabled="paymentApproved || paymentPending"
                  :label="`${$t('caseFile.financialAssistance.payee.payeeName')} *`" />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-text-field-with-validation
                  v-model="currentPaymentLine.careOf"
                  data-test="payment_careof"
                  autocomplete="off"
                  :rules="rules.careOf"
                  :disabled="paymentApproved || paymentPending"
                  :label="`${$t('caseFile.financialAssistance.payee.careOf')}`" />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <address-form
                  :key="paymentGroup.groupingInformation.payeeType"
                  :api-key="apiKey"
                  :canadian-provinces-items="canadianProvincesItems"
                  :disable-autocomplete="!enableAutocomplete"
                  prefix-data-test="address"
                  :home-address="address"
                  is-edit-mode
                  @change="setAddress($event)" />
              </v-col>
            </v-row>
          </div>
        </v-col>
      </v-row>
    </rc-dialog>
  </validation-observer>
</template>

<script lang='ts'>
import mixins from 'vue-typed-mixins';
import _orderBy from 'lodash/orderBy';
import {
  RcDialog,
  VAutocompleteWithValidation,
  VCheckboxWithValidation,
  VTextFieldWithValidation,
  VSelectWithValidation,
  MessageBox,
} from '@libs/component-lib/components';
import AddressForm from '@libs/registration-lib/components/forms/AddressForm.vue';
import libHelpers from '@libs/entities-lib/helpers';
import { Address, IAddress } from '@libs/entities-lib/value-objects/address';
import { EFinancialAmountModes, IFinancialAssistanceTableItem, IFinancialAssistanceTableSubItem } from '@libs/entities-lib/financial-assistance';
import {
  PayeeType,
  FinancialAssistancePaymentGroup,
  IFinancialAssistancePaymentGroup,
  IFinancialAssistancePaymentLine,
  FinancialAssistancePaymentLine,
  ApprovalStatus,
  IFinancialAssistancePaymentEntity,
} from '@libs/entities-lib/financial-assistance-payment';
import { EPaymentModalities, IProgramEntity } from '@libs/entities-lib/program';
import helpers from '@/ui/helpers/helpers';
import { ECanadaProvinces, VForm, Status } from '@libs/shared-lib/types';
import { localStorageKeys } from '@/constants/localStorage';
import { MAX_LENGTH_MD } from '@libs/shared-lib/constants/validations';

import { IAddressData } from '@libs/entities-lib/household-create';
import caseFileDetail from '../../caseFileDetail';

export default mixins(caseFileDetail).extend({
  name: 'CreateEditPaymentLineDialog',

  components: {
    RcDialog,
    VAutocompleteWithValidation,
    VCheckboxWithValidation,
    VTextFieldWithValidation,
    VSelectWithValidation,
    AddressForm,
    MessageBox,
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

    financialAssistance: {
      type: Object as () => IFinancialAssistancePaymentEntity,
      required: true,
    },

    submittingPaymentLine: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      paymentGroup: null as IFinancialAssistancePaymentGroup,
      address: new Address(),
      payeeTypes: helpers.enumToTranslatedCollection(PayeeType, 'enums.payeeType.new'),
      loaded: false,
      defaultBeneficiaryData: {
        address: null as IAddressData,
        name: '',
        email: '',
      },
      showRelatedNumber: FinancialAssistancePaymentGroup.showRelatedNumber,
      showIssuedActualAmounts: FinancialAssistancePaymentGroup.showIssuedActualAmounts,
      showPayee: FinancialAssistancePaymentGroup.showPayee,
      fixedAmount: false,
      EPaymentModalities,
    };
  },

  computed: {
    paymentModalities(): Array<{ text: string, value: unknown }> {
      const paymentModalities = helpers.enumToTranslatedCollection(EPaymentModalities, 'enums.PaymentModality')
        .filter((p) => this.program.paymentModalities.find((payment : EPaymentModalities) => payment === p.value)
          || this.paymentGroup.groupingInformation.modality === p.value);
      return _orderBy(paymentModalities, 'text');
    },

    modalityError() : string {
      if (this.paymentGroup.groupingInformation.modality === EPaymentModalities.ETransfer && !this.defaultBeneficiaryData.email) {
        return 'caseFile.financialAssistance.ETransfer.noEmail.individual';
      }
      return null;
    },

    amountError() : string {
      if (this.paymentGroup.groupingInformation.modality === EPaymentModalities.ETransfer) {
        let total = FinancialAssistancePaymentGroup.total(
          this.financialAssistance.groups.filter((g) => g.groupingInformation.modality === EPaymentModalities.ETransfer),
        );
        // we remove the currentLine if it was also an etransfer - we are editing it
        if (this.currentGroup?.groupingInformation?.modality === EPaymentModalities.ETransfer) {
          total -= this.currentLine.amount;
        }
        return total + Number(this.currentPaymentLine.amount) > 10000
          ? this.$t('caseFile.financialAssistance.ETransfer.moreThanX', { maximumAmount: 10000 }) as string : null;
      }
      return null;
    },

    actualAmountError() : string {
      if (this.paymentGroup.groupingInformation.modality === EPaymentModalities.Voucher
        && Number(this.currentPaymentLine.actualAmount) > Number(this.currentPaymentLine.amount)) {
        return 'errors.actual-amount-must-be-less-than-or-equal-to-voucher-amount';
      }
      return null;
    },

    activeItems(): IFinancialAssistanceTableItem[] {
      return this.items.filter((i) => i.status === Status.Active || i.mainCategory?.id === this.currentPaymentLine.mainCategoryId);
    },

    subItems() : Array<IFinancialAssistanceTableSubItem> {
      const sub = this.activeItems.find((i) => i.mainCategory?.id === this.currentPaymentLine.mainCategoryId)?.subItems || [];
      return sub.filter((s) => s.status === Status.Active || s.subCategory.id === this.currentPaymentLine.subCategoryId);
    },

    subItem() : IFinancialAssistanceTableSubItem {
      return this.subItems?.find((s) => s.subCategory.id === this.currentPaymentLine.subCategoryId);
    },

    currentPaymentLine(): IFinancialAssistancePaymentLine {
      return this.paymentGroup.lines[0];
    },

    apiKey(): string {
      return localStorage.getItem(localStorageKeys.googleMapsAPIKey.name)
        ? localStorage.getItem(localStorageKeys.googleMapsAPIKey.name)
        : process.env.VITE_GOOGLE_API_KEY;
    },

    canadianProvincesItems(): Record<string, unknown>[] {
      return libHelpers.getCanadianProvincesWithoutOther(this.$i18n);
    },

    paymentApproved(): boolean {
      return this.financialAssistance.approvalStatus === ApprovalStatus.Approved;
    },

    paymentPending(): boolean {
      return this.financialAssistance.approvalStatus === ApprovalStatus.Pending;
    },

    rules(): Record<string, unknown> {
      return {
        item: {
          required: true,
        },
        subitem: {
          required: true,
        },
        modalities: {
          required: true,
          customValidator: { isValid: !this.modalityError },
        },
        documentReceived: {
          required: { allowFalse: false },
        },
        amount: {
          required: true,
          min_value: 0.01,
          max_value: 99999999,
          customValidator: { isValid: !this.amountError, messageKey: this.amountError },
        },
        actualAmount: {
          min_value: 0,
          max_value: 99999999,
          customValidator: { isValid: !this.actualAmountError, messageKey: this.actualAmountError },
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
      };
    },

    enableAutocomplete(): boolean {
      return this.$hasFeature(this.$featureKeys.AddressAutoFill);
    },
  },

  async created() {
    await this.initCreateMode();
    this.categorySelected(false);
    this.loaded = true;
  },

  methods: {
    async initCreateMode() {
      this.defaultBeneficiaryData = {
        name: `${this.primaryMember?.identitySet.firstName} ${this.primaryMember?.identitySet.lastName}`,
        address: this.household?.address?.address,
        email: this.primaryMember?.contactInformation.email,
      };
      this.paymentGroup = new FinancialAssistancePaymentGroup();

      this.paymentGroup.lines.push(new FinancialAssistancePaymentLine(this.currentLine));

      this.paymentGroup.groupingInformation = {
        modality: this.currentGroup?.groupingInformation?.modality || null,
        payeeType: this.currentGroup?.groupingInformation?.payeeType || PayeeType.Individual,
        payeeName: this.currentGroup?.groupingInformation?.payeeName
          || this.defaultBeneficiaryData.name,
      };

      this.address = new Address(this.currentLine?.address || this.defaultBeneficiaryData.address);
    },

    setAddress(address: IAddress) {
      this.address = new Address(address);
    },

    async onSubmit() {
      if (!this.paymentApproved && !this.paymentPending) {
        if (this.showPayee(this.paymentGroup)) {
          this.currentPaymentLine.address = this.address;
          this.currentPaymentLine.address.province = this.address.province ?? ECanadaProvinces.OT;
        } else {
          // reset non-editable fields if they had been changed
          this.currentPaymentLine.address = null;
          this.currentPaymentLine.careOf = null;
          this.paymentGroup.groupingInformation.payeeType = PayeeType.Individual;
          this.paymentGroup.groupingInformation.payeeName = this.defaultBeneficiaryData.name;
        }

        if (this.currentPaymentLine.amount) {
          this.currentPaymentLine.amount = Number(this.currentPaymentLine.amount);
        }
      }

      const isValid = await (this.$refs.form as VForm).validate();
      if (isValid) {
        this.$emit('submit', this.paymentGroup);
      }
    },

    resetSubCategory() {
      this.currentPaymentLine.subCategoryId = null;
      this.categorySelected();
    },

    categorySelected(resetRelatedFields = true) {
      if (resetRelatedFields) {
        this.currentPaymentLine.documentReceived = false;
      }
      if (resetRelatedFields) {
        this.currentPaymentLine.amount = null;
      }

      this.fixedAmount = this.subItem?.amountType === EFinancialAmountModes.Fixed;
      if (this.fixedAmount && this.currentPaymentLine?.amount == null) {
        this.currentPaymentLine.amount = this.subItem?.maximumAmount;
      }
    },

    resetPayeeInformation() {
      if (this.paymentGroup.groupingInformation.payeeType === PayeeType.Individual) {
        this.paymentGroup.groupingInformation.payeeName = this.defaultBeneficiaryData.name;
        this.address = new Address(this.defaultBeneficiaryData.address);
      } else {
        this.paymentGroup.groupingInformation.payeeName = '';
        this.address = new Address();
      }
    },

    async onCancel() {
      if (await helpers.confirmBeforeLeaving(this, (this.$refs.form as VForm).flags.dirty)) {
        this.$emit('cancelChange');
      }
    },

  },
});
</script>

<style>

</style>
