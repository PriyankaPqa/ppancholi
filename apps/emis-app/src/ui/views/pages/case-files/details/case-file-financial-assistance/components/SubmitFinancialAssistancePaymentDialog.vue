<template>
  <validation-observer ref="submitPaymentForm" v-slot="{ failed }" slim>
    <rc-dialog
      :title="$t('caseFile.financialAssistance.submitAssistance.confirmTitle')"
      :submit-action-label="$t('common.submit')"
      :cancel-action-label="$t('common.buttons.cancel')"
      :submit-button-disabled="failed || submitLoading || (approvalRequired && !approvalTable)"
      :show.sync="show"
      :max-width="760"
      content-padding="10"
      persistent
      :show-close="false"
      :show-help="false"
      :loading="submitLoading"
      @close="closeSubmitPaymentDialog()"
      @cancel="closeSubmitPaymentDialog()"
      @submit="onSubmit()">
      <v-row v-if="loadingUsers">
        <v-col cols="12" class="mb-4 pa-0">
          <v-skeleton-loader class="my-6" type="article" />
        </v-col>
      </v-row>
      <v-row v-else>
        <v-col cols="12" class="mb-4 pa-0">
          <div v-if="hasNoUsers || hasInvalidTable" class="mb-1">
            <message-box
              icon="mdi-alert"
              data-test="approval_action_warning"
              :message="hasInvalidTable ? $t('caseFile.financialAssistance.submitAssistance.noApprovalTables')
                : $t('caseFile.financialAssistance.submitAssistance.noActiveUsers')" />
          </div>
          <div v-if="useApprovalFlow">
            {{ $t('caseFile.financialAssistance.startApproval.confirmMessage') }}
          </div>
          <div v-if="!approvalRequired">
            {{ $t('caseFile.financialAssistance.submitAssistance.confirmMessage') }}
          </div>
        </v-col>
        <v-col cols="12" class="border-all border-radius-all d-flex justify-space-between rc-body14 px-6 py-3">
          <span class="fw-bold">
            {{ financialAssistance ? financialAssistance.name : '' }}
          </span>
          <span>
            {{ totalAmountToSubmit }}
          </span>
        </v-col>
        <v-col v-if="useApprovalFlow" class="px-0 mt-3">
          <v-autocomplete-with-validation
            v-model="selectedUserId"
            data-test="approval_supervisor"
            :rules="rules.supervisor"
            :label="`${$t('caseFile.financialAssistance.startApproval.users.label')} *`"
            :attach="false"
            :loading="loadingUsers"
            :item-text="getUserName"
            :item-value="(item) => item && item.id"
            background-color="white"
            :items="users" />
        </v-col>
      </v-row>
    </rc-dialog>
  </validation-observer>
</template>

<script lang="ts">
import { FinancialAssistancePaymentEntity } from '@libs/entities-lib/financial-assistance-payment';
import { VForm, Status } from '@libs/shared-lib/types';
import { RcDialog, VAutocompleteWithValidation, MessageBox } from '@libs/component-lib/components';
import Vue from 'vue';
import {
  IUserAccountMetadata,
} from '@libs/entities-lib/user-account';
import { useUserStore } from '@/pinia/user/user';
import { useUserAccountStore } from '@/pinia/user-account/user-account';
import { useFinancialAssistancePaymentStore } from '@/pinia/financial-assistance-payment/financial-assistance-payment';
import { IApprovalTableEntityData } from '@libs/entities-lib/approvals/approvals-table';

export default Vue.extend({
  name: 'SubmitFinancialAssistancePaymentDialog',
  components: {
    RcDialog,
    VAutocompleteWithValidation,
    MessageBox,
  },
  props: {
    financialAssistance: {
      type: FinancialAssistancePaymentEntity,
      required: true,
    },
    show: {
      type: Boolean,
      required: true,
    },
    totalAmountToSubmit: {
      type: String,
      required: true,
    },
    approvalRequired: {
      type: Boolean,
      required: true,
    },
    programId: {
      type: String,
      required: true,
    },
    eventId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      agree: false,
      submitLoading: false,
      users: [] as IUserAccountMetadata[],
      selectedUserId: null,
      loadingUsers: false,
      approvalTable: null,
    };
  },
  computed: {
    myUserRoleId() {
      return useUserAccountStore().getById(useUserStore().getUserId())?.roles?.[0]?.optionItemId;
    },

    rules(): Record<string, unknown> {
      return {
        agree: {
          required: { allowFalse: false },
        },
        supervisor: {
          required: true,
        },
      };
    },

    useApprovalFlow(): boolean {
      return this.approvalRequired && !!this.approvalTable;
    },

    hasInvalidTable(): boolean {
      return this.approvalRequired && !this.approvalTable;
    },

    hasNoUsers():boolean {
      return this.approvalRequired && !this.loadingUsers && !this.users?.length;
    },
  },

  async mounted() {
    if (this.approvalRequired) {
      await this.fetchDataForApproval();
    }
  },

  methods: {
    async onSubmit() {
      const isValid = await (this.$refs.submitPaymentForm as VForm).validate();

      if (!isValid) {
        return;
      }

      this.submitLoading = true;
      let res;
      let successKey;
      if (this.useApprovalFlow) {
        res = await useFinancialAssistancePaymentStore().submitApprovalRequest(this.financialAssistance.id, this.selectedUserId);
        successKey = 'caseFile.financialAssistance.submitApproval.success';
      } else {
        res = await useFinancialAssistancePaymentStore().submitFinancialAssistancePayment(this.financialAssistance.id);
        successKey = 'caseFile.financialAssistance.toast.assistanceSubmitted';
      }

      if (res) {
        this.$emit('update:financial-assistance', new FinancialAssistancePaymentEntity(res));
        this.$toasted.global.success(this.$t(successKey));
        this.closeSubmitPaymentDialog();
      }
      this.submitLoading = false;
    },

    closeSubmitPaymentDialog() {
      this.$emit('update:show', false);
      this.$emit('update:total-amount-to-submit', '');
      this.agree = false;
      (this.$refs.submitPaymentForm as VForm).reset();
    },

    async getUsersByRolesAndEvent(targetRoles: Array<string>, targetEvent: string) {
      const usersData = await this.$services.userAccounts.fetchByEventAndRole(targetEvent, targetRoles);
      this.users = usersData.filter((u) => u.id !== useUserStore().getUserId());
    },

    async fetchDataForApproval() {
      this.loadingUsers = true;
      try {
        const approvalTable = await this.$services.approvalTables.getApprovalTableByProgramId(this.programId);
        if (approvalTable && approvalTable.approvalBaseStatus === Status.Active) {
          this.approvalTable = approvalTable;
          const approvalRoles = this.getCurrentApprovalRoles(approvalTable);
          await this.getUsersByRolesAndEvent(approvalRoles, this.eventId);
        }
      } catch (e) {
        // If there is no approval table using the program and the programs required an approval table
      } finally {
        this.loadingUsers = false;
      }
    },

    getCurrentApprovalRoles(approvalTable: IApprovalTableEntityData): string[] {
      // If the user who submits the request has a role that is in included in one of the approval groups, (eg: the submitter's role is in approval group 3)
      // the approval flow should start at this group and bypass the previous groups (group 1 and group 2)
      const groupContainingCurrentUserRole = approvalTable.groups?.find((g) => g.roles.includes(this.myUserRoleId));
      return groupContainingCurrentUserRole?.roles || approvalTable.groups?.[0].roles;
    },

    getUserName(item: IUserAccountMetadata): string {
      if (item) {
        return item.displayName;
      }
      return '';
    },
  },
});
</script>
