<template>
  <v-row justify="center" class="my-8 rc-body14">
    <v-col md="8" sm="12">
      <v-row class="assigned-to-action justify-space-between align-center mb-6 ml-0 pr-4 mr-0">
        <div class="pl-4 py-2">
          <span class="font-weight-bold">
            {{ $t('task.create_edit.assigned_to') }}
          </span>
          <span data-test="task-assigned-to">
            {{ $t('task.create_edit.assigned_to.me') }}
          </span>
        </div>
        <div v-if="isEditMode" class="pl-0 py-2">
          <v-btn
            color="primary"
            small>
            {{ $t('task.action') }}
          </v-btn>
        </div>
      </v-row>

      <v-row>
        <v-col class="pb-1">
          <v-text-field-with-validation
            v-model="localPersonalTaskForm.name.specifiedOther"
            :rules="rules.personalTaskName"
            :label="$t('task.create_edit.task_name') + ' *'"
            data-test="task-name-personal-task" />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="6" class="py-1">
          <v-date-field-with-validation
            v-model="localPersonalTaskForm.dueDate"
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
import { format } from 'date-fns';
import VDateFieldWithValidation from '@libs/component-lib/components/atoms/VDateFieldWithValidation.vue';
import { IListOption } from '@libs/shared-lib/types';
import { useTaskStore } from '@/pinia/task/task';

interface ILocalPersonalTaskForm {
  name: IListOption;
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
  },

  props: {
    task: {
      type: Object as () => ITaskEntityData,
      required: true,
    },

    isEditMode: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      localPersonalTaskForm: {
        name: { optionItemId: null, specifiedOther: null },
        dueDate: '',
        description: '',
      } as ILocalPersonalTaskForm,
    };
  },

  computed: {
    dueDateRule(): Record<string, unknown> {
      if (this.task.dueDate) {
        return {
          mustBeAfterOrSame: { X: this.task.dueDate, Y: format(Date.now(), 'yyyy-MM-dd') },
        };
      }
      return {};
    },

    rules(): Record<string, unknown> {
      return {
        personalTaskName: {
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
        this.$emit('update:task', {
          ...this.task,
          ...newTaskForm,
        });
      },
      deep: true,
    },
  },

  async created() {
    await useTaskStore().fetchTaskCategories();
    this.localPersonalTaskForm = {
      name: this.task.name,
      description: this.task.description,
      dueDate: this.task.dueDate,
    };
    this.localPersonalTaskForm.name.optionItemId = this.taskNames?.filter((t) => t.isOther && t.subitems.length === 0)[0]?.id;
  },

});
</script>

<style scoped lang="scss">
.assigned-to-action {
  background-color: var(--v-grey-lighten4);
  border-radius: 4px;
}
</style>
