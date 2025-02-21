<template>
  <div class="pa-4">
    <div class="dataTable__container elevation-2">
      <v-card>
        <rc-data-table-header
          v-bind="headerOptions"
          :search="options.search"
          :labels="labels.header"
          @update:search="updateSearch">
          <template #headerLeft>
            <rc-tooltip v-if="canAdd" bottom>
              <template #activator="{ on }">
                <v-btn
                  class="mr-3"
                  data-test="table__addButton"
                  fab
                  color="white"
                  :aria-label="labels.header.addButtonLabel"
                  small
                  v-on="on"
                  @click="addAssessment">
                  <v-icon color="primary">
                    mdi-plus
                  </v-icon>
                </v-btn>
              </template>
              {{ labels.header.addButtonLabel }}
            </rc-tooltip>
          </template>
        </rc-data-table-header>

        <div class="pa-2 pt-12 rc-heading-5">
          {{ $t('assessment.pending.title') }}
        </div>
        <rc-data-table
          data-test="pending-assessment-table"
          :items="pendingAssessments"
          :count="pendingAssessments.length"
          :headers="pendingAssessmentsHeaders"
          :hide-header="true"
          :hide-footer="true"
          :table-props="tableProps"
          :options.sync="pendingOptions"
          :custom-columns="Object.values(customColumns)"
          @search="search">
          <template #[`item.${customColumns.name}`]="{ item }">
            {{ item.name }}
          </template>

          <template #[`item.${customColumns.dateAssigned}`]="{ item }">
            {{ item.dateAssignedFormatted }}
          </template>

          <template #[`item.${customColumns.completionStatus}`]="{ item }">
            <status-chip status-name="AssessmentResponseCompletionStatus" :status="item.completionStatus" />
          </template>

          <template #[`item.${customColumns.actions}`]="{ item }">
            <div class="d-flex">
              <v-btn v-if="item.canLaunch" data-test="start-link" color="primary" class="mr-2" @click="launchAssessment(item)">
                {{ $t('assessmentResponse.start') }}
              </v-btn>
              <v-btn v-if="item.canCopy" data-test="copy-link" @click="copyLink(item)">
                <v-icon size="18" color="grey darken-2">
                  mdi-content-copy
                </v-icon>
                {{ $t('assessmentResponse.copyLink') }}
              </v-btn>
            </div>
          </template>

          <template #[`item.${customColumns.actions_icons}`]="{ item }">
            <v-btn v-if="canDelete" icon data-test="delete-link" :aria-label="$t('common.delete')" @click="deleteAssessment(item)">
              <v-icon size="24" color="grey darken-2">
                mdi-delete
              </v-icon>
            </v-btn>
          </template>
        </rc-data-table>

        <div class="pa-2 pt-12 rc-heading-5">
          {{ $t('assessment.completed.title') }}
        </div>
        <rc-data-table
          data-test="completed-assessment-table"
          :items="completedAssessments"
          :count="completedAssessments.length"
          :headers="completedAssessmentsHeaders"
          :hide-header="true"
          :hide-footer="true"
          :table-props="tableProps"
          :options.sync="completedOptions"
          :custom-columns="Object.values(customColumns)"
          @search="search">
          <template #[`item.${customColumns.name}`]="{ item }">
            <router-link
              class="rc-link14 font-weight-bold pr-1"
              :data-test="`assessmentDetail-link-${item.id}`"
              :to="getAssessmentDetailsRoute(item.id)">
              {{ item.name }}
            </router-link>
          </template>

          <template #[`item.${customColumns.dateAssigned}`]="{ item }">
            <span data-test="date-assigned">
              {{ item.dateAssignedFormatted }}
            </span>
          </template>

          <template #[`item.${customColumns.dateModified}`]="{ item }">
            <span data-test="date-modified">
              {{ item.dateModifiedFormatted }}
            </span>
          </template>

          <template #[`item.${customColumns.dateCompleted}`]="{ item }">
            <span data-test="date-completed">
              {{ item.dateCompletedFormatted }}
            </span>
          </template>

          <template #[`item.${customColumns.completionStatus}`]="{ item }">
            <status-chip :data-test="`assessmentDetail-status-${item.id}`" status-name="AssessmentResponseCompletionStatus" :status="item.completionStatus" />
          </template>

          <template #[`item.${customColumns.actions}`]="{ item }">
            <div class="d-flex">
              <v-btn v-if="item.canLaunch" data-test="resume-link" color="primary" class="mr-2" @click="launchAssessment(item)">
                {{ $t('assessmentResponse.resume') }}
              </v-btn>
              <v-btn v-if="item.canCopy" data-test="copy-link" @click="copyLink(item)">
                <v-icon size="18" color="grey darken-2">
                  mdi-content-copy
                </v-icon>
                {{ $t('assessmentResponse.copyLink') }}
              </v-btn>
            </div>
          </template>

          <template #[`item.${customColumns.actions_icons}`]="{ item }">
            <v-btn v-if="item.canEdit" icon data-test="edit-link" :aria-label="$t('common.edit')" @click="launchAssessment(item)">
              <v-icon size="24" color="grey darken-2">
                mdi-pencil
              </v-icon>
            </v-btn>
          </template>
        </rc-data-table>
      </v-card>
    </div>

    <add-case-file-assessment
      v-if="showAddPopup"
      data-test="add-cfa"
      :show.sync="showAddPopup"
      :case-file-id="caseFileId"
      :event-id="caseFile.eventId"
      :excluded-ids="oneTimeAssessmentsIds" />
  </div>
</template>

<script lang="ts">
import _orderBy from 'lodash/orderBy';
import _cloneDeep from 'lodash/cloneDeep';
import { DataTableHeader } from 'vuetify';
import mixins from 'vue-typed-mixins';
import { RcDataTable, RcDataTableHeader, RcTooltip } from '@libs/component-lib/components';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import { ISearchParams, Status } from '@libs/shared-lib/types';
import sharedHelpers from '@libs/shared-lib/helpers/helpers';
import {
  AssociationType, IAssessmentBaseEntity, AssessmentFrequencyType, CompletionStatus, PublishStatus, IAssessmentResponseEntity,
} from '@libs/entities-lib/assessment-template';
import routes from '@/constants/routes';
import { useAssessmentFormStore } from '@/pinia/assessment-form/assessment-form';
import { useAssessmentResponseStore } from '@/pinia/assessment-response/assessment-response';
import { useTenantSettingsStore } from '@/pinia/tenant-settings/tenant-settings';
import { useRegistrationStore } from '@/pinia/registration/registration';
import { useHouseholdStore } from '@/pinia/household/household';
import { UserRoles } from '@libs/entities-lib/user';
import { format } from 'date-fns';
import { EFilterKeyType } from '@libs/component-lib/types';
import caseFileDetail from '../caseFileDetail';
import AddCaseFileAssessment from './components/AddCaseFileAssessment.vue';

interface MappedAssessment {
  id: string,
  formId: string,
  name: string,
  nameLowerCase: string,
  dateAssigned: Date,
  dateAssignedFormatted: string,
  dateModified: Date,
  dateModifiedFormatted: string,
  dateCompleted: Date,
  dateCompletedFormatted: string,
  completionStatus: CompletionStatus,
  formFrequency: AssessmentFrequencyType,
  pinned: boolean,
  canEdit: boolean,
  canLaunch: boolean,
  canCopy: boolean,
}

export default mixins(TablePaginationSearchMixin, caseFileDetail).extend({
  name: 'CaseFileAssessment',

  components: {
    RcDataTable,
    RcDataTableHeader,
    RcTooltip,
    StatusChip,
    AddCaseFileAssessment,
  },

  data() {
    return {
      headerOptions: {
        color: 'primary darken-1',
        dark: true,
        height: 56,
      },
      pendingOptions: {
        search: '',
        sortBy: ['name'],
        sortDesc: [false],
      },
      completedOptions: {
        search: '',
        sortBy: ['name'],
        sortDesc: [false],
      },
      tableProps: {
        itemClass: (item: MappedAssessment) => (item.pinned ? 'pinned' : ''),
      },
      showAddPopup: false,
    };
  },

  computed: {
    canAdd(): boolean {
      return this.$hasLevel(UserRoles.level0) && !this.readonly;
    },

    canDelete(): boolean {
      return this.$hasLevel(UserRoles.level1) && !this.readonly;
    },

    items(): IAssessmentResponseEntity[] {
      const items = useAssessmentResponseStore().getByIdsWithPinnedItems(
        this.searchResultIds,
        {
          onlyActive: true, baseDate: this.searchExecutionDate, parentId: { 'association.id': this.caseFileId },
        },
      );
      return items;
    },

    assessments(): MappedAssessment[] {
      const assessments = useAssessmentFormStore().getByIds(this.items?.map((i) => i.assessmentFormId), false);
      const formAndResponses = this.items.map((r) => ({
        form: assessments.find((i) => r.assessmentFormId === i.id) || {} as IAssessmentBaseEntity,
        response: r,
      }));
      return this.mapAssessments(formAndResponses);
    },

    pendingAssessments(): MappedAssessment[] {
      const items = sharedHelpers.filterCollectionByValue(
        this.assessments.filter((a) => a.completionStatus === CompletionStatus.Pending),
        this.pendingOptions.search,
        false,
        ['name'],
      );
      return _orderBy(items, ['pinned', this.pendingOptions.sortBy[0]], ['desc', this.pendingOptions.sortDesc[0] ? 'desc' : 'asc']);
    },

    completedAssessments(): MappedAssessment[] {
      const items = sharedHelpers.filterCollectionByValue(
        this.assessments.filter((a) => a.completionStatus !== CompletionStatus.Pending),
        this.completedOptions.search,
        false,
        ['name'],
      );
      return _orderBy(items, ['pinned', this.completedOptions.sortBy[0]], ['desc', this.completedOptions.sortDesc[0] ? 'desc' : 'asc']);
    },

    oneTimeAssessmentsIds(): string[] {
      return this.assessments.filter((a) => a.formFrequency === AssessmentFrequencyType.OneTime).map((e) => e.formId);
    },

    customColumns(): Record<string, string> {
      return {
        name: 'nameLowerCase',
        dateAssigned: 'dateAssigned',
        dateModified: 'dateModified',
        completionStatus: 'completionStatus',
        dateCompleted: 'dateCompleted',
        actions: 'actions',
        actions_icons: 'actions_icons',
      };
    },

    pendingAssessmentsHeaders(): Array<DataTableHeader> {
      const headers = [
        {
          text: this.$t('common.name') as string,
          value: this.customColumns.name,
          width: '100%',
        },
        {
          text: this.$t('assessmentResponse.dateAssigned') as string,
          value: this.customColumns.dateAssigned,
          width: '150px',
        },
        {
          text: this.$t('common.status') as string,
          value: this.customColumns.completionStatus,
          sortable: false,
          width: '50px',
        },
        {
          text: this.$t('task.action') as string,
          class: 'rc-transparent-text',
          value: this.customColumns.actions,
          sortable: false,
        },
        {
          text: this.$t('task.action') as string,
          class: 'rc-transparent-text',
          value: this.customColumns.actions_icons,
          sortable: false,
          width: '30px',
        },
      ];

      return headers;
    },

    completedAssessmentsHeaders(): Array<DataTableHeader> {
      const headers = _cloneDeep(this.pendingAssessmentsHeaders);

      headers.splice(2, 0, {
        text: this.$t('assessmentResponse.dateModified') as string,
        value: this.customColumns.dateModified,
        sortable: true,
        width: '150px',
      });

      headers.splice(3, 0, {
        text: this.$t('assessmentResponse.dateCompleted') as string,
        value: this.customColumns.dateCompleted,
        sortable: true,
        width: '180px',
      });

      return headers;
    },

    labels(): Record<string, unknown> {
      return {
        header: {
          title: this.$t('assessments.title'),
          searchPlaceholder: this.$t('common.inputs.quick_search'),
          addButtonLabel: this.$t('assessmentTemplate.add_assessment'),
        },
      };
    },
  },

  async created() {
    this.saveState = false;
    this.loadState();
  },

  watch: {
    items() {
      this.fetchAssessments();
    },
  },

  methods: {
    mapAssessments(formAndResponses: { form: IAssessmentBaseEntity, response: IAssessmentResponseEntity }[]): MappedAssessment[] {
      return formAndResponses.map((r) => ({
        id: r.response.id,
        name: this.$m(r.form?.name) as string,
        nameLowerCase: (this.$m(r.form?.name) as string || '').toLowerCase(),
        dateAssigned: r.response.dateAssigned,
        dateAssignedFormatted: format(new Date(r.response.dateAssigned), 'PP'),
        dateModified: r.response.timestamp as Date,
        dateModifiedFormatted: format(new Date(r.response.timestamp), 'PP'),
        // default to crazy date because _orderBy sorts empty differently then normal BE search
        dateCompleted: r.response.dateCompleted ? new Date(r.response.dateCompleted) : new Date(1950, 0, 1),
        dateCompletedFormatted: r.response.dateCompleted ? format(new Date(r.response.dateCompleted), 'PP') : '',
        completionStatus: r.response.completionStatus,
        formFrequency: r.form?.frequency,
        formId: r.form?.id,
        pinned: r.response.pinned,
        canCopy: !this.readonly && this.$hasLevel(UserRoles.level1) && r.form?.publishStatus === PublishStatus.Published && r.form?.status === Status.Active
          && (r.response.completionStatus === CompletionStatus.Pending || r.response.completionStatus === CompletionStatus.Partial),
        canEdit: !this.readonly && this.$hasLevel(UserRoles.level3) && r.response.completionStatus === CompletionStatus.Completed,
        canLaunch: !this.readonly && this.$hasLevel(UserRoles.level0)
          && (r.response.completionStatus === CompletionStatus.Pending || r.response.completionStatus === CompletionStatus.Partial),
      }));
    },

    async fetchAssessments() {
      if (!this.items?.length) {
        return;
      }

      await useAssessmentFormStore().search({ params: {
        filter: { 'Entity/Id': { in: this.items.map((i) => i.assessmentFormId) || [] } },
        top: 999,
      },
      includeInactiveItems: true });
    },

    async fetchData(params: ISearchParams) {
      const caseFileFilter = {
        'Entity/Association/Id': { value: this.caseFileId, type: EFilterKeyType.Guid },
        'Entity/Association/Type': sharedHelpers.getEnumKeyText(AssociationType, AssociationType.CaseFile),
      };

      params.filter = caseFileFilter;

      const res = await useAssessmentResponseStore().search({ params: {
        filter: params.filter,
        top: 999,
        count: true,
      },
      includeInactiveItems: true });
      return res;
    },

    addAssessment() {
      this.showAddPopup = true;
    },

    updateSearch($event: string) {
      this.pendingOptions.search = $event;
      this.completedOptions.search = $event;
    },

    getAssessmentDetailsRoute(id: string) {
      return {
        name: routes.caseFile.assessments.details.name,
        params: {
          assessmentResponseId: id,
        },
      };
    },

    async deleteAssessment(item: MappedAssessment) {
      const doDelete = await this.$confirm({
        title: this.$t('assessmentResponse.confirm.delete.title'),
        messages: this.$t('assessmentResponse.confirm.delete.message'),
      });

      if (doDelete) {
        if (await useAssessmentResponseStore().deactivate(item)) {
          this.$toasted.global.success(this.$t('assessmentResponse.delete.success'));
        }
      }
    },

    launchAssessment(item: MappedAssessment) {
      const routeData = this.$router.resolve({
        name: routes.events.assessments.complete.name,
        params: {
          assessmentTemplateId: item.formId,
          id: this.event.id,
          assessmentResponseId: item.id,
        },
      });
      window.open(routeData.href, '_blank');
    },

    async copyLink(item: MappedAssessment) {
      const assessment = this.items.find((i) => i.id === item.id);
      const settings = useTenantSettingsStore().currentTenantSettings;
      const primaryBeneficiary = useHouseholdStore().getById(this.caseFile.householdId).primaryBeneficiary;
      const member = await this.$services.households.getPerson(primaryBeneficiary);
      const languages = await useRegistrationStore().fetchPreferredLanguages();
      let languageCode = languages.find((l) => l.id === member.contactInformation.preferredLanguage.optionItemId)?.languageCode;
      languageCode = languageCode === 'fr' ? 'fr' : 'en';
      // route is benef website's 'assessment/:eventId/:assessmentTemplateId/:assessmentResponseId'
      navigator.clipboard.writeText(
        `https://${settings.registrationDomain.translation[languageCode]}/${languageCode}/assessment/${this.event.id}/${assessment.assessmentFormId}/${assessment.id}`,
      );
      this.$toasted.global.success(this.$t('assessmentTemplate.copiedLink'));
    },
  },
});
</script>
