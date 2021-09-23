<template>
  <div>
    <div class="rc-body16 fw-bold mb-6">
      {{ $t('massActions.financialAssistance.create.payment_details.title') }}
    </div>
    <div class="grey-container pa-6">
      <v-row>
        <v-col cols="12">
          <v-autocomplete-with-validation
            v-model="formCopy.event"
            :attach="true"
            clearable
            background-color="white"
            :loading="loadingEvent"
            :disabled="loadingEvent"
            :label="`${$t('massActions.financialAssistance.create.event.label')} *`"
            :items="events"
            :item-text="(item) => $m(item.name)"
            return-object
            :rules="rules.event"
            @click:clear="onClearEvent()" />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="6">
          <v-autocomplete-with-validation
            v-model="formCopy.table"
            background-color="white"
            :attach="true"
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
            <span v-if="program">{{ $m(program.entity.name) }}</span>
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
import { VAutocompleteWithValidation, VTextFieldWithValidation } from '@crctech/component-library';
import sortBy from 'lodash/sortBy';
import {
  IFinancialAssistanceTableCombined,
  IFinancialAssistanceTableEntity, IFinancialAssistanceTableItemData, IFinancialAssistanceTableSubItemData,
  EFinancialAmountModes,
} from '@/entities/financial-assistance';
import { IOptionItem, IOptionItemCombined, IOptionSubItem } from '@/entities/optionItem';
import { EEventStatus, IEventEntity } from '@/entities/event';
import helpers from '@/ui/helpers';
import { EPaymentModalities } from '@/entities/program';
import { Status } from '@/entities/base';
import { PaymentDetailsForm } from './FinancialAssistanceCreateFile.vue';

export default Vue.extend({
  name: 'FinancialAssistancePaymentDetails',

  components: {
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
      events: [],
      formCopy: null as PaymentDetailsForm,
      program: null,
      isEmpty,
      EFinancialAmountModes,
    };
  },

  computed: {
    rules() {
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
      return this.financialAssistanceTables.map((t) => t.entity.eventId);
    },

    eventTables(): IFinancialAssistanceTableEntity[] {
      if (this.formCopy.event) {
        return this.financialAssistanceTables.filter((t) => t.entity.eventId === this.formCopy.event.id).map((t) => t.entity);
      }
      return [];
    },

    currentFinancialAssistanceTable(): IFinancialAssistanceTableCombined {
      if (this.formCopy.table) {
        return this.financialAssistanceTables.find((t) => t.entity.id === this.formCopy.table.id);
      }
      return null;
    },

    financialAssistanceTables(): Array<IFinancialAssistanceTableCombined> {
      // We keep tables having at least one active item having at least one sub-item for which document is not required
      // We can't create mass action with sub-item requiring a documentation
      return this.$storage.financialAssistance.getters.getAll()
        .filter((t) => t.entity.items.length > 0
        && t.entity.status === Status.Active
        && t.entity.items.some((item) => item.subItems.some((subItem) => subItem.documentationRequired === false)));
    },

    financialAssistanceCategories(): Array<IOptionItemCombined> {
      return this.$storage.financialAssistanceCategory.getters.getAll();
    },

    financialAssistanceTableItems(): Array<IOptionItem> {
      if (this.currentFinancialAssistanceTable) {
        // We keep only items having at least one sub-item for which document is not required.
        // We can't create mass action with sub-item requiring a documentation
        const currentItemsIds = this.currentFinancialAssistanceTable.entity.items
          .filter((i) => i.status === Status.Active && i.subItems.some((s) => s.documentationRequired === false))
          .map((i) => i.mainCategory.optionItemId);

        return this.financialAssistanceCategories.filter((c) => currentItemsIds.includes(c.entity.id)).map((c) => c.entity);
      }
      return [];
    },

    paymentModalities(): Record<string, unknown>[] {
      if (this.program?.entity) {
        return helpers.enumToTranslatedCollection(EPaymentModalities, 'event.programManagement.paymentModalities')
          .filter((p) => this.program.entity.paymentModalities.includes(p.value));
      }
      return [];
    },

    currentItem(): IFinancialAssistanceTableItemData {
      if (this.currentFinancialAssistanceTable && this.formCopy.item) {
        return this.currentFinancialAssistanceTable.entity.items.find((i) => i.mainCategory.optionItemId === this.formCopy.item.id);
      }
      return null;
    },

    currentSubItem(): IFinancialAssistanceTableSubItemData {
      if (this.currentItem && this.formCopy.subItem) {
        return this.currentItem.subItems.find((s) => s.subCategory.optionItemId === this.formCopy.subItem.id);
      }
      return null;
    },

    subItems(): IOptionSubItem[] {
      if (this.currentItem?.subItems) {
        const subItemsCurrentTableIds = this.currentItem.subItems
          .filter((s) => s.status === Status.Active && s.documentationRequired === false)
          .map((s) => s.subCategory.optionItemId);
        if (this.formCopy?.item?.subitems) {
          return this.formCopy.item.subitems.filter((s) => subItemsCurrentTableIds.includes(s.id) && s.status === Status.Active);
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
        }
      },
    },
  },

  async created() {
    this.formCopy = cloneDeep(this.form);
    await this.$storage.financialAssistance.actions.fetchAll();
    await this.$storage.financialAssistanceCategory.actions.fetchAll();
    this.fetchEvents();
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
      this.program = null;
    },

    onSetFinancialAssistanceTable(table: IFinancialAssistanceTableEntity) {
      this.formCopy.table = table;
      this.formCopy.item = null;
      this.formCopy.subItem = null;
      this.formCopy.paymentModality = null;
      this.formCopy.amount = null;
      this.program = null;
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

    async fetchEvents() {
      this.loadingEvent = true;
      const res = await this.$storage.event.actions.fetchAll();

      this.events = res
        .filter((e) => (
          e.entity.schedule.status === EEventStatus.OnHold || e.entity.schedule.status === EEventStatus.Open)
          && this.eventIdsWithFinancialAssistanceTable.includes(e.entity.id))
        .map((e) => ({ id: e.entity.id, name: e.entity.name }));

      this.events = sortBy(this.events, (event) => this.$m(event.name));

      this.loadingEvent = false;
    },

    async fetchProgram(fa: IFinancialAssistanceTableEntity) {
      this.program = await this.$storage.program.actions.fetch({ id: fa.programId, eventId: fa.eventId });
    },
  },
});
</script>
