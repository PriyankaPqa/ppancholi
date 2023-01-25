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

        <h3 class="pa-2 pt-12 rc-heading-5">
          {{ $t('assessment.pending.title') }}
        </h3>
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
            <v-btn v-if="canDelete" icon data-test="delete-link" @click="deleteAssessment(item)">
              <v-icon size="24" color="grey darken-2">
                mdi-delete
              </v-icon>
            </v-btn>
          </template>
        </rc-data-table>

        <h3 class="pa-2 pt-12 rc-heading-5">
          {{ $t('assessment.completed.title') }}
        </h3>
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
              data-test="assessmentDetail-link"
              :to="getAssessmentDetailsRoute(item.id)">
              {{ item.name }}
            </router-link>
          </template>

          <template #[`item.${customColumns.dateAssigned}`]="{ item }">
            {{ item.dateAssignedFormatted }}
          </template>

          <template #[`item.${customColumns.dateModified}`]="{ item }">
            {{ item.dateModifiedFormatted }}
          </template>

          <template #[`item.${customColumns.dateCompleted}`]="{ item }">
            {{ item.dateCompletedFormatted }}
          </template>

          <template #[`item.${customColumns.completionStatus}`]="{ item }">
            <status-chip status-name="AssessmentResponseCompletionStatus" :status="item.completionStatus" />
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
            <v-btn v-if="item.canEdit" icon data-test="edit-link" @click="editAssessment(item)">
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
      :event-id="caseFile.entity.eventId"
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
import { IAzureSearchParams } from '@libs/shared-lib/types';
import sharedHelpers from '@libs/shared-lib/helpers/helpers';
import moment from '@libs/shared-lib/plugins/moment';
import {
  AssociationType, IAssessmentBaseEntity, AssessmentFrequencyType,
  IAssessmentResponseCombined, CompletionStatus, PublishStatus, IAssessmentFormEntity,
  IAssessmentFormMetadata, IAssessmentResponseEntity, IAssessmentResponseMetadata, IdParams,
} from '@libs/entities-lib/assessment-template';
import routes from '@/constants/routes';
import { Status } from '@libs/entities-lib/base';
import { useAssessmentFormMetadataStore, useAssessmentFormStore } from '@/pinia/assessment-form/assessment-form';
import { useAssessmentResponseMetadataStore, useAssessmentResponseStore } from '@/pinia/assessment-response/assessment-response';
import { CombinedStoreFactory } from '@libs/stores-lib/base/combinedStoreFactory';
import { useTenantSettingsStore } from '@/pinia/tenant-settings/tenant-settings';
import { useRegistrationStore } from '@/pinia/registration/registration';
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
      combinedFormStore: new CombinedStoreFactory<IAssessmentFormEntity, IAssessmentFormMetadata, IdParams>(useAssessmentFormStore(), useAssessmentFormMetadataStore()),
      combinedResponseStore:
        new CombinedStoreFactory<IAssessmentResponseEntity, IAssessmentResponseMetadata, IdParams>(useAssessmentResponseStore(), useAssessmentResponseMetadataStore()),
    };
  },

  computed: {
    canAdd(): boolean {
      return this.$hasLevel('level1') && !this.readonly;
    },

    canDelete(): boolean {
      return this.$hasLevel('level1') && !this.readonly;
    },

    items(): IAssessmentResponseCombined[] {
      const items = this.combinedResponseStore.getByIds(
        this.searchResultIds,
        {
          onlyActive: true, prependPinnedItems: true, baseDate: this.searchExecutionDate, parentId: { 'association.id': this.caseFileId },
        },
      );
      return items;
    },

    assessments(): MappedAssessment[] {
      const assessments = useAssessmentFormStore().getByIds(this.items?.map((i) => i.entity.assessmentFormId), false);
      const formAndResponses = this.items.map((r) => ({
        form: assessments.find((i) => r.entity.assessmentFormId === i.id) || {} as IAssessmentBaseEntity,
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
          text: '',
          value: this.customColumns.actions,
          sortable: false,
        },
        {
          text: '',
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
    mapAssessments(formAndResponses: { form: IAssessmentBaseEntity, response: IAssessmentResponseCombined }[]): MappedAssessment[] {
      return formAndResponses.map((r) => ({
        id: r.response.entity.id,
        name: this.$m(r.form?.name) as string,
        nameLowerCase: (this.$m(r.form?.name) as string || '').toLowerCase(),
        dateAssigned: r.response.entity.dateAssigned,
        dateAssignedFormatted: moment(r.response.entity.dateAssigned).format('ll'),
        dateModified: r.response.entity.timestamp as Date,
        dateModifiedFormatted: moment(r.response.entity.timestamp).format('ll'),
        // default to crazy date because _orderBy sorts empty differently then normal BE search
        dateCompleted: r.response.entity.dateCompleted ? new Date(r.response.entity.dateCompleted) : new Date(1950, 0, 1),
        dateCompletedFormatted: r.response.entity.dateCompleted ? moment(r.response.entity.dateCompleted).format('ll') : '',
        completionStatus: r.response.entity.completionStatus,
        formFrequency: r.form?.frequency,
        formId: r.form?.id,
        pinned: r.response.pinned,
        canCopy: !this.readonly && this.$hasLevel('level1') && r.form?.publishStatus === PublishStatus.Published && r.form?.status === Status.Active
          && (r.response.entity.completionStatus === CompletionStatus.Pending || r.response.entity.completionStatus === CompletionStatus.Partial),
        canEdit: !this.readonly && this.$hasLevel('level3') && r.response.entity.completionStatus === CompletionStatus.Completed,
        canLaunch: !this.readonly && this.$hasLevel('level1')
          && (r.response.entity.completionStatus === CompletionStatus.Pending || r.response.entity.completionStatus === CompletionStatus.Partial),
      }));
    },

    async fetchAssessments() {
      if (!this.items?.length) {
        return;
      }

      await this.combinedFormStore.search({
        filter: { 'Entity/Id': { searchIn_az: this.items.map((i) => i.entity.assessmentFormId) || [] } },
        top: 999,
        queryType: 'full',
        searchMode: 'all',
      }, null, true);
    },

    async fetchData(params: IAzureSearchParams) {
      const caseFileFilter = {
        'Entity/Association/Id': this.caseFileId,
        'Entity/Association/Type': AssociationType.CaseFile,
      };

      params.filter = caseFileFilter;

      const res = await this.combinedResponseStore.search({
        filter: params.filter,
        top: 999,
        count: true,
        queryType: 'full',
        searchMode: 'all',
      }, null, true);
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

    editAssessment(item: MappedAssessment) {
      this.$router.push({
        name: routes.caseFile.assessments.edit.name,
        params: { assessmentResponseId: item.id },
      });
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
      const assessment = this.items.find((i) => i.entity.id === item.id);
      const settings = useTenantSettingsStore().currentTenantSettings;
      const member = await this.$services.households.getPerson(this.$storage.household.getters.get(this.caseFile.entity.householdId).entity.primaryBeneficiary);
      const languages = await useRegistrationStore().fetchPreferredLanguages();
      let languageCode = languages.find((l) => l.id === member.contactInformation.preferredLanguage.optionItemId)?.languageCode;
      languageCode = languageCode === 'fr' ? 'fr' : 'en';
      // route is benef website's 'assessment/:eventId/:assessmentTemplateId/:assessmentResponseId'
      navigator.clipboard.writeText(
        `https://${settings.registrationDomain.translation[languageCode]}/${languageCode}/assessment/${this.event.id}/${assessment.entity.assessmentFormId}/${assessment.entity.id}`,
      );
      this.$toasted.global.success(this.$t('assessmentTemplate.copiedLink'));
    },
  },
});
</script>
