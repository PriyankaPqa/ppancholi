<template>
  <div class="paymentLine__container flex-column">
    <div class="flex-column px-4 py-4">
      <div class="flex-row ">
        <span
          v-if="paymentLine.id"
          data-test="paymentLineItem__title"
          class="rc-link16 fw-bold"
          :class="{ 'error--text': isInactive }"
          @keypress.enter="linkToPaymentLineDetails"
          @click="linkToPaymentLineDetails">
          {{ title }}
        </span>

        <span v-else class="rc-body16 fw-bold" data-test="paymentLineItem__title">
          {{ title }}
        </span>

        <div class="flex-grow-1" />

        <v-tooltip v-if="showTooltip" v-bind="$attrs" bottom>
          <template #activator="{ on, attrs }">
            <v-icon v-bind="attrs" class="mr-2" color="secondary" small data-test="paymentLineItem__tooltip" v-on="on">
              mdi-alert-circle-outline
            </v-icon>
          </template>

          <span data-test="paymentLineItem__amount-exceeded">
            {{ $t('caseFile.financialAssistance.amountExceeded', { maximumAmount: subItem.maximumAmount }) }}
          </span>
        </v-tooltip>

        <v-btn
          v-if="showCancelButton"
          class="mr-3"
          small
          :aria-label="$t('caseFile.financialAssistance.cancelPaymentDialog.button')"
          data-test="paymentLineItem__cancelBtn"
          @click="onClickCancel">
          {{ $t('common.cancel') }}
        </v-btn>

        <span
          v-if="paymentLine.paymentStatus === PaymentLineStatus.Cancelled"
          class="cancelled-text rc-body14 mr-1"
          data-test="paymentLineItem__cancelled_label">
          {{ $t("caseFile.financialAssistance.cancelled") }}
        </span>

        <div
          data-test="paymentLineItem__amount"
          class="amount rc-body14"
          :class="{ 'text-decoration-line-through': isGroupCancelled || paymentLine.paymentStatus === PaymentLineStatus.Cancelled }">
          {{ amounts }}
        </div>

        <v-btn v-visible="showEditButton" class="ml-2" icon small :aria-label="$t('common.edit')" data-test="paymentLineItem__editBtn" @click="onClickEdit">
          <v-icon small>
            mdi-pencil
          </v-icon>
        </v-btn>

        <v-btn v-visible="showDeleteButton" icon small :aria-label="$t('common.delete')" data-test="paymentLineItem__deleteBtn" @click="onClickDelete">
          <v-icon small>
            mdi-delete
          </v-icon>
        </v-btn>
      </div>

      <div v-if="showRelatedNumber(paymentGroup)" class="flex-row">
        <span :class="{ 'rc-body14': true }" data-test="paymentLineItem__related-number">
          {{ $t('caseFile.financialAssistance.relatedNumber') + ': ' + (paymentLine.relatedNumber || '—') }}
        </span>
      </div>
    </div>

    <payment-cancelled-by
      v-if="paymentLine.paymentStatus === PaymentLineStatus.Cancelled"
      is-line-level
      :by="paymentLine.cancellationBy"
      :date="paymentLine.cancellationDate"
      :reason="paymentLine.cancellationReason" />

    <payment-cancellation-reason
      v-if="showCancellationReasonSelect"
      is-line-level
      @cancel-with-reason="onCancelWithReason"
      @close="showCancellationReasonSelect = false" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import {
  ApprovalStatus, EPaymentCancellationReason, FinancialAssistancePaymentGroup, IFinancialAssistancePaymentGroup, IFinancialAssistancePaymentLine, PayeeType,
 PaymentLineStatus,
} from '@libs/entities-lib/financial-assistance-payment';
import { IFinancialAssistanceTableItem, IFinancialAssistanceTableSubItem } from '@libs/entities-lib/financial-assistance';
import { useUserAccountMetadataStore, useUserAccountStore } from '@/pinia/user-account/user-account';
import routes from '@/constants/routes';
import { UserRoles } from '@libs/entities-lib/user';
import { Status } from '@libs/shared-lib/types';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import { GlobalHandler } from '@libs/services-lib/http-client';
import { EPaymentModalities } from '@libs/entities-lib/program';
import PaymentCancelledBy from './PaymentCancelledBy.vue';
import PaymentCancellationReason from './PaymentCancellationReason.vue';

export default Vue.extend({
  name: 'PaymentLineItem',

  components: {
    PaymentCancelledBy,
    PaymentCancellationReason,
  },

  props: {
    paymentLine: {
      type: Object as () => IFinancialAssistancePaymentLine,
      required: true,
    },

    readonly: {
      type: Boolean,
      required: true,
    },

    transactionApprovalStatus: {
      type: Number,
      default: null,
      validator: (value: number) => {
        if (value === null) {
          return true;
        }

        return Object.values(ApprovalStatus).includes(value);
      },
    },

    paymentGroup: {
      type: Object as () => IFinancialAssistancePaymentGroup,
      required: true,
    },

    isGroupCancelled: {
      type: Boolean,
      default: false,
    },

    isCompleted: {
      type: Boolean,
      default: false,
    },

    disableDeleteButton: {
      type: Boolean,
      default: false,
    },

   items: {
      type: Array as () => IFinancialAssistanceTableItem[],
      required: true,
    },
  },

  data() {
    return {
      loading: false,
      showRelatedNumber: FinancialAssistancePaymentGroup.showRelatedNumber,
      showIssuedActualAmounts: FinancialAssistancePaymentGroup.showIssuedActualAmounts,
      PayeeType,
      showCancellationReasonSelect: false,
      PaymentLineStatus,
      FeatureKeys,
    };
  },

  computed: {
    mainItem(): IFinancialAssistanceTableItem {
      const subItemId = this.paymentLine.subCategoryId;
      // We need to find the main item that contains the subItem category of this payment line item.
      // The business rule is that there can only be one active main item of a certain category, but there can be several inactive items
      // (which happens when a main item of a specific category is created and the deleted repeatedly).
      // We need to find the active main item that contains the subItem category, and if there is none, then find an inactive item that contains it.
      const allMainItemsWithSubitem = this.items.filter((i) => i.subItems.some((si) => si.subCategory.id === subItemId));
      const activeMainItem = allMainItemsWithSubitem.find((i) => i.status === Status.Active);
      return activeMainItem || allMainItemsWithSubitem[0];
    },

    subItem(): IFinancialAssistanceTableSubItem {
      if (!this.mainItem) {
        return null;
      }
      return this.mainItem.subItems.find((s) => s.subCategory.id === this.paymentLine.subCategoryId);
    },

    title(): string {
      if (!this.subItem) {
        return null;
      }
      return `${this.$m(this.mainItem.mainCategory.name)} > ${this.$m(this.subItem.subCategory.name)}`;
    },

    isInactive(): boolean {
      return (this.mainItem?.status === Status.Inactive || this.subItem?.status === Status.Inactive)
        && this.transactionApprovalStatus === ApprovalStatus.New;
    },

    showTooltip(): boolean {
      // Validate if we're over limit
      return this.subItem?.maximumAmount && Number(this.paymentLine.amount) > this.subItem?.maximumAmount;
    },

    amounts(): string {
      // eslint-disable-next-line vue/max-len
      return this.showIssuedActualAmounts(this.paymentGroup) ? `${this.$t('caseFile.financialAssistance.issuedAmountSmall')}: ${this.$formatCurrency(this.paymentLine.amount)} ${this.$t('caseFile.financialAssistance.actualAmountSmall')}: ${(this.paymentLine.actualAmount !== null ? this.$formatCurrency(this.paymentLine.actualAmount) : '—')}` : this.$formatCurrency(this.paymentLine.amount);
    },

    showEditButton(): boolean {
      if (this.readonly || !this.$hasLevel(UserRoles.level1)) {
        return false;
      }
      if (!this.transactionApprovalStatus || this.transactionApprovalStatus === ApprovalStatus.New) {
        return true;
      }
      if ((this.transactionApprovalStatus === ApprovalStatus.Approved || this.transactionApprovalStatus === ApprovalStatus.Pending)
        && (this.showRelatedNumber(this.paymentGroup))) {
        return true;
      }
      if (this.transactionApprovalStatus === ApprovalStatus.Approved
        && this.showIssuedActualAmounts(this.paymentGroup)) {
        return true;
      }
      return false;
    },

    showDeleteButton(): boolean {
      return !this.readonly && this.$hasLevel(UserRoles.level1) && (!this.transactionApprovalStatus || this.transactionApprovalStatus === ApprovalStatus.New);
    },

    showCancelButton(): boolean {
      return this.$hasLevel(UserRoles.level6) && this.isCompleted && this.paymentLine.paymentStatus !== PaymentLineStatus.Cancelled;
    },
  },

  async created() {
    if (this.isInactive) {
      this.$message({
        title: this.$t('caseFile.financialAssistance.inactiveDetails.title'),
        message: this.$t('caseFile.financialAssistance.inactiveDetails.message'),
      });
    }
    if (this.paymentLine.cancellationBy) {
      await useUserAccountStore().fetch(this.paymentLine.cancellationBy);
      await useUserAccountMetadataStore().fetch(this.paymentLine.cancellationBy, GlobalHandler.Partial);
    }
  },

  methods: {
    onClickEdit() {
      this.$emit('edit-payment-line', { line: this.paymentLine, group: this.paymentGroup });
    },

    async onClickDelete() {
      if (this.disableDeleteButton) {
        this.$toasted.global.warning(this.$t('caseFile.financialAssistance.deleteTooltip'));
        } else {
          const doDelete = await this.$confirm({
            title: this.$t('caseFile.financialAssistance.deletePaymentLine.title'),
            messages: this.$t('caseFile.financialAssistance.deletePaymentLine.message'),
          });
          if (doDelete) {
            this.$emit('delete-payment-line', { line: this.paymentLine, group: this.paymentGroup });
          }
        }
    },

    async onClickCancel() {
      if (this.paymentGroup.groupingInformation?.modality === EPaymentModalities.ETransfer) {
          this.showCancellationReasonSelect = true;
        } else {
        const doCancel = await this.$confirm({
          title: this.$t('caseFile.financialAssistance.cancelPaymentLine.title'),
          messages: null,
          htmlContent: this.$t('caseFile.financialAssistance.cancelPaymentLine.message') as string,
        });
        if (doCancel) {
          this.$emit('cancel-payment-line', { lineId: this.paymentLine.id });
        }
      }
    },

    linkToPaymentLineDetails() {
      this.$router.push({
        name: routes.caseFile.financialAssistance.paymentLineDetails.name,
        params: {
          financialAssistancePaymentLineId: this.paymentLine.id,
        },
      });
    },

    onCancelWithReason(reason: EPaymentCancellationReason) {
      this.showCancellationReasonSelect = false;
      this.$emit('cancel-payment-line', { lineId: this.paymentLine.id, reason });
    },

  },
});
</script>

<style scoped lang="scss">
.paymentLine__container {
  border-top: 1px solid var(--v-grey-lighten2);
}

.paymentLine__divider {
  padding-right: 24px;
  margin-right: 24px;
  border-right: 1px solid var(--v-grey-lighten2);
}

.amount {
  min-width: 55px;
  text-align: end;
}

.cancelled-text {
  color:  var(--v-status_error-base);
  text-transform: uppercase;
}
</style>
