<template>
  <div>
    <div class="rc-heading-5 fw-bold mb-6">
      {{ $t('massActions.financialAssistance.create.payment_details.title') }}
    </div>

    <v-row v-for="(row, index) in rows" :key="index" no-gutters :class="[row.customClass, 'row-data']">
      <v-col cols="12" md="5">
        <span class="rc-body14 fw-bold">{{ $t(row.label) }}</span>
      </v-col>
      <v-col md="7">
        <span v-if="!row.loading" :class="[row.customClassValue, 'rc-body14']" :data-test="row.dataTest"> {{ row.value }} </span>
        <v-progress-circular v-else indeterminate color="primary" />
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import { IMassActionEntity } from '@libs/entities-lib/mass-action';
import { EPaymentModalities, IProgramEntity } from '@libs/entities-lib/program';
import { IEventEntity } from '@libs/entities-lib/event';
import { IFinancialAssistanceTableCombined } from '@libs/entities-lib/financial-assistance';
import { IOptionItem, IOptionSubItem } from '@libs/entities-lib/optionItem';
import { useEventStore } from '@/pinia/event/event';
import { useProgramStore } from '@/pinia/program/program';
import { useFinancialAssistancePaymentStore } from '@/pinia/financial-assistance-payment/financial-assistance-payment';

export default Vue.extend({
  name: 'FinancialAssistancePaymentDetailsTable',

  props: {
    massAction: {
      type: Object as () => IMassActionEntity,
      required: true,
    },
  },

  data() {
    return {
      event: null as IEventEntity,
      table: null as IFinancialAssistanceTableCombined,
      program: null as IProgramEntity,
      item: null as IOptionItem,
      eventLoading: false,
      tableLoading: false,
      programLoading: false,
      itemLoading: false,
    };
  },
  computed: {
    rows(): Record<string, unknown>[] {
      return [
        {
          label: 'massActions.financialAssistance.create.event.label',
          value: this.$m(this.event?.name),
          dataTest: 'event',
          loading: this.eventLoading,
        },
        {
          label: 'massActions.financialAssistance.create.table.label',
          value: this.table?.entity && this.$m(this.table.entity.name),
          dataTest: 'table',
          loading: this.tableLoading,
        },
        {
          label: 'massActions.financialAssistance.create.program.label',
          value: this.program && this.$m(this.program.name),
          dataTest: 'program',
          loading: this.programLoading,
        },
        {
          label: 'massActions.financialAssistance.create.item.label',
          value: this.item && this.$m(this.item.name),
          dataTest: 'item',
          loading: this.itemLoading,
        },
        {
          label: 'massActions.financialAssistance.create.sub_item.label',
          value: this.subItem && this.$m(this.subItem.name),
          dataTest: 'sub_item',
          loading: this.itemLoading,
        },
        {
          label: 'massActions.financialAssistance.create.payment.label',
          value: this.$t(`enums.PaymentModality.${EPaymentModalities[this.massAction.details.paymentModality]}`),
          dataTest: 'payment',
        },
        {
          label: 'massActions.financialAssistance.create.amount.label',
          value: this.$formatCurrency(this.massAction.details.amount),
          dataTest: 'amount',
          customClass: 'grey-back',
          customClassValue: 'fw-bold',
        },
      ];
    },

    subItem(): IOptionSubItem {
      if (this.item) {
        return this.item.subitems?.find((s) => s.id === this.massAction.details.subCategoryId);
      }
      return null;
    },
  },
  async created() {
    this.fetchEvent();
    this.fetchTable();
    this.fetchProgram();
    this.fetchItem();
  },

  methods: {
    async fetchEvent() {
      this.eventLoading = true;
      this.event = await useEventStore().fetch(this.massAction.details.eventId) as IEventEntity;
      this.eventLoading = false;
    },

    async fetchTable() {
      this.tableLoading = true;
      this.table = await this.$storage.financialAssistance.actions.fetch(this.massAction.details.tableId);
      this.tableLoading = false;
    },

    async fetchProgram() {
      this.programLoading = true;
      this.program = await useProgramStore().fetch({
        id: this.massAction.details.programId,
        eventId: this.massAction.details.eventId,
      }) as IProgramEntity;
      this.programLoading = false;
    },

    async fetchItem() {
      this.itemLoading = true;
      const categories = await useFinancialAssistancePaymentStore().fetchFinancialAssistanceCategories();
      this.item = categories?.find((c) => c.id === this.massAction.details.mainCategoryId);
      this.itemLoading = false;
    },
  },
});
</script>

<style lang="scss" scoped>

.grey-back {
  background-color: var(--v-grey-lighten5);
}

.row-data {
  min-height: 60px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border: solid var(--v-grey-lighten2);
  border-width: 1px 1px 0px 1px;
}
.row-data:last-child {
  border-bottom-right-radius: 4px;
  border-bottom-left-radius: 4px;
  border-width: 1px 1px 1px 1px;
}
.row-data:first-child {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  border-width: 1px 1px 0px 1px;
}
.row-data:only-child {
  border-width: 1px 1px 1px 1px;
}

</style>
