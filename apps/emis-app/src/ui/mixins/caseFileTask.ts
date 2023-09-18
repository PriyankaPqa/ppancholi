import Vue from 'vue';
import { IOptionItem, IOptionSubItem } from '@libs/entities-lib/optionItem';
import { useTaskStore } from '@/pinia/task/task';
import { Status } from '@libs/entities-lib/base';

export default Vue.extend({
  data() {
    return {
      selectedTaskNameId: '',
      selectedCategoryId: '',
    };
  },

  computed: {
    taskNames(): IOptionItem[] {
      return useTaskStore().getTaskCategories();
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
  },
});
