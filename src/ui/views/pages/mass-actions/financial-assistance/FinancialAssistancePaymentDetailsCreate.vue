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
            background-color="white"
            :disabled="isEmpty(formCopy.table)"
            clearable
            :label="`${$t('massActions.financialAssistance.create.item.label')} *`"
            :items="financialAssistanceTableItems"
            :item-text="(item) => $m(item.name)"
            return-object
            :rules="rules.item"
            @change="$emit('update', formCopy)"
            @click:clear="onClearItem()" />
        </v-col>
        <v-col cols="6">
          <v-autocomplete-with-validation
            v-model="formCopy.subItem"
            background-color="white"
            :disabled="isEmpty(formCopy.item)"
            clearable
            :label="`${$t('massActions.financialAssistance.create.sub_item.label')} *`"
            :items="formCopy.item ? formCopy.item.subitems: []"
            :item-text="(item) => $m(item.name)"
            return-object
            :rules="rules.subItem"
            @change="$emit('update', formCopy)" />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="6">
          <v-autocomplete-with-validation
            v-model="formCopy.paymentModality"
            background-color="white"
            :disabled="isEmpty(formCopy.subItem)"
            clearable
            :label="`${$t('massActions.financialAssistance.create.payment.label')} *`"
            :items="paymentModalities"
            :rules="rules.paymentModalities"
            @change="$emit('update', formCopy)" />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="3">
          <v-text-field-with-validation
            v-model="formCopy.amount"
            :rules="rules.amount"
            type="number"
            prefix="$"
            :disabled="false"
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
import { IFinancialAssistanceTableCombined, IFinancialAssistanceTableEntity } from '@/entities/financial-assistance';
import { IOptionItem, IOptionItemCombined } from '@/entities/optionItem';
import { EEventStatus } from '@/entities/event';
import helpers from '@/ui/helpers';
import { EPaymentModalities } from '@/entities/program';

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
      formCopy: null,
      program: null,
      isEmpty,
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
        return this.financialAssistanceTables
          .filter((t) => t.entity.eventId === this.formCopy.event.id && t.entity.items.length > 0)
          .map((t) => t.entity);
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
      return this.$storage.financialAssistance.getters.getAll();
    },

    financialAssistanceCategories(): Array<IOptionItemCombined> {
      return this.$storage.financialAssistanceCategory.getters.getAll();
    },

    financialAssistanceTableItems(): Array<IOptionItem> {
      if (this.currentFinancialAssistanceTable) {
        const currentItemsIds = this.currentFinancialAssistanceTable.entity.items.map((i) => i.mainCategory.optionItemId);
        return this.financialAssistanceCategories.filter((c) => currentItemsIds.includes(c.entity.id)).map((c) => c.entity);
      }
      return [];
    },

    paymentModalities(): Record<string, unknown>[] {
      return helpers.enumToTranslatedCollection(EPaymentModalities, 'event.programManagement.paymentModalities');
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
      async handler(newVal) {
        if (newVal) {
          await this.fetchProgram(newVal);
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
      this.formCopy.event = null;
      this.formCopy.table = null;
      this.formCopy.item = null;
      this.formCopy.subItem = null;
      this.formCopy.paymentModality = null;
      this.formCopy.amount = null;
    },

    onClearFinancialAssistanceTable() {
      this.formCopy.table = null;
      this.formCopy.item = null;
      this.formCopy.subItem = null;
      this.formCopy.paymentModality = null;
      this.formCopy.amount = null;
    },

    onClearItem() {
      this.formCopy.item = null;
      this.formCopy.subItem = null;
    },

    async fetchEvents() {
      this.loadingEvent = true;
      const res = await this.$storage.event.actions.fetchAll();

      this.events = res
        .filter((e) => (
          e.entity.schedule.status === EEventStatus.OnHold || e.entity.schedule.status === EEventStatus.Open)
          && this.eventIdsWithFinancialAssistanceTable.includes(e.entity.id))
        .map((e) => e.entity);

      this.loadingEvent = false;
    },

    async fetchProgram(fa: IFinancialAssistanceTableEntity) {
      this.program = await this.$storage.program.actions.fetch({ id: fa.programId, eventId: fa.eventId });
    },
  },
});
</script>
