<template>
  <div>
    <div class="rc-body16 fw-bold mb-6">
      {{ $t('massActions.financialAssistance.create.payment_details.title') }}
    </div>
    <div class="grey-container pa-6">
      <v-row>
        <v-col cols="12">
          <events-selector
            v-model="formCopy.event"
            async-mode
            :force-events="filteredEvents"
            return-object
            data-test="payment_event_name"
            fetch-all-events
            :label="`${$t('massActions.financialAssistance.create.event.label')} *`"
            :rules="rules.event"
            @click:clear="onClearEvent()"
            @fetch:done="filterEvents($event)"
            @change="onSetEvent($event)" />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="6">
          <v-autocomplete-with-validation
            v-model="formCopy.table"
            background-color="white"
            :attach="true"
            data-test="payment_table_name"
            :disabled="isEmpty(formCopy.event)"
            clearable
            :label="`${$t('massActions.financialAssistance.create.table.label')} *`"
            :items="eventTables"
            :item-text="(item) => $m(item.name)"
            return-object
            :rules="rules.table"
            @click:clear="onClearFinancialAssistanceTable()" />
        </v-col>
        <v-col cols="6">
          <div class="mt-4">
            {{ $t('massActions.financialAssistance.create.program.label') }}
            <span v-if="formCopy && formCopy.program" data-test="payment_program">{{ $m(formCopy.program.name) }}</span>
          </div>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="6">
          <v-autocomplete-with-validation
            v-model="formCopy.item"
            :attach="true"
            background-color="white"
            :disabled="isEmpty(formCopy.table)"
            clearable
            data-test="payment_item"
            :label="`${$t('massActions.financialAssistance.create.item.label')} *`"
            :items="financialAssistanceTableItems"
            :item-text="(item) => $m(item.name)"
            return-object
            :rules="rules.item"
            @click:clear="onClearItem()" />
        </v-col>
        <v-col cols="6">
          <v-autocomplete-with-validation
            v-model="formCopy.subItem"
            :attach="true"
            background-color="white"
            :disabled="isEmpty(formCopy.item)"
            clearable
            data-test="payment_subItem"
            :label="`${$t('massActions.financialAssistance.create.sub_item.label')} *`"
            :items="subItems"
            :item-text="(item) => $m(item.name)"
            return-object
            :rules="rules.subItem" />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="6">
          <v-autocomplete-with-validation
            v-model="formCopy.paymentModality"
            :attach="true"
            background-color="white"
            data-test="payment_modality"
            :disabled="isEmpty(formCopy.table)"
            clearable
            :label="`${$t('massActions.financialAssistance.create.payment.label')} *`"
            :items="paymentModalities"
            :rules="rules.paymentModalities" />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="3">
          <v-text-field-with-validation
            v-model="formCopy.amount"
            :disabled="currentSubItem && currentSubItem.amountType === EFinancialAmountModes.Fixed"
            :rules="rules.amount"
            :data-test="`payment_amount_${formCopy.amount}`"
            show-all-decimal
            type="number"
            prefix="$"
            :label="`${$t('massActions.financialAssistance.create.amount.label')} *`"
            background-color="white" />
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import isEmpty from 'lodash/isEmpty';
import cloneDeep from 'lodash/cloneDeep';
import { VAutocompleteWithValidation, VTextFieldWithValidation } from '@libs/component-lib/components';
import _sortBy from 'lodash/sortBy';
import {
  IFinancialAssistanceTableEntity, IFinancialAssistanceTableItemData, IFinancialAssistanceTableSubItemData,
  EFinancialAmountModes,
} from '@libs/entities-lib/financial-assistance';
import { useFinancialAssistancePaymentStore } from '@/pinia/financial-assistance-payment/financial-assistance-payment';
import {
  IOptionItem, IOptionSubItem,
} from '@libs/entities-lib/optionItem';
import EventsSelector from '@/ui/shared-components/EventsSelector.vue';
import { IEventEntity, IEventSummary } from '@libs/entities-lib/event';
import helpers from '@/ui/helpers/helpers';
import { EPaymentModalities, IProgramEntity } from '@libs/entities-lib/program';
import { Status } from '@libs/entities-lib/base';
import { useProgramStore } from '@/pinia/program/program';
import { useFinancialAssistanceStore } from '@/pinia/financial-assistance/financial-assistance';
import { PaymentDetailsForm } from './FinancialAssistanceCreate.vue';

export default Vue.extend({
  name: 'FinancialAssistancePaymentDetailsCreate',

  components: {
    EventsSelector,
    VAutocompleteWithValidation,
    VTextFieldWithValidation,
  },

  props: {
    form: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      loadingEvent: false,
      filteredEvents: [],
      formCopy: null as PaymentDetailsForm,
      isEmpty,
      EFinancialAmountModes,
    };
  },

  computed: {
    rules(): Record<string, unknown> {
      return {
        event: {
          required: true,
        },
        table: {
          required: true,
        },
        item: {
          required: true,
        },
        subItem: {
          required: true,
        },
        paymentModalities: {
          required: true,
        },
        amount: {
          required: true,
          min_value: 0.01,
          max_value: 99999999,
        },
      };
    },

    eventIdsWithFinancialAssistanceTable(): Array<string> {
      return this.financialAssistanceTables.map((t) => t.eventId);
    },

    eventTables(): IFinancialAssistanceTableEntity[] {
      if (this.formCopy.event && this.financialAssistanceTables) {
        return this.financialAssistanceTables.filter((t) => t.eventId === this.formCopy.event.id);
      }
      return [];
    },

    currentFinancialAssistanceTable(): IFinancialAssistanceTableEntity {
      if (this.formCopy.table) {
        return this.financialAssistanceTables?.find((t) => t.id === this.formCopy.table.id);
      }
      return null;
    },

    financialAssistanceTables(): Array<IFinancialAssistanceTableEntity> {
      // We keep tables having at least one active item having at least one sub-item for which document is not required
      // We can't create mass action with sub-item requiring a documentation
      return useFinancialAssistanceStore().getAll()
        .filter((t) => t.items.length > 0
        && t.status === Status.Active
        && t.items.some((item) => item.subItems.some((subItem) => subItem.documentationRequired === false)));
    },

    financialAssistanceCategories(): Array<IOptionItem> {
      return useFinancialAssistancePaymentStore().getFinancialAssistanceCategories(false);
    },

    financialAssistanceTableItems(): Array<IOptionItem> {
      if (this.currentFinancialAssistanceTable?.items) {
        // We keep only items having at least one sub-item for which document is not required.
        // We can't create mass action with sub-item requiring a documentation
        const currentItemsIds = this.currentFinancialAssistanceTable.items.filter(
          (i) => i.status === Status.Active && i.subItems.some((s) => s.documentationRequired === false),
)
          .map((i) => i.mainCategory.optionItemId);

        return _sortBy(this.financialAssistanceCategories
          .filter((c) => currentItemsIds.includes(c.id)), 'orderRank');
      }
      return [];
    },

    paymentModalities(): Record<string, unknown>[] {
      if (this.formCopy?.program?.paymentModalities) {
        return helpers.enumToTranslatedCollection(EPaymentModalities, 'enums.PaymentModality')
          .filter((p) => this.formCopy.program.paymentModalities.includes(p.value as EPaymentModalities));
      }
      return [];
    },

    currentItem(): IFinancialAssistanceTableItemData {
      if (this.currentFinancialAssistanceTable?.items && this.formCopy.item) {
        return this.currentFinancialAssistanceTable.items.find((i) => i.mainCategory.optionItemId === this.formCopy.item.id && i.status === Status.Active);
      }
      return null;
    },

    currentSubItem(): IFinancialAssistanceTableSubItemData {
      if (this.currentItem?.subItems && this.formCopy.subItem) {
        return this.currentItem.subItems.find((s) => s.subCategory.optionItemId === this.formCopy.subItem.id && s.status === Status.Active);
      }
      return null;
    },

    subItems(): IOptionSubItem[] {
      if (this.currentItem?.subItems) {
        const subItemsCurrentTableIds = this.currentItem.subItems
          .filter((s) => s.status === Status.Active && s.documentationRequired === false)
          .map((s) => s.subCategory.optionItemId);
        if (this.formCopy?.item?.subitems) {
          return this.formCopy.item.subitems.filter((s: IOptionSubItem) => subItemsCurrentTableIds.includes(s.id));
        }
      }
      return [];
    },
  },

  watch: {
    formCopy: {
      deep: true,
      handler(newVal) {
        this.$emit('update', newVal);
      },
    },

    'formCopy.table': {
      async handler(newTable) {
        if (newTable) {
          this.onSetFinancialAssistanceTable(newTable);
          await this.fetchProgram(newTable);
        }
      },
    },

    'formCopy.event': {
      async handler(newEvent) {
        if (newEvent) {
          this.onSetEvent(newEvent);
        }
      },
    },

    'formCopy.item': {
      async handler(item) {
        if (item) {
          this.onSetItem(item);
        }
      },
    },

    'formCopy.subItem': {
      async handler(subItem) {
        if (subItem && this.currentSubItem.amountType === EFinancialAmountModes.Fixed) {
          this.formCopy.amount = this.currentSubItem.maximumAmount;
        } else {
          this.formCopy.amount = 0;
        }
      },
    },
  },

  async created() {
    this.formCopy = cloneDeep(this.form);
    await useFinancialAssistanceStore().fetchAll();
    await useFinancialAssistancePaymentStore().fetchFinancialAssistanceCategories();
  },

  methods: {
    onClearEvent() {
      this.onSetEvent(null);
    },

    onSetEvent(event: IEventEntity) {
      this.formCopy.event = event;
      this.formCopy.table = null;
      this.formCopy.item = null;
      this.formCopy.subItem = null;
      this.formCopy.paymentModality = null;
      this.formCopy.amount = null;
      this.formCopy.program = null;
    },

    onSetFinancialAssistanceTable(table: IFinancialAssistanceTableEntity) {
      this.formCopy.table = table;
      this.formCopy.item = null;
      this.formCopy.subItem = null;
      this.formCopy.paymentModality = null;
      this.formCopy.amount = null;
      this.formCopy.program = null;
    },

    onSetItem(item: IOptionItem) {
      this.formCopy.item = item;
      this.formCopy.subItem = null;
    },

    onClearFinancialAssistanceTable() {
      this.onSetFinancialAssistanceTable(null);
    },

    onClearItem() {
      this.onSetItem(null);
    },

    async fetchProgram(fa: IFinancialAssistanceTableEntity) {
      this.formCopy.program = await useProgramStore().fetch({ id: fa.programId, eventId: fa.eventId }) as IProgramEntity;
    },

    filterEvents(events: Array<IEventSummary>) {
      this.filteredEvents = events
        .filter((e) => this.eventIdsWithFinancialAssistanceTable.includes(e.id))
        .map((e) => ({ id: e.id, name: e.name }));
    },
  },
});
</script>
