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

export default Vue.extend({
  props: {
    taskId: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      selectedTaskNameId: '',
      selectedCategoryId: '',
      toggleLoading: false,
      isWorkingOn: false,
      filterOutHiddenTaskName: true,
      filterOutInactiveTaskNameAndCategory: true,
      localTask: new TaskEntity(),
    };
  },

  computed: {
    taskNames(): IOptionItem[] {
      return useTaskStore().getTaskName(this.filterOutHiddenTaskName, this.filterOutInactiveTaskNameAndCategory, this.selectedTaskNameId);
    },

    taskCategories(): IOptionSubItem[] {
      const sub = this.taskNames?.find((t) => t?.id === this.selectedTaskNameId)?.subitems || [];
      return useTaskStore().filterAndSortActiveSubItems(sub, this.filterOutInactiveTaskNameAndCategory, this.selectedCategoryId);
    },

    selectedTaskName(): IOptionItem {
      return this.taskNames?.filter((t) => t.id === this.selectedTaskNameId)[0];
    },

    selectedCategory(): IOptionSubItem {
      return this.taskCategories.filter((t) => t.id === this.selectedCategoryId)[0];
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
      if (this.$hasLevel(UserRoles.level6)) {
        return !(this.task.taskType === TaskType.Personal && this.task.taskStatus === TaskStatus.Completed);
      }

      if (this.task.taskType === TaskType.Personal) {
        return this.task.createdBy === this.userId && this.task.taskStatus === TaskStatus.InProgress;
      }

      // Team task - for these roles, user needs to be part of the assigned team
        if (this.$hasLevel(UserRoles.level1)
          || this.$hasRole(UserRoles.readonly)
          || this.$hasRole(UserRoles.contributor3)
          || this.$hasRole(UserRoles.contributorIM)
          || this.$hasRole(UserRoles.contributorFinance)) {
          return this.assignedTeam?.teamMembers?.some((m) => m.id === this.userId) && this.assignedTeam.status === Status.Active;
        }
        // L0, no-role --> false
        return false;
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
  },
});
