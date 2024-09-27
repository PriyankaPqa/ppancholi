<template>
  <v-row justify="center" class="rc-body14">
    <v-col>
      <v-row v-if="isEditMode" class="mb-6 ml-0 align-center">
        <status-chip
          x-small
          :status="taskData.taskStatus"
          status-name="TaskStatus"
          data-test="task-status-chip" />
      </v-row>

      <slot name="actionSection" />

      <v-row>
        <v-col class="pb-1">
          <v-text-field-with-validation
            v-model="localPersonalTaskForm.category.specifiedOther"
            :rules="rules.personalTaskCategory"
            :label="$t('task.task_category') + ' *'"
            data-test="task-category-personal-task" />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="6" class="py-1">
          <v-date-field-with-validation
            v-model="localPersonalTaskForm.dueDate"
            :locale="$i18n.locale"
            :prepend-inner-icon="'mdi-calendar'"
            :rules="rules.dueDate"
            :label="$t('task.create_edit.due_date') + ' *'"
            data-test="task-due-date" />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" class="py-1">
          <v-text-area-with-validation
            v-model="localPersonalTaskForm.description"
            :rules="rules.description"
            :label="$t('task.create_edit.task_description') + ' *'"
            rows="4"
            data-test="task-description" />
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import caseFileTask from '@/ui/mixins/caseFileTask';
import mixins from 'vue-typed-mixins';
import { ITaskEntityData } from '@libs/entities-lib/task';
import { VSelectWithValidation, VTextAreaWithValidation, VTextFieldWithValidation } from '@libs/component-lib/components';
import { MAX_LENGTH_LG, MAX_LENGTH_MD } from '@libs/shared-lib/constants/validations';
import VDateFieldWithValidation from '@libs/component-lib/components/atoms/VDateFieldWithValidation.vue';
import { IListOption } from '@libs/shared-lib/types';
import { useTaskStore } from '@/pinia/task/task';
import helpers from '@/ui/helpers/helpers';
import StatusChip from '@/ui/shared-components/StatusChip.vue';

interface ILocalPersonalTaskForm {
  category: IListOption;
  description: string;
  dueDate: string | Date;
}

export default mixins(caseFileTask).extend({
  name: 'PersonalTaskForm',

  components: {
    VSelectWithValidation,
    VTextFieldWithValidation,
    VTextAreaWithValidation,
    VDateFieldWithValidation,
    StatusChip,
  },

  props: {
    taskData: {
      type: Object as () => ITaskEntityData,
      required: true,
    },

    isEditMode: {
      type: Boolean,
      default: false,
    },
  },

  data() {
      const localPersonalTaskForm = {
        category: this.taskData.category,
        dueDate: helpers.getLocalStringDate(this.taskData.dueDate, 'Task.dueDate'),
        description: this.taskData.description,
      } as ILocalPersonalTaskForm;
      return {
      localPersonalTaskForm,
    };
  },

  computed: {
    dueDateRule(): Record<string, unknown> {
      if (this.taskData.dueDate) {
        return {
          mustBeAfterOrSame: { X: helpers.getLocalStringDate(this.taskData.dueDate, 'Task.dueDate'), Y: helpers.getLocalStringDate(new Date(), 'local') },
        };
      }
      return {};
    },

    rules(): Record<string, unknown> {
      return {
        personalTaskCategory: {
          required: true,
          max: MAX_LENGTH_MD,
        },
        description: {
          required: true,
          max: MAX_LENGTH_LG,
        },
        dueDate: {
          ...this.dueDateRule,
          required: true,
        },
      };
    },
  },

  watch: {
    localPersonalTaskForm: {
      handler(newTaskForm) {
        this.$emit('update:taskData', {
          ...this.taskData,
          ...newTaskForm,
        });
      },
      deep: true,
    },
  },

  async created() {
    this.filterOutHiddenTaskCategory = false;
    await useTaskStore().fetchTaskCategories();
    this.localPersonalTaskForm.category.optionItemId = this.taskCategories?.filter((t) => t.isOther && t.subitems.length === 0)[0]?.id;
  },
});
</script>
