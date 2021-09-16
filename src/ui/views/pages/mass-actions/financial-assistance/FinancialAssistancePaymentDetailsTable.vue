<template>
  <div>
    <div class="rc-body16 fw-bold mb-6">
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

import { IMassActionCombined } from '@/entities/mass-action';
import { EPaymentModalities, IProgramCombined } from '@/entities/program';
import { IEventCombined } from '@/entities/event';
import { IFinancialAssistanceTableCombined } from '@/entities/financial-assistance';
import {
  EVENT_ENTITIES, FINANCIAL_ASSISTANCE_ENTITIES, PROGRAM_ENTITIES, FINANCIAL_ASSISTANCE_CATEGORY_ENTITIES,
} from '@/constants/vuex-modules';
import { IOptionSubItem, IOptionItemCombined } from '@/entities/optionItem';

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
    };
  },
  computed: {
    rows(): Record<string, unknown>[] {
      return [
        {
          label: 'massActions.financialAssistance.create.event.label',
          value: this.event && this.$m(this.event.entity.name),
          dataTest: 'event',
          loading: this.eventLoading,
        },
        {
          label: 'massActions.financialAssistance.create.table.label',
          value: this.table && this.$m(this.table.entity.name),
          dataTest: 'table',
          loading: this.tableLoading,
        },
        {
          label: 'massActions.financialAssistance.create.program.label',
          value: this.program && this.$m(this.program.entity.name),
          dataTest: 'program',
          loading: this.programLoading,
        },
        {
          label: 'massActions.financialAssistance.create.item.label',
          value: this.item && this.$m(this.item.entity.name),
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
          value: this.$t(`event.programManagement.paymentModalities.${EPaymentModalities[this.massAction.entity.details.paymentModality]}`),
          dataTest: 'payment',
        },
        {
          label: 'massActions.financialAssistance.create.amount.label',
          value: `$${this.massAction.entity.details.amount}`,
          dataTest: 'amount',
          customClass: 'grey-back',
          customClassValue: 'fw-bold',
        },
      ];
    },

    eventLoading(): boolean {
      return this.$store.state[EVENT_ENTITIES].actionLoading;
    },

    tableLoading(): boolean {
      return this.$store.state[FINANCIAL_ASSISTANCE_ENTITIES].actionLoading;
    },

    programLoading(): boolean {
      return this.$store.state[PROGRAM_ENTITIES].actionLoading;
    },

    itemLoading(): boolean {
      return this.$store.state[FINANCIAL_ASSISTANCE_CATEGORY_ENTITIES].actionLoading;
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
      this.event = await this.$storage.event.actions.fetch(this.massAction.entity.details.eventId);
    },

    async fetchTable() {
      this.table = await this.$storage.financialAssistance.actions.fetch(this.massAction.entity.details.tableId);
    },

    async fetchProgram() {
      this.program = await this.$storage.program.actions.fetch({
        id: this.massAction.entity.details.programId,
        eventId: this.massAction.entity.details.eventId,
      });
    },

    async fetchItem() {
      this.item = await this.$storage.financialAssistanceCategory.actions.fetch(this.massAction.entity.details.mainCategoryId);
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
