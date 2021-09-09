<template>
  <div class="full-height">
    <div v-if="loading" class="pa-4 full-width">
      <v-skeleton-loader class="mb-4" tile type="table-heading" />
      <v-skeleton-loader tile type="list-item-avatar" />
      <v-skeleton-loader tile type="list-item" />
      <v-skeleton-loader tile type="list-item" />
      <v-skeleton-loader tile type="list-item" />
      <v-skeleton-loader tile type="list-item" />
      <v-skeleton-loader tile type="list-item" />
    </div>

    <div v-else-if="error">
      <error-panel>
        {{ $t('financialAssistance.errors.notFound') }}
      </error-panel>
    </div>

    <rc-page-content v-else :title="title" show-help :help-link="$t('zendesk.help_link.create_financial_assistance_table')" :show-add-button="false">
      <v-container>
        <validation-observer ref="form" v-slot="{ pristine, invalid }" slim>
          {{ watchPristine(pristine) }}
          <v-row class="justify-center">
            <v-col :class="{ 'table-wrapper': isEdit }" cols="12" xl="7" lg="9" md="11" sm="12">
              <rc-tabs>
                <rc-tab
                  v-for="lang in supportedLanguages"
                  :key="lang.key"
                  :label="$t(`tab.${lang.key}`)"
                  :data-test="`financialCreate__lang--${lang.key}`"
                  :active="languageMode === lang.key"
                  :disabled="isEdit && isOperating"
                  @click="setLanguageMode(lang.key)" />
              </rc-tabs>

              <v-row>
                <v-col v-if="isTableMode" cols="12" md="6" lg="5">
                  <v-autocomplete-with-validation
                    v-model="program"
                    :items="programsSorted"
                    :label="$t('financial.associate_program')"
                    :item-text="(item) => $m(item.name)"
                    return-object
                    :disabled="isEdit"
                    :rules="rules.required"
                    data-test="financialCreate__programSelect" />
                </v-col>
              </v-row>

              <v-row>
                <v-col v-if="isCopy" cols="12">
                  <div class="rc-body14 mb-4">
                    {{ $t('financialAssistance.copyMessage') }}
                  </div>

                  <v-autocomplete-with-validation
                    v-model="copyTemplate"
                    :items="existingTemplatesSorted"
                    :label="$t('financialAssistance.copyLabel')"
                    :item-text="(item) => $m(item.name)"
                    return-object
                    :loading="loadingTemplate"
                    :disabled="loadingTemplate"
                    :rules="rules.required"
                    data-test="financialCreate__copySelect" />
                </v-col>

                <v-col cols="9" md="8" sm="7">
                  <v-text-field-with-validation
                    v-model="name"
                    data-test="financial-assistance-name"
                    :disabled="isEdit && isOperating"
                    :label="`${isTableMode ? $t('financial.table_name') : $t('financial.template_name')} *`"
                    :rules="rules.name" />
                </v-col>

                <v-col cols="3" md="4" sm="5">
                  <div v-if="!programInactive" :class="`flex-row financial-status py-2 pl-5 ${getStatusClasses()}`">
                    <span :class="`rc-body14 ${status ? 'white--text' : 'black--text'}`">
                      {{ $t('common.status') }}
                    </span>

                    <span :class="`rc-body14 ${status ? 'white--text' : 'black--text'} ml-4`">
                      {{ status ? $t('enums.financialStatus.Active').toUpperCase() : $t('enums.financialStatus.Inactive').toUpperCase() }}
                    </span>

                    <validation-provider slim>
                      <v-switch
                        v-model="status"
                        class="mt-0 ml-auto mr-3 pt-0"
                        flat
                        :disabled="(isEdit && isOperating)"
                        data-test="financial-assistance-status"
                        hide-details
                        color="white" />
                    </validation-provider>
                  </div>

                  <div v-else class="flex-row financial-status py-2 pl-5 grey lighten-3 black--text">
                    <span class="rc-body14">
                      {{ $t('financialAssistance.programIsInactive') }}
                    </span>
                  </div>
                </v-col>
              </v-row>

              <v-row v-if="isEdit">
                <v-spacer />

                <div class="mr-3 mb-3">
                  <v-btn :disabled="isSaving || isOperating" data-test="financial-assistance-cancel-edit-btn" @click="cancelChanges()">
                    {{ $t('common.buttons.cancel') }}
                  </v-btn>

                  <v-btn
                    class="ml-6"
                    color="primary"
                    data-test="financial-assistance-save-edit-btn"
                    :loading="isSaving"
                    :disabled="pristine || invalid || isOperating"
                    @click="saveEdit">
                    {{ $t('common.buttons.save') }}
                  </v-btn>
                </div>
              </v-row>
            </v-col>
          </v-row>
        </validation-observer>
      </v-container>

      <div class="tableContainer">
        <financial-assistance-items :is-edit="isEdit" :is-table-mode="isTableMode" @form-active="setIsFormActive" />
      </div>

      <template #actions>
        <v-btn v-if="!isEdit" :disabled="isSaving" data-test="financial-assistance-cancelBtn" @click="cancelChanges()">
          {{ $t('common.buttons.cancel') }}
        </v-btn>

        <v-btn
          v-if="!isEdit"
          color="primary"
          data-test="financial-assistance-saveBtn"
          :loading="isSaving"
          :disabled="tableEditActive || !isValidItemsSubItems"
          @click="save">
          {{ $t('common.buttons.create') }}
        </v-btn>

        <v-btn v-if="isEdit" color="primary" :disabled="isOperating" data-test="back-to-financial-assistance-btn" @click="cancelChanges()">
          {{ $t('financialAssistance.back') }}
        </v-btn>
      </template>
    </rc-page-content>

    <confirm-before-action
      data-test="financialCreate__confirmTemplateDialog"
      :show.sync="confirmChangeTemplateDialogVisible"
      :title="$t('common.confirm')"
      :messages="$t('financialAssistance.confirmChangeTemplateMessage')"
      @submit="onSelectCopyTemplate"
      @cancel="onCancelCopyTemplate"
      @close="onCancelCopyTemplate" />

    <confirm-before-action
      ref="confirmLeavePopup"
      :title="$t('confirmLeaveDialog.title')"
      :messages="[$t('confirmLeaveDialog.message_1'), $t('confirmLeaveDialog.message_2')]"
      :show.sync="showConfirm" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import { NavigationGuardNext, Route } from 'vue-router';
import _sortBy from 'lodash/sortBy';
import {
  RcPageContent, RcTabs, RcTab, VTextFieldWithValidation, VAutocompleteWithValidation,
} from '@crctech/component-library';
import helpers from '@/ui/helpers';
import routes from '@/constants/routes';
import { SUPPORTED_LANGUAGES_INFO } from '@/constants/trans';
import { MAX_LENGTH_SM } from '@/constants/validations';
import { IFinancialAssistanceTableEntity, IFinancialAssistanceTableItem } from '@/entities/financial-assistance';
import { IProgramEntity } from '@/entities/program';
import { VForm } from '@/types';
import { Status } from '@/entities/base';
import ConfirmBeforeAction, { ConfirmationDialog } from './ConfirmBeforeAction.vue';
import ErrorPanel from './ErrorPanel.vue';
import FinancialAssistanceItems from './FinancialAssistanceItems.vue';

/**
 * Component used to create or edit financial assistance templates
 */
export default Vue.extend({
  name: 'CreateEditFinancialAssistance',

  components: {
    RcPageContent,
    VTextFieldWithValidation,
    VAutocompleteWithValidation,
    RcTabs,
    RcTab,
    FinancialAssistanceItems,
    ConfirmBeforeAction,
    ErrorPanel,
  },

  async beforeRouteLeave(to: Route, from: Route, next: NavigationGuardNext) {
    const isDirty = this.isEdit ? this.formDirty : this.itemsDirty || this.formDirty;

    if (!isDirty || (isDirty && (await (this.$refs.confirmLeavePopup as ConfirmationDialog).open()))) {
      next();
    }
  },

  data() {
    return {
      languageMode: 'en',
      copyTemplate: null,
      previousCopyTemplate: null,
      existingTemplates: [],
      programs: [] as IProgramEntity[],
      isSaving: false,
      tableEditActive: false,
      confirmChangeTemplateDialogVisible: false,
      loadingTemplate: false,
      loading: true,
      error: false,
      showConfirm: false,
      attemptedSave: false,
      formDirty: false,
    };
  },

  computed: {
    rules() {
      return {
        name: {
          required: true,
          max: MAX_LENGTH_SM,
        },
        required: {
          required: true,
        },
      };
    },

    /**
     * Get the title for the PageContent header
     */
    title(): TranslateResult {
      if (this.isTableMode) {
        if (this.isEdit) {
          return this.$t('financial.edit_table');
        }

        if (this.isCopy) {
          return this.$t('financial.create_table_from_template');
        }

        return this.$t('financial.create_table');
      }

      if (this.isEdit) {
        return this.$t('financial.edit_template');
      }

      return this.$t('financial.create_template');
    },

    supportedLanguages() {
      return SUPPORTED_LANGUAGES_INFO;
    },

    existingTemplatesSorted(): Array<IFinancialAssistanceTableEntity> {
      return _sortBy(this.existingTemplates, (item) => this.$m(item.name));
    },

    programsSorted(): Array<IProgramEntity> {
      return _sortBy(this.programs, (program) => this.$m(program.name));
    },

    /**
     * Returns true if the current route is the copy page, used to show the template dropdown
     */
    isCopy(): boolean {
      return false;
    },

    /**
     * Return true if the current route is the edit page
     */
    isEdit(): boolean {
      return this.$route.name === routes.events.financialAssistance.edit.name;
    },

    /**
     * Return true if this component is being used for financial assistance tables.
     * If false, it is being used for financial assistance templates instead.
     */
    isTableMode(): boolean {
      return true;
    },

    /**
     * Gets or sets the Financial Template name from Vuex
     */
    name: {
      get(): string {
        return this.$storage.financialAssistance.getters.name(this.languageMode);
      },

      set(name: string) {
        this.$storage.financialAssistance.mutations.setName(name, this.languageMode);
      },
    },

    /**
     * Gets or sets the Financial Template status from Vuex
     */
    status: {
      get(): boolean {
        const status = this.$storage.financialAssistance.getters.status();

        return status === Status.Active;
      },

      set(value: boolean) {
        const status = value ? Status.Active : Status.Inactive;

        this.$storage.financialAssistance.mutations.setStatus(status);
      },
    },

    /**
     * Gets or sets the Financial Table Program
     */
    program: {
      get(): IProgramEntity {
        return this.$storage.financialAssistance.getters.program();
      },

      set(value: IProgramEntity) {
        this.$storage.financialAssistance.mutations.setProgram(value);
      },
    },

    itemsDirty: {
      get(): boolean {
        return this.$storage.financialAssistance.getters.dirty();
      },

      set(value: boolean) {
        this.$storage.financialAssistance.mutations.setDirty(value);
      },
    },

    /**
     * Returns true if the program status in Inactive
     */
    programInactive(): boolean {
      return this.program && this.program.status === Status.Inactive;
    },

    /**
     * Returns true if at least one item and sub-item exists in the table
     */
    isValidItemsSubItems(): boolean {
      if (!this.attemptedSave) {
        return true;
      }

      return this.validateItemsAndSubItems();
    },

    isOperating(): boolean {
      return this.$storage.financialAssistance.getters.isOperating();
    },
  },

  watch: {
    /**
     * When the copy template is selected in the dropdown, either show the confirmation dialog if the state is dirty
     * or dispatch the action right away if it is clean
     */
    copyTemplate() {
      // todo
    },
  },

  async created() {
    this.$storage.financialAssistance.mutations.resetState();

    await this.$storage.financialAssistanceCategory.actions.fetchAllIncludingInactive();

    if (this.isEdit) {
      const fa = await this.$storage.financialAssistance.actions.fetch(this.$route.params.faId);
      const categories = this.$storage.financialAssistanceCategory.getters.getAll().map((c) => c.entity);
      const program = await this.$storage.program.actions.fetch({ id: fa.entity.programId, eventId: fa.entity.eventId });
      this.$storage.financialAssistance.mutations.setFinancialAssistance(fa, categories, program.entity);

      this.programs = [this.$storage.financialAssistance.getters.program()];
    } else {
      await this.loadActivePrograms();
    }
    this.loading = false;
  },

  methods: {
    async loadActivePrograms(): Promise<void> {
      const { id } = this.$route.params;

      const res = await this.$storage.program.actions.search({
        filter: {
          'Entity/EventId': id,
          'Entity/Status': Status.Active,
        },
        count: true,
        queryType: 'full',
        searchMode: 'all',
      });

      this.programs = this.$storage.program.getters.getByIds(res.ids).map((combined) => combined.entity);
    },

    /**
     * Dispatches the action to the Vuex module to save the template/table
     * Redirects to the view list page when complete
     */
    async save(): Promise<void> {
      this.attemptedSave = true;

      const isValid = await (this.$refs.form as VForm).validate();

      if (isValid) {
        if (!this.validateItemsAndSubItems()) {
          this.$toasted.global.error(this.$t('financialAssistance.errors.needItemSubItem'));
          return;
        }

        await this.dispatchSaveAction();
      } else {
        helpers.scrollToFirstError('scrollAnchor');
      }
    },

    async saveEdit(): Promise<void> {
      const isValid = await (this.$refs.form as VForm).validate();

      if (isValid) {
        this.isSaving = true;

        const res = await this.$storage.financialAssistance.actions.editFinancialAssistance();

        this.isSaving = false;

        if (res) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          this.$nextTick(() => (this.$refs.form as any).reset());
          this.$toasted.global.success(this.$t('financialAssistance.toast.table.editTable'));
        }
      }
    },

    async dispatchSaveAction(): Promise<void> {
      this.isSaving = true;

      const res = await this.$storage.financialAssistance.actions.createFinancialAssistance(this.isTableMode);

      this.isSaving = false;

      if (res) {
        this.formDirty = false;

        if (this.isTableMode) {
          this.$toasted.global.success(this.$t('financialAssistance.toast.table.createTable'));
          this.$router.replace({ name: routes.events.financialAssistance.home.name });
        } else {
          // todo
        }
      }
    },

    /**
     * Check to see if at least one item/sub-item combo exists
     * Used to enable or disable the save button (cannot save unless you have at least 1 item/sub-item)
     */
    validateItemsAndSubItems() {
      const items = this.$storage.financialAssistance.getters.items();

      if (!items.length) {
        return false;
      }

      let isValid = true;

      items.forEach((item: IFinancialAssistanceTableItem) => {
        if (!item.mainCategory || !item.subItems.length) {
          isValid = false;
        }
      });

      return isValid;
    },

    /**
     * Handles setting the language from the language tab selector
     * Populates missing values in other languages with the value entered in the current language
     */
    setLanguageMode(language: string) {
      const name = this.$storage.financialAssistance.getters.name(language);
      const currentName = this.$storage.financialAssistance.getters.name(this.languageMode);

      if (!name && currentName) {
        this.$storage.financialAssistance.mutations.setName(currentName, language);
      }

      this.languageMode = language;
    },

    /**
     * Handles the event from the FinancialAssistanceItems component that is fired when an add or edit form is shown/hidden
     * Used to enable or disable the save button (cannot click save when a form is open in the table)
     */
    setIsFormActive(active: boolean) {
      this.tableEditActive = active;
    },

    /**
     * Get the CSS classes for the status switch container
     */
    getStatusClasses() {
      if (this.status) {
        return 'status_success white--text';
      }

      return 'grey lighten-3 black--text';
    },

    watchPristine(pristine: boolean) {
      this.formDirty = !pristine;
    },

    /**
     * Event handler for the cancel button, routes back to the page for viewing the list of templates
     */
    cancelChanges(): void {
      if (this.isTableMode) {
        this.$router.replace({ name: routes.events.financialAssistance.home.name });
      }
    },

    showErrorDialog(error: string) {
      this.$message({ title: this.$t('common.error'), message: this.$t(error), submitActionLabel: this.$t('common.close') });
    },

    /**
     * When the user selects a template to copy, dispatch the Vuex action getCopyTemplate
     * which fetches the template details from the API and overwrites the list of items in the store
     */
    async onSelectCopyTemplate() {
      // todo
    },

    /**
     * When the user cancels the dialog to change the copy template, reset it to the previous selection
     */
    onCancelCopyTemplate() {
      this.copyTemplate = this.previousCopyTemplate;
      this.$nextTick(() => {
        this.previousCopyTemplate = null;
        this.confirmChangeTemplateDialogVisible = false;
      });
    },
  },
});
</script>

<style scoped lang="scss">
.table-wrapper {
  border: 1px solid var(--v-grey-lighten2);
  margin-top: 32px;
  margin-bottom: 32px;
  padding: 30px;
  border-radius: 4px;
}

.financial-status {
  border-radius: 4px;
  padding: 8px;
  height: 48px;
}

.tableContainer {
  margin: 0 -16px;
}
</style>
