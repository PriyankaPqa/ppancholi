<template>
  <v-container>
    <v-sheet rounded outlined class="pa-8 mb-8">
      <v-row class="mt-0">
        <v-col cols="12">
          <status-chip status-name="CaseFileFinancialAssistanceStatus" :status="localFinancialAssistance.paymentStatus" />
        </v-col>
      </v-row>

      <v-row class="mt-0">
        <v-col cols="12">
          <v-text-field-with-validation
            v-model="localFinancialAssistance.name"
            data-test="financial_name"
            :rules="rules.name"
            :label="`${$t('common.name')} *`" />
        </v-col>
      </v-row>

      <v-row class="mt-0">
        <v-col cols="12" md="6">
          <v-autocomplete-with-validation
            v-model="localFinancialAssistance.financialAssistanceTableId"
            :items="tablesSorted"
            return-object
            :label="`${$t('financial.table_name')} *`"
            :item-text="(item) => $m(item.name)"
            :item-value="(item) => item.id"
            :loading="loadingTables"
            :rules="rules.table"
            data-test="financialCreate_tableSelect"
            @change="triggerUpdateSelectedData" />
        </v-col>
        <v-col class="mt-4">
          {{ $t('financialAssistance.program') }}: {{ program? $m(program.name) : '' }}
        </v-col>
      </v-row>

      <v-row class="mt-0">
        <v-col cols="12">
          <v-text-area-with-validation
            v-model="localFinancialAssistance.description"
            data-test="financial_description"
            :rules="rules.description"
            :label="`${$t('common.description')}`" />
        </v-col>
      </v-row>
    </v-sheet>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import {
  VTextFieldWithValidation,
  VTextAreaWithValidation,
  VAutocompleteWithValidation,
} from '@crctech/component-library';
import _sortBy from 'lodash/sortBy';
import { IProgramEntity } from '@/entities/program';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import { MAX_LENGTH_MD, MAX_LENGTH_SM } from '@/constants/validations';
import { CaseFinancialAssistanceEntity, ICaseFinancialAssistanceEntity } from '@/entities/case-file-financial-assistance';
import { IFinancialAssistanceTableEntity } from '@/entities/financial-assistance';

export default Vue.extend({
  name: 'CreateTransaction',

  components: {
    VTextFieldWithValidation,
    VTextAreaWithValidation,
    VAutocompleteWithValidation,
    StatusChip,
  },

  props: {
    financialAssistance: {
      type: Object as () => ICaseFinancialAssistanceEntity,
      required: true,
    },

    financialAssistanceTables: {
      type: Array as () => IFinancialAssistanceTableEntity[],
      required: true,
    },

    program: {
      type: Object as () => IProgramEntity,
      default: null,
      required: false,
    },
  },

  data() {
    return {
      localFinancialAssistance: new CaseFinancialAssistanceEntity(),
      financialTables: [] as Array<IFinancialAssistanceTableEntity>,
      rules: {
        name: {
          required: true,
          max: MAX_LENGTH_SM,
        },
        description: {
          max: MAX_LENGTH_MD,
        },
        table: {
          required: true,
        },
      },
    };
  },

  computed: {
    tablesSorted(): Array<IFinancialAssistanceTableEntity> {
      return _sortBy(this.financialAssistanceTables, (financialTable) => this.$m(financialTable.name));
    },

    loadingTables(): boolean {
      return this.$storage.financialAssistance.getters.loading();
    },
  },

  watch: {
    localFinancialAssistance: {
      handler() {
        this.updateBasicData();
      },
      deep: true,
    },
  },

  methods: {
    triggerUpdateSelectedData(table: IFinancialAssistanceTableEntity): void {
      this.updateBasicData();
      this.$emit('updateSelectedData', table);
    },

    updateBasicData(): void {
      this.$emit('update:financialAssistance', this.localFinancialAssistance);
    },
  },
});
</script>

<style>

</style>
