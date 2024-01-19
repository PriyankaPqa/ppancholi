<template>
  <rc-dialog
    :title="$t('massAction.caseFileStatus.table.add.list')"
    :show.sync="show"
    :cancel-action-label="$t('common.buttons.cancel')"
    :submit-action-label="$t('common.buttons.next')"
    :submit-button-disabled="!filtersOn || tableData.length === 0"
    :loading="fetchAllCaseFileLoading"
    :persistent="true"
    fullscreen
    content-padding="0"
    @cancel="onCancel()"
    @close="onClose()"
    @submit="onSubmit()">
    <rc-data-table
      class="massAction__caseFile_table"
      hide-header
      :hide-footer="itemsCount === 0"
      :items="tableData"
      :count="itemsCount"
      :table-props="tableProps"
      :headers="headers"
      :custom-columns="Object.values(customColumns)"
      :options.sync="options"
      data-test="massAction_caseFile_table"
      @search="search">
      <template #filter>
        <filter-toolbar
          :filter-key="FilterKey.MassActionCaseFileStatus"
          :count="itemsCount"
          :filter-options="filters"
          @update:appliedFilter="onApplyFilter"
          @update:autocomplete="onAutoCompleteUpdate($event)"
          @load:filter="throttleOnLoadFilter($event)">
          <template #toolbarActions>
            <v-btn
              data-test="export"
              class="export"
              color="primary"
              :loading="exportLoading"
              :disabled="(!filtersOn || tableData.length === 0)"
              @click="onExport(MassActionType.CaseFileStatus)">
              {{ $t('massAction.common.export') }}
            </v-btn>
          </template>
        </filter-toolbar>
      </template>

      <template #no-data>
        <div v-if="!filtersOn" class="no-data">
          <i18n path="massAction.use.filter" tag="div" for="edit">
            <v-icon>
              mdi-filter-variant
            </v-icon>
          </i18n>
        </div>
      </template>

      <template #[`item.${customColumns.caseFileNumber}`]="{ item: caseFile }">
        {{ caseFile.entity.caseFileNumber }}
      </template>

      <template #[`item.${customColumns.firstName}`]="{ item: caseFile }">
        {{ caseFile.metadata.primaryBeneficiary
          && caseFile.metadata.primaryBeneficiary.identitySet && caseFile.metadata.primaryBeneficiary.identitySet.firstName }}
      </template>

      <template #[`item.${customColumns.lastName}`]="{ item: caseFile }">
        {{ caseFile.metadata.primaryBeneficiary
          && caseFile.metadata.primaryBeneficiary.identitySet && caseFile.metadata.primaryBeneficiary.identitySet.lastName }}
      </template>

      <template #[`item.${customColumns.status}`]="{ item: caseFile }">
        <status-chip status-name="CaseFileStatus" :status="caseFile.entity.caseFileStatus" />
      </template>

      <template #[`item.${customColumns.lastActionDate}`]="{ item: caseFile }">
        {{ getLocalStringDate(caseFile.metadata.lastActionDate, 'Entity.created', 'PP') }}
      </template>

      <template #[`item.${customColumns.created}`]="{ item: caseFile }">
        {{ getLocalStringDate(caseFile.entity.created, 'Entity.created', 'PP') }}
      </template>

      <template #[`item.${customColumns.tags}`]="{ item: caseFile }">
        <div class="tags-column">
          {{ getTags(caseFile.entity.tags) }}
        </div>
      </template>
    </rc-data-table>
  </rc-dialog>
</template>

<script lang="ts">
import mixins from 'vue-typed-mixins';
import { RcDialog, RcDataTable } from '@libs/component-lib/components';
import routes from '@/constants/routes';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import { useCaseFileStore } from '@/pinia/case-file/case-file';
import massActionCaseFileFiltering from '@/ui/views/pages/mass-actions/mixins/massActionCaseFileFiltering';
import { MassActionMode, MassActionType } from '@libs/entities-lib/mass-action';
import { IListOption } from '@libs/shared-lib/types';
import { IOptionItem } from '@libs/entities-lib/optionItem';
import helpers from '@/ui/helpers/helpers';
import {
  EFilterType, IFilterSettings,
} from '@libs/component-lib/types';
import { FilterKey } from '@libs/entities-lib/user-account';
import { CaseFileStatus } from '@libs/entities-lib/case-file';

import { DataTableHeader } from 'vuetify';
import { UserRoles } from '@libs/entities-lib/user';
import FilterToolbar from '@/ui/shared-components/FilterToolbar.vue';

export default mixins(massActionCaseFileFiltering).extend({

  name: 'CaseFileStatusMassActionFiltering',

  components: {
    RcDialog,
    RcDataTable,
    StatusChip,
    FilterToolbar,
  },

  data() {
    return {
      FilterKey,
      MassActionType,
      getLocalStringDate: helpers.getLocalStringDate,
      openEventsOnly: !this.$hasLevel(UserRoles.level6), // used in the eventFilter mixin
    };
  },

  computed: {
    customColumns(): Record<string, string> {
      return {
        caseFileNumber: 'Entity/CaseFileNumber',
        firstName: 'Metadata/PrimaryBeneficiary/IdentitySet/FirstName',
        lastName: 'Metadata/PrimaryBeneficiary/IdentitySet/LastName',
        status: `Metadata/CaseFileStatusName/Translation/${this.$i18n.locale}`,
        lastActionDate: 'Metadata/LastActionDate',
        created: 'Entity/Created',
        tags: 'Entity/Tags',
      };
    },

    headers(): Array<DataTableHeader> {
      return [
        {
          text: this.$t('massAction.caseFileStatus.table.header.caseFileNumber') as string,
          align: 'start',
          sortable: true,
          value: this.customColumns.caseFileNumber,
        },
        {
          text: this.$t('massAction.caseFileStatus.table.header.firstName') as string,
          value: this.customColumns.firstName,
          sortable: true,
        },
        {
          text: this.$t('massAction.caseFileStatus.table.header.lastName') as string,
          value: this.customColumns.lastName,
          sortable: true,
        },
        {
          text: this.$t('massAction.caseFileStatus.table.header.status') as string,
          value: this.customColumns.status,
          sortable: true,
        },
        {
          text: this.$t('massAction.caseFileStatus.table.header.lastActionDate') as string,
          value: this.customColumns.lastActionDate,
          sortable: true,
        },
        {
          text: this.$t('massAction.caseFileStatus.table.header.created') as string,
          value: this.customColumns.created,
          sortable: true,
        },
        {
          text: this.$t('massAction.caseFileStatus.table.header.tags') as string,
          value: this.customColumns.tags,
          sortable: false,
        },
      ];
    },

    filters(): Array<IFilterSettings> {
      return [
        {
          key: 'Entity/EventId',
          type: EFilterType.Select,
          label: this.$t('caseFileTable.filters.eventName') as string,
          items: this.sortedEventsFilter,
          loading: this.eventsFilterLoading,
          disabled: this.eventsFilterDisabled,
          props: {
            'no-data-text': !this.eventFilterQuery ? this.$t('common.inputs.start_typing_to_search') : this.$t('common.search.no_result'),
            'search-input': this.eventFilterQuery,
            'no-filter': true,
            'return-object': true,
          },
        },
        {
          key: `Metadata/CaseFileStatusName/Translation/${this.$i18n.locale}`,
          type: EFilterType.MultiSelect,
          label: this.$t('caseFileTable.tableHeaders.status') as string,
          items: helpers.enumToTranslatedCollection(CaseFileStatus, 'enums.CaseFileStatus', true),
        },
        {
          key: 'Metadata/LastActionDate',
          type: EFilterType.Date,
          label: this.$t('caseFileTable.filters.lastActionDate') as string,
        },
        {
          key: 'Entity/Created',
          type: EFilterType.Date,
          label: this.$t('caseFileTable.filters.createdDate') as string,
        },
      ];
    },
  },

  async created() {
    await useCaseFileStore().fetchTagsOptions();
  },

  methods: {
    getTags(tags: IListOption[]): string {
      if (!tags || !tags.length) {
        return '';
      }

      return tags.map((t) => this.getTagName(t)).join(', ');
    },

    getTagName(tag: IListOption): string {
      if (!tag) {
        return '';
      }

      const tags: IOptionItem[] = useCaseFileStore().getTagsOptions(false);
      const tagData = tags.find((t) => t.id === tag.optionItemId);

      if (tagData?.isOther && tag.specifiedOther) {
        return tag.specifiedOther;
      }

      return this.$m(tagData?.name);
    },

    async onSubmit() {
      this.$router.push({
        name: routes.massActions.caseFileStatus.create.name,
        query: { azureSearchParams: JSON.stringify(this.azureSearchParams), mode: MassActionMode.List, total: this.itemsCount.toString() },
      });

      this.$emit('update:show', false);
    },
  },

});
</script>

<style scoped lang="scss">
  .tags-column {
    max-width: 250px
  }
</style>
