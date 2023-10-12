<template>
  <v-row v-if="task" justify="center" class="my-8 rc-body14">
    <v-col>
      <v-row class="mb-6 ml-0 align-center">
        <v-checkbox
          v-model="localTeamTaskForm.isUrgent"
          :label="$t('task.create_edit.urgent')"
          class="ma-0 mt-1"
          data-test="is-urgent-check-box" />

        <template v-if="isEditMode">
          <v-divider vertical class="mx-2" />
          <status-chip
            x-small
            :status="taskData.taskStatus"
            status-name="TaskStatus"
            data-test="task-status-chip" />
        </template>
      </v-row>

      <slot name="actionSection" />

      <v-row>
        <v-col class="pb-1">
          <v-select-with-validation
            v-model="localTeamTaskForm.name.optionItemId"
            :items="taskNames"
            :item-text="(item) => item ? $m(item.name) : null"
            :item-value="(item) => item ? item.id : null"
            :rules="rules.teamTaskName"
            :label="$t('task.create_edit.task_name') + ' *'"
            data-test="task-name-team-task"
            @change="setTaskNameIdAndResetForm($event)" />
          <div v-if="selectedTaskName && $m(selectedTaskName.description)" class="ml-1 mb-4 option-list-description" data-test="task-name-description">
            <v-icon class="mr-1" small>
              mdi-alert-circle
            </v-icon>
            <span>
              {{ $m(selectedTaskName.description) }}
            </span>
          </div>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="6" class="py-1">
          <v-select-with-validation
            v-model="localTeamTaskForm.category.optionItemId"
            :items="taskCategories"
            :item-text="(item) => item ? $m(item.name) : ''"
            :item-value="(item) => item ? item.id : ''"
            :rules="rules.teamTaskCategory"
            :disabled="shouldDisableCategorySelect"
            :label="$t('task.create_edit.task_category') + ' *'"
            data-test="task-category"
            @change="setCategoryIdAndResetSpecifiedOther($event)" />
          <div v-if="selectedCategory && $m(selectedCategory.description)" class="ml-1 mb-4 option-list-description" data-test="task-category-description">
            <v-icon class="mr-1" small>
              mdi-alert-circle
            </v-icon>
            <span>
              {{ $m(selectedCategory.description) }}
            </span>
          </div>
        </v-col>
      </v-row>

      <v-row v-if="selectedCategory && selectedCategory.isOther">
        <v-col cols="6" class="py-2">
          <v-text-field-with-validation
            v-model="localTeamTaskForm.category.specifiedOther"
            :label="`${$t('common.pleaseSpecify')} *`"
            rows="1"
            :rules="rules.specifyOtherCategory"
            data-test="task-specified-other" />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" class="py-1">
          <v-text-area-with-validation
            v-model="localTeamTaskForm.description"
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
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import { VSelectWithValidation, VTextAreaWithValidation, VTextFieldWithValidation } from '@libs/component-lib/components';
import { MAX_LENGTH_LG } from '@libs/shared-lib/constants/validations';
import { IListOption } from '@libs/shared-lib/types';
import { useTaskStore } from '@/pinia/task/task';

interface ILocalTeamTaskForm {
  name: IListOption;
  category: IListOption;
  description: string;
  isUrgent: boolean;
}

export default mixins(caseFileTask).extend({
  name: 'TeamTaskForm',

  components: {
    StatusChip,
    VSelectWithValidation,
    VTextFieldWithValidation,
    VTextAreaWithValidation,
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
      const localTeamTaskForm = {
        name: this.taskData.name,
        category: this.taskData.category,
        description: this.taskData.description,
        isUrgent: this.taskData.isUrgent,
      } as ILocalTeamTaskForm;

      return {
        localTeamTaskForm,
    };
  },

  computed: {
    shouldDisableCategorySelect(): boolean {
      return !this.localTeamTaskForm.name.optionItemId || this.taskCategories?.length === 0;
    },

    rules(): Record<string, unknown> {
      return {
        teamTaskName: {
          required: true,
        },
        teamTaskCategory: {
          required: !this.shouldDisableCategorySelect,
        },
        description: {
          required: true,
          max: MAX_LENGTH_LG,
        },
        specifyOtherCategory: {
          required: true,
        },
      };
    },
  },

  watch: {
    localTeamTaskForm: {
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
    await useTaskStore().fetchTaskCategories();
    if (this.isEditMode) {
      this.selectedTaskNameId = this.taskData.name.optionItemId;
      this.selectedCategoryId = this.taskData.category.optionItemId;
    }
  },

  methods: {
    setTaskNameIdAndResetForm() {
      this.selectedTaskNameId = this.localTeamTaskForm.name.optionItemId;
      this.localTeamTaskForm.description = '';
      this.localTeamTaskForm.category.optionItemId = null;
      this.localTeamTaskForm.category.specifiedOther = null;
      this.$emit('reset-form-validation');
    },

    setCategoryIdAndResetSpecifiedOther(categoryId: string) {
      this.selectedCategoryId = categoryId;
      this.localTeamTaskForm.category.specifiedOther = null;
    },
  },
});
</script>

<style scoped lang="scss">
.option-list-description {
  color: var(--v-grey-darken1);
  margin-top: -24px !important;
}
</style>
