import Vue from 'vue';
import { IOptionItem, IOptionSubItem } from '@libs/entities-lib/optionItem';
import { useTaskStore } from '@/pinia/task/task';
import { TranslateResult } from 'vue-i18n';
import { useUserAccountMetadataStore } from '@/pinia/user-account/user-account';
import { useUserStore } from '@/pinia/user/user';
import { ITaskEntity, TaskEntity, TaskStatus, TaskType } from '@libs/entities-lib/task';
import { ITeamEntity } from '@libs/entities-lib/team';
import { UserRoles } from '@libs/entities-lib/user';
import { Status } from '@libs/shared-lib/types';
import { useTeamStore } from '@/pinia/team/team';
import { useFinancialAssistancePaymentStore } from '@/pinia/financial-assistance-payment/financial-assistance-payment';

export default Vue.extend({
  props: {
    taskId: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      selectedTaskCategoryId: '',
      selectedSubCategoryId: '',
      toggleLoading: false,
      isWorkingOn: false,
      filterOutHiddenTaskCategory: true,
      filterOutInactiveTaskCategoryAndSubCategory: true,
      localTask: new TaskEntity(),
      financialAssistancePaymentName: '',
      userIsInEscalationTeam: false,
      assignableTeams: [] as ITeamEntity[],
    };
  },

  computed: {
    taskCategories(): IOptionItem[] {
      return useTaskStore().getTaskCategory(this.filterOutHiddenTaskCategory, this.filterOutInactiveTaskCategoryAndSubCategory, this.selectedTaskCategoryId);
    },

    taskSubCategories(): IOptionSubItem[] {
      const sub = this.taskCategories?.find((t) => t?.id === this.selectedTaskCategoryId)?.subitems || [];
      return useTaskStore().filterAndSortActiveSubItems(sub, this.filterOutInactiveTaskCategoryAndSubCategory, this.selectedSubCategoryId);
    },

    selectedTaskCategory(): IOptionItem {
      return this.taskCategories?.filter((t) => t.id === this.selectedTaskCategoryId)[0];
    },

    selectedSubCategory(): IOptionSubItem {
      return this.taskSubCategories.filter((t) => t.id === this.selectedSubCategoryId)[0];
    },

    task(): ITaskEntity {
      return useTaskStore().getById(this.taskId);
    },

    personIsWorkingOn(): string | TranslateResult {
      if (this.task.userWorkingOn) {
        const person = useUserAccountMetadataStore().getById(this.task.userWorkingOn);
        let personInfo = person.displayName;
        personInfo += ` (${this.$m(person.roleName)})`;
        return personInfo;
      }
      return this.$t('common.N/A');
    },

    userId(): string {
      return useUserStore().getUserId();
    },

    assignedTeam(): ITeamEntity {
      return useTeamStore().getById(this.task.assignedTeamId || this.localTask.assignedTeamId);
    },

    canAction(): boolean {
      return this.calculateCanAction();
    },

    canToggleIsWorkingOn(): boolean {
      return this.calculateCanAction(true);
    },

    hasRoleOrLevelAboveZero(): boolean {
     return this.$hasLevel(UserRoles.level1)
          || this.$hasRole(UserRoles.readonly)
          || this.$hasRole(UserRoles.contributor3)
          || this.$hasRole(UserRoles.contributorIM)
          || this.$hasRole(UserRoles.contributorFinance);
    },

    isInAssignedTeam():boolean {
      return this.assignedTeam?.teamMembers?.some((m) => m.id === this.userId) && this.assignedTeam.status === Status.Active;
    },
  },

  watch: {
    'task.userWorkingOn': {
      handler(newValue) {
        if (!newValue) {
          this.isWorkingOn = false;
        }
      },
    },
  },

  methods: {
    async setWorkingOn(isWorkingOn = true) {
      const userId = useUserStore().getUserId();
      try {
        this.toggleLoading = true;
        await useTaskStore().setWorkingOn(this.task.id, this.task.caseFileId, isWorkingOn ? userId : null);
      } finally {
        this.toggleLoading = false;
      }
    },

    async onToggleChange(isWorkingOn: boolean) {
      if (isWorkingOn) {
        await this.setWorkingOn();
      } else {
        const confirmRemove = await this.$confirm({
          title: this.$t('task.task_details.remove_working_on_dialog.title'),
          messages: this.$t('task.task_details.remove_working_on_dialog.content'),
        });
        if (confirmRemove) {
          await this.setWorkingOn(false);
        } else {
          this.isWorkingOn = true;
        }
      }
    },

    async fetchSelectedFAPaymentAndSetName() {
      const res = await useFinancialAssistancePaymentStore().fetch(this.task?.financialAssistancePaymentId);
      if (res) {
        this.financialAssistancePaymentName = res.name;
      }
    },

    async getAssignableTeams() {
      const res = await useTeamStore().getTeamsByEvent({ eventId: (this as any).eventId });
      if (res) {
        this.assignableTeams = res.filter((t) => t.isAssignable);
        this.userIsInEscalationTeam = !!res.find((t) => t.isEscalation)?.teamMembers?.find((m) => this.userId === m.id);
      }
    },

    calculateCanAction(togglingIsWorkingOn = false): boolean {
      if (this.task.taskStatus === TaskStatus.Cancelled && this.task.taskType === TaskType.Personal) {
        return false;
      }

      if (this.$hasLevel(UserRoles.level6)) {
        return !(this.task.taskType === TaskType.Personal && this.task.taskStatus === TaskStatus.Completed);
      }

      if (this.task.taskType === TaskType.Personal) {
        return this.task.createdBy === this.userId && this.task.taskStatus === TaskStatus.InProgress;
      }

      if (!togglingIsWorkingOn && this.task.createdBy === this.userId && (this.task.taskStatus === TaskStatus.New || this.task.taskStatus === TaskStatus.Cancelled)) {
        return true;
      }

    // Team task - for these roles, user needs to be part of the assigned team
      if (this.hasRoleOrLevelAboveZero) {
        return this.isInAssignedTeam;
      }
      // L0, no-role --> false
      return false;
    },

  },
});
