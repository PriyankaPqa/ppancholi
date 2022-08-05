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

import { IMassActionCombined } from '@libs/entities-lib/mass-action';
import { EPaymentModalities, IProgramCombined } from '@libs/entities-lib/program';
import { IEventCombined } from '@libs/entities-lib/event';
import { IFinancialAssistanceTableCombined } from '@libs/entities-lib/financial-assistance';

import { IOptionSubItem, IOptionItemCombined } from '@libs/entities-lib/optionItem';

export default Vue.extend({
  name: 'FinancialAssistancePaymentDetailsTable',

  props: {
    massAction: {
      type: Object as () => IMassActionCombined,
      required: true,
    },
  },

  data() {
    return {
      event: null as IEventCombined,
      table: null as IFinancialAssistanceTableCombined,
      program: null as IProgramCombined,
      item: null as IOptionItemCombined,
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
          value: this.event?.entity && this.$m(this.event.entity.name),
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
          value: this.program?.entity && this.$m(this.program.entity.name),
          dataTest: 'program',
          loading: this.programLoading,
        },
        {
          label: 'massActions.financialAssistance.create.item.label',
          value: this.item?.entity && this.$m(this.item.entity.name),
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
          value: this.$t(`enums.PaymentModality.${EPaymentModalities[this.massAction.entity.details.paymentModality]}`),
          dataTest: 'payment',
        },
        {
          label: 'massActions.financialAssistance.create.amount.label',
          value: this.$formatCurrency(this.massAction.entity.details.amount),
          dataTest: 'amount',
          customClass: 'grey-back',
          customClassValue: 'fw-bold',
        },
      ];
    },

    subItem(): IOptionSubItem {
      if (this.item?.entity) {
        return this.item.entity.subitems.find((s) => s.id === this.massAction.entity.details.subCategoryId);
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
      this.event = await this.$storage.event.actions.fetch(this.massAction.entity.details.eventId);
      this.eventLoading = false;
    },

    async fetchTable() {
      this.tableLoading = true;
      this.table = await this.$storage.financialAssistance.actions.fetch(this.massAction.entity.details.tableId);
      this.tableLoading = false;
    },

    async fetchProgram() {
      this.programLoading = true;
      this.program = await this.$storage.program.actions.fetch({
        id: this.massAction.entity.details.programId,
        eventId: this.massAction.entity.details.eventId,
      });
      this.programLoading = false;
    },

    async fetchItem() {
      this.itemLoading = true;
      this.item = await this.$storage.financialAssistanceCategory.actions.fetch(this.massAction.entity.details.mainCategoryId);
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
