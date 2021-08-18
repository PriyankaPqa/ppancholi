<template>
  <v-container>
    <ValidationObserver ref="form" v-slot="{ failed, dirty }" slim>
      <rc-page-content
        :title="$t('caseFile.financialAssistance.create.title')"
        data-test="page-title">
        <v-row justify="center">
          <v-col cols="8">
            <!-- Warning -->
            <message-box v-if="showWarning" icon="mdi-alert" :message="$t('caseFile.financialAssistance.warning.program.eligibility')" />
            <!-- Form -->
            <create-financial-assistance-form
              :financial-assistance.sync="financialAssistance"
              :financial-assistance-tables="financialTables"
              :program="selectedProgram"
              @updateSelectedData="updateSelectedData" />
            <!-- Add payment line -->
            <v-row justify="center">
              <v-col cols="12">
                <div class="flex-row justify-space-between">
                  <span class="rc-body16 fw-bold">
                    {{ $t('caseFile.financialAssistance.paymentLines') }}
                  </span>

                  <v-btn color="primary" data-test="financial-addPaymentLineBtn" :disabled="!selectedProgram" @click="showAddPaymentLineForm = true">
                    {{ $t('caseFile.financialAssistance.addNewPaymentLines') }}
                  </v-btn>
                </div>
              </v-col>
              <v-col cols="12">
                <div class="rc-body14">
                  {{ $t('caseFile.financialAssistance.noPaymentLines') }}
                </div>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
        <!-- Actions -->
        <template slot="actions">
          <v-btn data-test="cancel" @click.stop="back()">
            {{ $t('common.cancel') }}
          </v-btn>
          <v-btn
            color="primary"
            data-test="save"
            :loading="loading"
            :disabled="failed || !dirty || isDisabled || showWarning"
            @click.stop="submit">
            {{ submitLabel }}
          </v-btn>
        </template>
      </rc-page-content>
    </ValidationObserver>

    <case-file-financial-assistance-payment-line-dialog
      v-if="showAddPaymentLineForm"
      :show.sync="showAddPaymentLineForm"
      :program="selectedProgram"
      :items="items"
      data-test="case-file-financial-assistance-payment-line-dialog"
      @submit="onSubmitPaymentLine($event)"
      @cancelChange="showAddPaymentLineForm = false" />
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcPageContent } from '@crctech/component-library';
import { TranslateResult } from 'vue-i18n';
import { CaseFinancialAssistanceEntity } from '@/entities/case-file-financial-assistance';
import
{
  IFinancialAssistanceTableEntity,
  IFinancialAssistanceTableCombined,
  IFinancialAssistanceTableItem,
} from '@/entities/financial-assistance';
import { Status } from '@/entities/base/index';
import { ICaseFileEntity, IdentityAuthenticationStatus, ValidationOfImpactStatus } from '@/entities/case-file';
import MessageBox from '@/ui/shared-components/MessageBox.vue';
import { IProgram, IProgramData } from '@/entities/program';
import routes from '@/constants/routes';
import CreateFinancialAssistanceForm from './CreateFinancialAssistanceForm.vue';
import CaseFileFinancialAssistancePaymentLineDialog from './CreatePaymentLineDialog.vue';

export default Vue.extend({
  name: 'CreateFinancialAssistance',

  components: {
    RcPageContent,
    CreateFinancialAssistanceForm,
    MessageBox,
    CaseFileFinancialAssistancePaymentLineDialog,
  },
  data() {
    return {
      financialAssistanceLoading: false,
      financialAssistance: null as CaseFinancialAssistanceEntity,
      financialTables: [] as IFinancialAssistanceTableEntity[],
      selectedProgram: null as IProgram,
      selectedTable: null as IFinancialAssistanceTableEntity,
      programs: null as IProgramData[],
      editPaymentLine: null,
      showAddPaymentLineForm: false,
      showEditPaymentLineForm: false,
      showConfirm: false,
      isSaving: false,
      saved: false,
      validationFailed: false,
      loading: false,
    };
  },

  computed: {
    submitLabel(): TranslateResult {
      return this.$t('common.buttons.create');
    },

    showWarning() : boolean {
      return !(this.isImpacted && this.isAuthenticated);
    },

    isAuthenticated(): boolean {
      if (this.selectedProgram?.eligibilityCriteria?.authenticated) {
        return this.caseFile?.identityAuthentication?.status === IdentityAuthenticationStatus.Passed;
      }
      return true;
    },

    isImpacted(): boolean {
      if (this.selectedProgram?.eligibilityCriteria?.impacted) {
        return this.caseFile?.impactStatusValidation?.status === ValidationOfImpactStatus.Impacted;
      }

      return true;
    },

    isDisabled() : boolean {
      return !(this.financialAssistance.validate() && this.financialAssistance.groups?.length > 0);
    },

    caseFile(): ICaseFileEntity {
      return this.$storage.caseFile.getters.get(this.$route.params.id).entity;
    },

    items(): Array<IFinancialAssistanceTableItem> {
      return this.$storage.financialAssistance.getters.items();
    },
  },

  async created() {
    this.financialAssistance = new CaseFinancialAssistanceEntity();
    this.financialAssistance.caseFileId = this.$route.params.id;

    await this.searchTables();
    await this.$storage.financialAssistanceCategory.actions.fetchAll();
  },

  methods: {
    async searchTables() {
      await this.$storage.caseFile.actions.fetch(this.$route.params.id);
      if (this.caseFile) {
        const tableData = await this.$storage.financialAssistance.actions.search({
          filter: {
            'Entity/EventId': this.caseFile.eventId,
          },
        });
        const { ids } = tableData;

        this.financialTables = this.$storage.financialAssistance.getters.getByIds(ids).map((t : IFinancialAssistanceTableCombined) => t.entity)
          .filter((t: IFinancialAssistanceTableEntity) => t.status === Status.Active);
      }
    },

    updateSelectedData(table: IFinancialAssistanceTableEntity) {
      this.updateSelectedProgram(table);
      this.updateSelectedTable(table);
    },

    async updateSelectedProgram(table: IFinancialAssistanceTableEntity) {
      const selectedProgramId = table?.programId;
      if (selectedProgramId) {
        this.selectedProgram = await this.$storage.program.actions.fetchProgram(selectedProgramId);
      }
    },

    async updateSelectedTable(table: IFinancialAssistanceTableEntity) {
      this.selectedTable = table;
      const tableWithMetadata = this.$storage.financialAssistance.getters.get(table.id);
      const categories = this.$storage.financialAssistanceCategory.getters.getAll().map((c) => c.entity);

      this.$storage.financialAssistance.mutations.setFinancialAssistance(tableWithMetadata, categories);
    },

    back(): void {
      this.$router.replace({
        name: routes.caseFile.financialAssistance.home.name,
      });
    },

    onSubmitPaymentLine(payload: unknown) {
      // ToDo : Story 617 => Show the new payment lines added
      this.showAddPaymentLineForm = false;
      if (this.financialAssistance.groups == null) {
        this.financialAssistance.groups = [];
      }

      this.financialAssistance.groups.push(payload);
    },
  },
});
</script>

<style>

</style>
