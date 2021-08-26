<template>
  <div class="pa-4 paymentLine__container">
    <div class="flex-row">
      <span v-if="link" class="rc-link16 fw-bold" @click="linkToPaymentLineDetails">
        {{ title }}
      </span>

      <span v-else class="rc-body16 fw-bold">
        {{ title }}
      </span>

      <div class="flex-grow-1" />

      <v-tooltip v-if="showTooltip" v-bind="$attrs" bottom>
        <template #activator="{ on, attrs }">
          <v-icon v-bind="attrs" class="mr-2" color="secondary" small data-test="paymentLineItem__tooltip" v-on="on">
            mdi-alert-circle-outline
          </v-icon>
        </template>

        <span>
          {{ $t('caseFile.financialAssistance.amountExceeded') }}
        </span>
      </v-tooltip>

      <span :class="{ 'rc-body14': true, 'text-decoration-line-through': isCancelled }">
        {{ $formatCurrency(paymentLine.amount) }}
      </span>

      <v-btn v-if="showEditButton" class="ml-2" icon small data-test="paymentLineItem__editBtn" @click="onClickEdit">
        <v-icon small>
          mdi-pencil
        </v-icon>
      </v-btn>

      <v-btn v-if="showDeleteButton" icon small data-test="paymentLineItem__deleteBtn" @click="onClickDelete">
        <v-icon small>
          mdi-delete
        </v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { EPaymentModalities } from '@/entities/program/program.types';
import {
  ApprovalStatus, IFinancialAssistancePaymentLine,
} from '@/entities/financial-assistance-payment';
import { IFinancialAssistanceTableItem } from '@/entities/financial-assistance';

export default Vue.extend({
  name: 'PaymentLineItem',

  components: {
  },

  props: {
    paymentLine: {
      type: Object as () => IFinancialAssistancePaymentLine,
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

    modality: {
      type: Number,
      required: true,
      validator: (value: number) => Object.values(EPaymentModalities).includes(value),
    },

    isCancelled: {
      type: Boolean,
      default: false,
    },

    link: {
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
      showDeleteDialog: false,
      loading: false,
    };
  },

  computed: {
    title(): string {
      const mainItem = this.items.find((i) => i.mainCategory.id === this.paymentLine.mainCategoryId);
      const subItem = mainItem.subItems.find((s) => s.subCategory.id === this.paymentLine.subCategoryId);
      return `${this.$m(mainItem.mainCategory.name)} > ${this.$m(subItem.subCategory.name)}`;
    },

    showTooltip(): boolean {
      // ToDo : There's a story solely for payment over the limit
      // ToDo : Validate if we're over limit
      // if (this.paymentLine.subItem.amountType === EFinancialAmountModes.Variable) {
      //   return this.paymentLine.amount > this.paymentLine.subItem.maximum;
      // }

      return false;
    },

    // showProxyNumber(): boolean {
    //   return this.modality === EPaymentModalities.PrepaidCard || this.modality === EPaymentModalities.Voucher;
    // },

    showEditButton(): boolean {
      return true;
      // ToDo : Not implemented yet
      // if (!this.caseFileIsOpen) {
      //   return false;
      // }

      // const { transactionApprovalStatus, modality } = this;

      // // If we are creating a new transaction, edit button is always visible
      // if (transactionApprovalStatus === '') {
      //   return true;
      // }

      // // If approval status is New, all fields are editable
      // if (transactionApprovalStatus === ETransactionApprovalStatus.New) {
      //   return this.$can('EditNewTransaction');
      // }

      // // If approval status is Pending or Approved and the modality is Voucher or Prepaid card
      // // the Proxy Number and Actual Amount fields are editable
      // if ((transactionApprovalStatus === ETransactionApprovalStatus.Pending || transactionApprovalStatus === ETransactionApprovalStatus.Approved)
      // && (modality === EPaymentModalities.Voucher || modality === EPaymentModalities.PrepaidCard)) {
      //   return this.$can('EditPaymentLineProxyActualAmount');
      // }

      // return false;
    },

    showDeleteButton(): boolean {
      // ToDo: Not implemeted yet
      // if (!this.caseFileIsOpen) {
      //   return false;
      // }

      // // If we are creating a new transaction, delete button is always visible
      // if (this.transactionApprovalStatus === '') {
      //   return true;
      // }

      // return this.$can('EditNewTransaction') && this.transactionApprovalStatus === ETransactionApprovalStatus.New;
      return true;
    },
  },

  methods: {
    onClickEdit() {
      this.$emit('edit-payment-line', this.paymentLine);
    },

    onClickDelete() {
      if (this.disableDeleteButton) {
        this.$toasted.global.warning(this.$t('caseFile.financialAssistance.deleteTooltip'));
      } else {
        this.showDeleteDialog = true;
      }
    },

    async onConfirmDelete() {
      // ToDo: Not implemented yet
      // if (this.paymentLine && this.paymentLine.id) {
      //   this.loading = true;

      //   const res = await this.$services.financialAssistanceTransactions.deletePaymentLine(this.paymentLine.id);

      //   if (res.success) {
      //     this.$toasted.global.success(this.$t('caseFile.financialAssistance.toast.paymentLineDeleted'));
      //   }

      //   this.loading = false;
      // }

      // this.showDeleteDialog = false;
      // this.$emit('delete-payment-line', this.paymentLine);
    },

    linkToPaymentLineDetails() {
      // ToDo: Not implemented yet
      // this.$router.push({
      //   name: routes.caseFileFinancialAssistancePaymentLineDetails.name,
      //   params: {
      //     transactionId: this.$route.params.transactionId,
      //     paymentLineId: this.paymentLine.id,
      //   },
      // });
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
