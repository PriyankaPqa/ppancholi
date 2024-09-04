<template>
  <v-row v-if="task" justify="center" class="rc-body14">
    <v-col>
      <v-row class="mb-6 ml-0 align-center">
        <v-checkbox
          v-model="localTeamTaskForm.isUrgent"
          :label="$t('task.create_edit.urgent')"
          class="ma-0 mt-1"
          :disabled="formDisabled"
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
            v-model="localTeamTaskForm.category.optionItemId"
            :items="taskCategories"
            :item-text="(item) => item ? $m(item.name) : null"
            :item-value="(item) => item ? item.id : null"
            :rules="rules.teamTaskCategory"
            :label="$t('task.task_category') + ' *'"
            :disabled="formDisabled || lockCategory"
            data-test="task-category-team-task"
            @change="setTaskCategoryIdAndResetForm($event)" />
          <div v-if="selectedTaskCategory && $m(selectedTaskCategory.description)" class="ml-1 mb-4 option-list-description" data-test="task-category-description">
            <v-icon class="mr-1" small>
              mdi-alert-circle
            </v-icon>
            <span>
              {{ $m(selectedTaskCategory.description) }}
            </span>
          </div>
        </v-col>
      </v-row>

      <v-row v-if="selectedTaskCategory && selectedTaskCategory.isRelatedToFinancialAssistance">
        <v-col class="pb-1">
          <v-autocomplete-with-validation
            v-model="localTeamTaskForm.financialAssistancePaymentId"
            background-color="white"
            outlined
            :items="financialAssistancePayments"
            :item-text="getFAName"
            :item-value="(item) => item && item.id"
            :loading="loading"
            async-mode
            :attach="true"
            :label="$t('caseFileActivity.activityList.title.FinancialAssistancePayment')"
            data-test="create-edit-task-FA-select"
            v-bind="$attrs"
            clearable
            @change="$emit('change', $event)"
            @delete="$emit('delete', $event)" />
        </v-col>
      </v-row>

      <v-row v-if="shouldDisplaySubCategorySelect">
        <v-col cols="6" class="py-1">
          <v-select-with-validation
            v-model="localTeamTaskForm.subCategory.optionItemId"
            :items="taskSubCategories"
            :item-text="(item) => item ? $m(item.name) : ''"
            :item-value="(item) => item ? item.id : ''"
            :rules="rules.teamTaskSubCategory"
            :disabled="formDisabled"
            :label="$t('task.task_sub_category') + ' *'"
            data-test="task-sub-category"
            @change="setSubCategoryIdAndResetSpecifiedOther($event)" />
          <div v-if="selectedSubCategory && $m(selectedSubCategory.description)" class="ml-1 mb-4 option-list-description" data-test="task-sub-category-description">
            <v-icon class="mr-1" small>
              mdi-alert-circle
            </v-icon>
            <span>
              {{ $m(selectedSubCategory.description) }}
            </span>
          </div>
        </v-col>
      </v-row>

      <v-row v-if="selectedSubCategory && selectedSubCategory.isOther">
        <v-col cols="6" class="py-2">
          <v-text-field-with-validation
            v-model="localTeamTaskForm.subCategory.specifiedOther"
            :label="`${$t('common.pleaseSpecify')} *`"
            rows="1"
            :rules="rules.specifyOtherSubCategory"
            :disabled="formDisabled"
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
            :disabled="formDisabled"
            data-test="task-description" />
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import caseFileTask from '@/ui/mixins/caseFileTask';
import mixins from 'vue-typed-mixins';
import { ITaskEntityData, TaskStatus } from '@libs/entities-lib/task';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import { VAutocompleteWithValidation, VSelectWithValidation, VTextAreaWithValidation, VTextFieldWithValidation } from '@libs/component-lib/components';
import { MAX_LENGTH_LG } from '@libs/shared-lib/constants/validations';
import { IListOption } from '@libs/shared-lib/types';
import { useTaskStore } from '@/pinia/task/task';
import { UserRoles } from '@libs/entities-lib/user';
import { IFinancialAssistancePaymentEntity } from '@libs/entities-lib/financial-assistance-payment';
import { useFinancialAssistancePaymentStore } from '@/pinia/financial-assistance-payment/financial-assistance-payment';
import { EFilterKeyType } from '@libs/component-lib/types';

interface ILocalTeamTaskForm {
  category: IListOption;
  subCategory: IListOption;
  description: string;
  isUrgent: boolean;
  financialAssistancePaymentId: string;
}

export default mixins(caseFileTask).extend({
  name: 'TeamTaskForm',

  components: {
    StatusChip,
    VSelectWithValidation,
    VTextFieldWithValidation,
    VTextAreaWithValidation,
    VAutocompleteWithValidation,
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

    caseFileId: {
      type: String,
      required: true,
    },

    lockCategory: {
      type: Boolean,
      default: false,
    },
  },

  data() {
      const localTeamTaskForm = {
        category: this.taskData.category,
        subCategory: this.taskData.subCategory,
        description: this.taskData.description,
        isUrgent: this.taskData.isUrgent,
        financialAssistancePaymentId: this.taskData.financialAssistancePaymentId,
      } as ILocalTeamTaskForm;

      return {
        localTeamTaskForm,
        loading: false,
        financialAssistancePayments: [] as IFinancialAssistancePaymentEntity[],
    };
  },

  computed: {
    shouldDisplaySubCategorySelect(): boolean {
      return !!this.localTeamTaskForm.category.optionItemId && this.taskSubCategories?.length !== 0;
    },

    rules(): Record<string, unknown> {
      return {
        teamTaskCategory: {
          required: true,
        },
        teamTaskSubCategory: {
          required: this.shouldDisplaySubCategorySelect,
        },
        description: {
          required: true,
          max: MAX_LENGTH_LG,
        },
        specifyOtherSubCategory: {
          required: true,
        },
      };
    },

    formDisabled(): boolean {
      return !this.$hasLevel(UserRoles.level6) && this.taskData.taskStatus === TaskStatus.Completed;
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
    await this.fetchFAPayments();
    this.selectedTaskCategoryId = this.taskData?.category?.optionItemId || '';
    this.selectedSubCategoryId = this.taskData?.subCategory?.optionItemId || '';
    this.localTeamTaskForm.financialAssistancePaymentId = this.taskData?.financialAssistancePaymentId;
  },

  methods: {
    setTaskCategoryIdAndResetForm() {
      this.selectedTaskCategoryId = this.localTeamTaskForm.category.optionItemId;
      this.localTeamTaskForm.description = '';
      this.localTeamTaskForm.subCategory.optionItemId = null;
      this.localTeamTaskForm.subCategory.specifiedOther = null;
      this.localTeamTaskForm.financialAssistancePaymentId = null;
      this.$emit('reset-form-validation');
    },

    setSubCategoryIdAndResetSpecifiedOther(subCategoryId: string) {
      this.selectedSubCategoryId = subCategoryId;
      this.localTeamTaskForm.subCategory.specifiedOther = null;
    },

    getFAName(item: IFinancialAssistancePaymentEntity): string {
      if (item?.name) {
        return item.name;
      }
      return '';
    },

    async fetchFAPayments() {
      this.loading = true;

      const params = {
        filter: {
          Entity: {
            CaseFileId: { value: this.caseFileId, type: EFilterKeyType.Guid },
          },
        },
      };

      const res = await useFinancialAssistancePaymentStore().search({ params, includeInactiveItems: true });

      this.financialAssistancePayments = res?.values;
      this.loading = false;
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
