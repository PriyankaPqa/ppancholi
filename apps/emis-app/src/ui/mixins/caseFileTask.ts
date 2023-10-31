import Vue from 'vue';
import { IOptionItem, IOptionSubItem } from '@libs/entities-lib/optionItem';
import { useTaskStore } from '@/pinia/task/task';
import { Status } from '@libs/entities-lib/base';
import { TranslateResult } from 'vue-i18n';
import { useUserAccountMetadataStore } from '@/pinia/user-account/user-account';
import { useUserStore } from '@/pinia/user/user';
import { ITaskEntity } from '@libs/entities-lib/task';

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
    };
  },

  computed: {
    taskNames(): IOptionItem[] {
      return useTaskStore().getTaskCategories(this.filterOutHiddenTaskName);
    },

    taskCategories(): IOptionSubItem[] {
      const sub = this.taskNames?.find((t) => t?.id === this.selectedTaskNameId)?.subitems || [];
      return sub.filter((s) => s.status === Status.Active);
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
