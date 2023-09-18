<template>
  <v-row v-if="task" justify="center" class="my-8 rc-body14">
    <v-col md="8" sm="12">
      <v-row class="mb-6 ml-0 align-center">
        <v-checkbox
          v-model="task.isUrgent"
          :label="$t('task.create_edit.urgent')"
          class="ma-0 mt-1"
          data-test="is-urgent-check-box" />

        <template v-if="isEditMode">
          <v-divider vertical class="mx-2" />
          <status-chip
            x-small
            :status="task.taskStatus"
            status-name="TaskStatus"
            data-test="task-status-chip" />
        </template>
      </v-row>

      <v-row class="assigned-to-action justify-space-between align-center mb-6 ml-0 pr-4 mr-0">
        <div class="pl-4 py-2">
          <span class="font-weight-bold">
            {{ $t('task.create_edit.assigned_to') }}
          </span>
          <span data-test="task-assigned-to">
            {{ assignedTeamName }}
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
          <v-select-with-validation
            v-model="localTaskForm.name.optionItemId"
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
            v-model="localTaskForm.category.optionItemId"
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
            v-model="localTaskForm.category.specifiedOther"
            :label="`${$t('common.pleaseSpecify')} *`"
            rows="1"
            :rules="rules.specifyOtherCategory"
            data-test="task-specified-other" />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" class="py-1">
          <v-text-area-with-validation
            v-model="localTaskForm.description"
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

interface LocalTaskForm {
  name: IListOption;
  category: IListOption;
  description: string;
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
    task: {
      type: Object as () => ITaskEntityData,
      required: true,
    },

    isEditMode: {
      type: Boolean,
      default: false,
    },

    assignedTeamName: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      localTaskForm: null as LocalTaskForm,
    };
  },

  computed: {
    shouldDisableCategorySelect(): boolean {
      return !this.localTaskForm.name.optionItemId || this.taskCategories?.length === 0;
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
    localTaskForm: {
      handler(newTaskForm) {
        this.$emit('update:task', {
          ...this.task,
          ...newTaskForm,
        });
      },
      deep: true,
    },
  },

  created() {
    this.localTaskForm = {
      name: this.task.name,
      category: this.task.category,
      description: this.task.description,
    };
  },

  methods: {
    setTaskNameIdAndResetForm() {
      this.selectedTaskNameId = this.localTaskForm.name.optionItemId;
      this.localTaskForm.description = '';
      this.localTaskForm.category.optionItemId = null;
      this.localTaskForm.category.specifiedOther = null;
      this.$emit('reset-form-validation');
    },

    setCategoryIdAndResetSpecifiedOther(categoryId: string) {
      this.selectedCategoryId = categoryId;
      this.localTaskForm.category.specifiedOther = null;
    },
  },
});
</script>

<style scoped lang="scss">
.assigned-to-action {
  background-color: var(--v-grey-lighten4);
  border-radius: 4px;
}

.option-list-description {
  color: var(--v-grey-darken1);
  margin-top: -24px !important;
}
</style>
