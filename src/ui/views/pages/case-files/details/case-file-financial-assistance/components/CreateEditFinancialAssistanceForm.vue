<template>
  <v-container>
    <v-row class="mt-0">
      <v-col cols="12">
        <status-chip status-name="ApprovalStatus" :status="localFinancialAssistance.approvalStatus" />
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
          v-model="financialAssistanceTable"
          :items="tablesSorted"
          return-object
          :label="`${$t('financial.table_name')} *`"
          :item-text="(item) => $m(item.name)"
          :loading="loadingTables"
          :rules="rules.table"
          :disabled="isEditMode"
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
import { FinancialAssistancePaymentEntity, IFinancialAssistancePaymentEntity } from '@/entities/financial-assistance-payment';
import { IFinancialAssistanceTableEntity } from '@/entities/financial-assistance';

export default Vue.extend({
  name: 'CreateEditFinancialAssistanceForm',

  components: {
    VTextFieldWithValidation,
    VTextAreaWithValidation,
    VAutocompleteWithValidation,
    StatusChip,
  },

  props: {
    financialAssistance: {
      type: Object as () => IFinancialAssistancePaymentEntity,
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

    isEditMode: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      localFinancialAssistance: null as FinancialAssistancePaymentEntity,
      financialAssistanceTable: null as IFinancialAssistanceTableEntity,
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

  created() {
    this.localFinancialAssistance = new FinancialAssistancePaymentEntity(this.financialAssistance);
    this.financialAssistanceTable = this.financialAssistanceTables
      .find((x) => x.id === this.localFinancialAssistance.financialAssistanceTableId);
    this.$emit('updateSelectedData', this.financialAssistanceTable);
  },

  methods: {
    async triggerUpdateSelectedData(table: IFinancialAssistanceTableEntity) {
      let doChange = true;
      if (this.localFinancialAssistance.groups?.length) {
        doChange = await this.$confirm(this.$t('financialAssistancePayment.confirm.changeTable.title'),
          this.$t('financialAssistancePayment.confirm.changeTable.message'));
      }
      if (doChange) {
        this.localFinancialAssistance.groups = [];
        this.localFinancialAssistance.financialAssistanceTableId = table.id;
        this.updateBasicData();
        this.$emit('updateSelectedData', table);
      } else {
        this.financialAssistanceTable = this.financialAssistanceTables
          .find((x) => x.id === this.localFinancialAssistance.financialAssistanceTableId);
      }
    },

    updateBasicData(): void {
      this.$emit('update:financialAssistance', this.localFinancialAssistance);
    },
  },
});
</script>

<style>

</style>
