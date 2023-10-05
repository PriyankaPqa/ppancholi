<template>
  <validation-observer ref="actionApprovalForm" v-slot="{ failed }" slim>
    <rc-dialog
      :title="$t('approval.requests.action.title')"
      :submit-action-label="$t('common.apply')"
      :cancel-action-label="$t('common.buttons.cancel')"
      :submit-button-disabled="failed || submitLoading"
      :show.sync="show"
      :max-width="750"
      content-padding="10"
      persistent
      :show-close="true"
      :show-help="false"
      must-sort
      :loading="loadingUsers || submitLoading"
      @close="closeActionApprovalDialog()"
      @cancel="closeActionApprovalDialog()"
      @submit="onSubmit()">
      <v-row class="px-6">
        <v-col v-if="showWarning" cols="12" class="mb-4 pa-0">
          <message-box
            icon="mdi-alert"
            data-test="approval_action_warning"
            :message=" $t('approval.requests.action.noSupervisor')" />
        </v-col>
        <v-col cols="12" class="grey-container mb-4 px-8">
          <div class="rc-heading-5 fw-bold mb-4">
            {{ $t('approval.requests.action.approvalStatus') }}
          </div>
          <validation-provider v-slot="{ errors }" :rules="rules.action">
            <v-radio-group
              v-model="action.approvalAction"
              :error-messages="errors"
              data-test="approval_action_action"
              row>
              <v-radio
                class="mr-8"
                data-test="approval_action_action_approved"
                :label="$t('approval.requests.action.approved')"
                :value="ApprovalAction.Approved" />
              <v-radio
                class="mr-8"
                data-test="approval_action_action_requestInfo"
                :label="$t('approval.requests.action.requestInfo')"
                :value="ApprovalAction.RequestAdditionalInfo" />
              <v-radio
                class="mr-8"
                data-test="approval_action_action_declined"
                :label="$t('approval.requests.action.declined')"
                :value="ApprovalAction.Declined" />
            </v-radio-group>
          </validation-provider>
        </v-col>
        <v-col cols="12" class="px-0 pt-4 pb-0">
          <v-text-area-with-validation
            v-model="action.rationale"
            :rules="rules.rationale"
            :label="`${$t('approval.requests.action.rationale')} ${!action.approvalAction || isApproved ? '' : '*'}`"
            data-test="approval_action_rationale" />
        </v-col>
        <v-col v-if="needsNextApprover" cols="12" class="px-0 py-0">
          <v-autocomplete-with-validation
            v-model="action.submittedTo"
            data-test="approval_action_supervisor"
            :rules="rules.supervisor"
            :label="`${$t('approval.requests.action.supervisor')} *`"
            :attach="false"
            :loading="loadingUsers"
            :item-text="getUserName"
            :item-value="(item) => item && item.id"
            background-color="white"
            :items="users" />
        </v-col>
        <v-col
          v-if="action.approvalAction && !isApproved"
          cols="12"
          class="grey-container pl-2">
          <v-checkbox-with-validation
            v-model="confirm"
            :rules="rules.confirm"
            data-test="checkbox_confirmed"
            class="rc-body12"
            dense
            :label="action.approvalAction === ApprovalAction.RequestAdditionalInfo
              ? $t('approval.requests.action.confirm.requestInfo') : $t('approval.requests.action.confirm.decline')" />
        </v-col>
      </v-row>
    </rc-dialog>
  </validation-observer>
</template>

<script lang="ts">
import { ApprovalAction, IApprovalActionPayload, IFinancialAssistancePaymentCombined } from '@libs/entities-lib/financial-assistance-payment';
import { VForm } from '@libs/shared-lib/types';
import {
  RcDialog, VAutocompleteWithValidation, VCheckboxWithValidation, VTextAreaWithValidation, MessageBox,
} from '@libs/component-lib/components';
import Vue from 'vue';
import {
  IUserAccountMetadata,
} from '@libs/entities-lib/user-account';
import { useFinancialAssistancePaymentStore } from '@/pinia/financial-assistance-payment/financial-assistance-payment';

export default Vue.extend({
  name: 'ApprovalActionDialog',
  components: {
    RcDialog,
    VAutocompleteWithValidation,
    VTextAreaWithValidation,
    VCheckboxWithValidation,
    MessageBox,
  },
  props: {
    financialAssistancePayment: {
      type: Object as () => IFinancialAssistancePaymentCombined,
      required: true,
    },
    myRoleId: {
      type: String,
      required: true,
    },
    show: {
      type: Boolean,
      required: true,
    },

  },
  data() {
    return {
      action: {} as IApprovalActionPayload,
      confirm: false,
      submitLoading: false,
      users: [] as IUserAccountMetadata[],
      selectedUserId: null,
      loadingUsers: false,
      ApprovalAction,
      usersFetched: false,
      nextApprovalGroupRoles: [] as string[],
    };
  },

  computed: {
    // Users that are excluded from the list of users in the next approval group
    // (ex. the initial submitter, or the person who submitted the payment)
    excludedUsers():string[] {
      return [this.myRoleId, this.financialAssistancePayment.entity.initialSubmitter, this.financialAssistancePayment.entity.submittedBy.userId];
    },

    rules(): Record<string, unknown> {
      return {
        action: {
          required: true, oneOf: [ApprovalAction.Approved, ApprovalAction.RequestAdditionalInfo, ApprovalAction.Declined],
        },
        confirm: {
          required: { allowFalse: false },
        },
        supervisor: {
          required: true,
        },
        rationale: {
          required: !this.isApproved,
        },
      };
    },

    isApproved(): boolean {
      return !!this.action.approvalAction && this.action.approvalAction === ApprovalAction.Approved;
    },

    showWarning(): boolean {
      // A next approver is needed in the approval flow, but the search retrieved no users with that role
      return this.needsNextApprover && !this.loadingUsers && !this.users?.length;
    },

    needsNextApprover(): boolean {
      return this.action.approvalAction === ApprovalAction.Approved && !!this.nextApprovalGroupRoles?.length;
    },
  },

  watch: {
    'action.approvalAction': {
      handler(nextValue, prevValue) {
        if (prevValue && nextValue !== prevValue) {
          this.action.rationale = '';
          this.action.submittedTo = null;
          this.confirm = false;
          (this.$refs.actionApprovalForm as VForm).reset();
        }

        if (this.isApproved && !this.usersFetched) {
          this.fetchRolesAndUsers();
        }
      },
      deep: true,
    },
  },

  methods: {
    async fetchRolesAndUsers() {
      this.loadingUsers = true;
      try {
        const roles = await this.$services.financialAssistancePaymentsService.getNextApprovalGroupRoles(this.financialAssistancePayment.entity.id);
        if (roles && roles.length) {
          this.nextApprovalGroupRoles = roles;
          await this.getUsersByRolesAndEvent(roles, this.financialAssistancePayment.metadata.eventId);
        }
      } finally {
        this.loadingUsers = false;
      }
    },

    async onSubmit() {
      const isValid = await (this.$refs.actionApprovalForm as VForm).validate();
      if (!isValid) {
        return;
      }

      this.submitLoading = true;
      const res = await useFinancialAssistancePaymentStore().submitApprovalAction(this.financialAssistancePayment.entity.id, this.action);
      if (res) {
        this.$toasted.global.success(this.$t('approval.requests.action.approvalStatusUpdated'));
        this.$emit('updateItems', this.financialAssistancePayment.entity.id);
        this.closeActionApprovalDialog();
      }
      this.submitLoading = false;
    },

    closeActionApprovalDialog() {
      this.$emit('update:show', false);
      this.confirm = false;
      (this.$refs.actionApprovalForm as VForm).reset();
    },

    async getUsersByRolesAndEvent(targetRoles: Array<string>, targetEvent: string) { // TO DO: replace with dropdown that searches on user input
      const usersData = await this.$services.userAccounts.fetchByEventAndRole(targetEvent, targetRoles);
      this.users = usersData.filter((u) => !this.excludedUsers.includes(u.id));
      this.usersFetched = true;
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
