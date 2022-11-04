<template>
  <div class="pa-4 paymentLine__container">
    <div class="flex-row">
      <span
        v-if="paymentLine.id"
        data-test="paymentLineItem__title"
        class="rc-link16 fw-bold"
        :class="{ 'error--text': isInactive }"
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

      <div data-test="paymentLineItem__amount" :class="{ 'rc-body14': true, 'text-decoration-line-through': isCancelled }">
        {{ amounts }}
      </div>

      <v-btn v-visible="showEditButton" class="ml-2" icon small data-test="paymentLineItem__editBtn" @click="onClickEdit">
        <v-icon small>
          mdi-pencil
        </v-icon>
      </v-btn>

      <v-btn v-visible="showDeleteButton" icon small data-test="paymentLineItem__deleteBtn" @click="onClickDelete">
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
</template>

<script lang="ts">
import Vue from 'vue';
import {
  ApprovalStatus, FinancialAssistancePaymentGroup, IFinancialAssistancePaymentGroup, IFinancialAssistancePaymentLine, PayeeType,
} from '@libs/entities-lib/financial-assistance-payment';
import { IFinancialAssistanceTableItem, IFinancialAssistanceTableSubItem } from '@libs/entities-lib/financial-assistance';
import routes from '@/constants/routes';
import { Status } from '@libs/entities-lib/base';

export default Vue.extend({
  name: 'PaymentLineItem',

  components: {
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

    isCancelled: {
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
    };
  },

  computed: {
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
      return this.showIssuedActualAmounts(this.paymentGroup)
        // eslint-disable-next-line max-len
        ? `${this.$t('caseFile.financialAssistance.issuedAmountSmall')}: ${this.$formatCurrency(this.paymentLine.amount)} ${this.$t('caseFile.financialAssistance.actualAmountSmall')}: ${(this.paymentLine.actualAmount !== null ? this.$formatCurrency(this.paymentLine.actualAmount) : '—')}`
        : this.$formatCurrency(this.paymentLine.amount);
    },

    showEditButton(): boolean {
      if (this.readonly || !this.$hasLevel('level1')) {
        return false;
      }
      if (!this.transactionApprovalStatus || this.transactionApprovalStatus === ApprovalStatus.New) {
        return true;
      }
      if ((this.transactionApprovalStatus === ApprovalStatus.Approved || this.transactionApprovalStatus === ApprovalStatus.Pending)
        && (this.showRelatedNumber(this.paymentGroup) || this.showIssuedActualAmounts(this.paymentGroup))) {
        return true;
      }

      return false;
    },

    showDeleteButton(): boolean {
      return !this.readonly && this.$hasLevel('level1') && (!this.transactionApprovalStatus || this.transactionApprovalStatus === ApprovalStatus.New);
    },
  },

  created() {
    if (this.isInactive) {
      this.$message({
        title: this.$t('caseFile.financialAssistance.inactiveDetails.title'),
        message: this.$t('caseFile.financialAssistance.inactiveDetails.message'),
      });
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

    linkToPaymentLineDetails() {
      this.$router.push({
        name: routes.caseFile.financialAssistance.paymentLineDetails.name,
        params: {
          financialAssistancePaymentLineId: this.paymentLine.id,
        },
      });
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
</style>
