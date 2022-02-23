<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="pb-4 d-flex justify-space-between">
          <h3 data-test="fa-name">
            {{ financialAssistance.name }}
          </h3>
          <div>
            <v-icon v-if="canViewHistory" class="mr-2" @click="showApprovalHistory = true">
              mdi-history
            </v-icon>
            <status-chip status-name="ApprovalStatus" :status="financialAssistance.approvalStatus" />
            <v-btn v-if="canEdit" icon :to="editRoute" data-test="edit-link">
              <v-icon>
                mdi-pencil
              </v-icon>
            </v-btn>
            <v-btn v-if="canDelete" icon data-test="delete-link" @click="deletePayment()">
              <v-icon>
                mdi-delete
              </v-icon>
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6">
        <div class="flex">
          <div class="rc-body14 fw-bold">
            {{ $t('financial.table_name') }}:
          </div>
          <div class="rc-body14" data-test="fatable-name">
            {{ $m(financialAssistanceTable.name) }}
          </div>
        </div>
      </v-col>
      <v-col cols="6">
        <div class="flex">
          <div class="rc-body14 fw-bold">
            {{ $t('financialAssistance.program') }}:
          </div>
          <div class="rc-body14" data-test="program-name">
            {{ $m(program.name) }}
          </div>
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <div class="flex">
          <div class="rc-body14 fw-bold">
            {{ $t('common.description') }}:
          </div>
          <div class="rc-body14 description" data-test="fa-description">
            {{ financialAssistance.description }}
          </div>
        </div>
      </v-col>
    </v-row>

    <approval-history-dialog
      v-if="showApprovalHistory"
      :financial-assistance="financialAssistance"
      :show.sync="showApprovalHistory" />
  </v-container>
</template>

<script lang="ts">
import mixins from 'vue-typed-mixins';
import { IProgramEntity } from '@/entities/program';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import { ApprovalStatus, IFinancialAssistancePaymentEntity } from '@/entities/financial-assistance-payment';
import { IFinancialAssistanceTableEntity } from '@/entities/financial-assistance';
import routes from '@/constants/routes';
import ApprovalHistoryDialog from './ApprovalHistoryDialog.vue';
import caseFileDetail from '../../caseFileDetail';

export default mixins(caseFileDetail).extend({
  name: 'ViewFinancialAssistanceDetails',

  components: {
    StatusChip,
    ApprovalHistoryDialog,
  },

  props: {
    financialAssistance: {
      type: Object as () => IFinancialAssistancePaymentEntity,
      required: true,
    },

    financialAssistanceTable: {
      type: Object as () => IFinancialAssistanceTableEntity,
      default: null,
    },

    program: {
      type: Object as () => IProgramEntity,
      default: null,
    },
  },

  data() {
    return {
      showApprovalHistory: false,
    };
  },

  computed: {
    canViewHistory(): boolean {
      return this.financialAssistance.approvalStatus === ApprovalStatus.Approved;
    },

    canEdit(): boolean {
      return !this.readonly && this.$hasLevel('level1') && this.financialAssistance.approvalStatus === ApprovalStatus.New;
    },

    canDelete(): boolean {
      return !this.readonly && this.$hasLevel('level1') && this.financialAssistance.approvalStatus === ApprovalStatus.New;
    },

    editRoute(): {name: string, params: Record<string, string>} {
      return {
        name: routes.caseFile.financialAssistance.edit.name,
        params: {
          financialAssistancePaymentId: this.financialAssistance.id,
        },
      };
    },
  },

  methods: {
    async deletePayment() {
      const doDelete = await this.$confirm({
        title: this.$t('caseFile.financialAssistance.confirm.delete.title'),
        messages: this.$t('caseFile.financialAssistance.confirm.delete.message'),
      });

      if (doDelete) {
        const result = await this.$storage.financialAssistancePayment.actions.deactivate(this.financialAssistance.id);
        if (result) {
          this.$router.push({
            name: routes.caseFile.financialAssistance.home.name,
          });
        }
      }
    },
  },
});
</script>

<style>
  .description { white-space: pre-line; }
</style>
