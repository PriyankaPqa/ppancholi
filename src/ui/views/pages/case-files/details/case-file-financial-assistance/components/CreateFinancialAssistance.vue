<template>
  <ValidationObserver ref="form" v-slot="{ failed, dirty }" slim>
    <rc-page-content
      :title="$t('caseFile.financialAssistance.create.title')"
      :show-help="true"
      :help-link="$t('zendesk.help_link.add_financial_assistance')">
      <v-row justify="center">
        <v-col cols="8">
          <!-- Warning -->
          <message-box v-if="showWarning" icon="mdi-alert" :message="$t('caseFile.financialAssistance.warning.program.eligibility')" />
          <!-- Form -->
          <create-financial-assistance-form
            :financial-assistance.sync="financialAssistance"
            :financial-assistance-tables="financialTables"
            :program="selectedProgram"
            @updateProgram="updateSelectedProgram" />
          <!-- Add payment line -->
          <v-row justify="center">
            <v-col cols="12">
              <div class="flex-row justify-space-between">
                <span class="rc-body16 fw-bold">
                  {{ $t('caseFile.financialAssistance.paymentLines') }}
                </span>

                <v-btn color="primary" data-test="financial_addPaymentLineBtn" @click="showAddPaymentLineForm = true">
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
</template>

<script lang="ts">
import Vue from 'vue';
import { CaseFinancialAssistanceEntity } from '@/entities/case-file-financial-assistance';
import
{
  IFinancialAssistanceTableEntity,
  IFinancialAssistanceTableCombined,
} from '@/entities/financial-assistance';
import { Status } from '@/entities/base/index';
import { ICaseFileEntity, IdentityAuthenticationStatus, ValidationOfImpactStatus } from '@/entities/case-file';
import MessageBox from '@/ui/shared-components/MessageBox.vue';
import { IProgram, IProgramData } from '@/entities/program';
import { RcPageContent } from '@crctech/component-library';
import { TranslateResult } from 'vue-i18n';
import routes from '@/constants/routes';
import CreateFinancialAssistanceForm from './CreateFinancialAssistanceForm.vue';

export default Vue.extend({
  name: 'CreateFinancialAssistance',

  components: {
    RcPageContent,
    CreateFinancialAssistanceForm,
    MessageBox,
  },
  data() {
    return {
      financialAssistanceLoading: false,
      financialAssistance: null as CaseFinancialAssistanceEntity,
      financialTables: [] as Array<IFinancialAssistanceTableEntity>,
      selectedProgram: null as IProgram,
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
  },

  async created() {
    this.financialAssistance = new CaseFinancialAssistanceEntity();
    this.financialAssistance.caseFileId = this.$route.params.id;

    this.searchTables();
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

    async updateSelectedProgram(table: IFinancialAssistanceTableEntity) {
      const selectedProgramId = table?.programId;
      if (selectedProgramId) {
        this.selectedProgram = await this.$storage.program.actions.fetchProgram(selectedProgramId);
      }
    },

    back(): void {
      this.$router.replace({
        name: routes.caseFile.financialAssistance.home.name,
      });
    },
  },
});
</script>

<style>

</style>
