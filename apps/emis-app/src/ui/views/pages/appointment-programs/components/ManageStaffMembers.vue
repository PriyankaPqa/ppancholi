<!-- eslint-disable vue/no-v-for-template-key -->
<template>
  <rc-dialog
    :title="$t('appointmentProgram.manageStaff.title')"
    :show.sync="show"
    :loading="loading"
    :cancel-action-label="$t('common.buttons.cancel')"
    :submit-action-label=" $t('common.save')"
    :submit-button-disabled="false"
    :persistent="true"
    data-test="manage-staff-dialog"
    :tooltip-label="$t('common.tooltip_label')"
    fullscreen
    @cancel="$emit('update:show', false)"
    @close="$emit('update:show', false)"
    @submit="onSubmit">
    <v-row class="pa-0">
      <v-col cols="12" xl="4" lg="4" md="4" sm="12" class="py-0 d-flex flex-column">
        <span class="rc-body16 fw-bold mb-2">{{ $t('appointmentProgram.manageStaff.title.teamMembers') }}</span>
        <v-select-with-validation
          v-model="selectedTeam"
          dense
          :label="$t('appointmentProgram.manageStaff.select.team')"
          class="mb-3"
          :items="teams"
          hide-details
          return-object
          :item-text="(item) => item.name"
          :item-value="(item) => item.id"
          data-test="manage-staff-select-team" />

        <v-text-field
          :value="searchMemberTerm"
          class="flex-grow-0 mb-3"
          dense
          clearable
          outlined
          hide-details
          :disabled="!selectedTeam"
          prepend-inner-icon="mdi-magnify"
          data-test="individual-search-input"
          :placeholder="$t('caseFile.quickUserSearch')"
          @click:clear="onSearchTermInput('')"
          @input="onSearchTermInput" />
        <v-sheet v-if="selectedTeam" rounded outlined>
          <rc-data-table
            data-test="manage-staff-members-team-members-table"
            class="flex-grow-1 scrollable individuals-table"
            :headers="headers"
            hide-header
            :table-props="{ loading: teamMembersLoading }"
            :count="itemsCount"
            must-sort
            :options.sync="options"
            :initial-search="params && params.search"
            :custom-columns="Object.values(customColumns)"
            :item-class="(item)=> isUserDisabled(item) ? 'disabled' : isUserSelected(item) ? 'disabled row_active' : ''"
            :has-border="false"
            :items="tableData"
            @search="search">
            <template #[`item.${customColumns.name}`]="{ item }">
              <span class="rc-body14 fw-bold primary--text text--darken-1">  {{ item.metadata.displayName }} </span>
              <span class="rc-body12">  {{ $m(item.metadata.roleName) }} </span>
            </template>

            <template #[`item.${customColumns.checkbox}`]="{ item }">
              <v-simple-checkbox
                :data-test="`select_${item.entity.id}`"
                :ripple="false"
                :class="{ disabled: isUserSelected(item) }"
                :value="isUserDisabled(item) ? false : isUserSelected(item)"
                :disabled="isUserDisabled(item)"
                @input="onSelectTeamMember({ item, value: $event })" />
            </template>
          </rc-data-table>
        </v-sheet>
      </v-col>
      <v-col cols="12" xl="8" lg="8" md="4" sm="12" class="py-0">
        <span class="rc-body16 fw-bold">{{ $t('appointmentProgram.manageStaff.title.assignStaff') }}</span>
      </v-col>
    </v-row>
  </rc-dialog>
</template>

<script lang="ts">
import mixins from 'vue-typed-mixins';
import { RcDialog } from '@libs/component-lib/components';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import { useTeamStore } from '@/pinia/team/team';
import { ITeamEntity, mockTeamEntity } from '@libs/entities-lib/team';
import { IdParams, IUserAccountCombined, IUserAccountEntity, IUserAccountMetadata, mockCombinedUserAccounts } from '@libs/entities-lib/user-account';
import { useUserAccountMetadataStore, useUserAccountStore } from '@/pinia/user-account/user-account';
import { DataTableHeader } from 'vuetify';
import { ISearchParams } from '@libs/shared-lib/types';
import { CombinedStoreFactory } from '@libs/stores-lib/base/combinedStoreFactory';
import { EFilterKeyType } from '@libs/component-lib/types';

export default mixins(TablePaginationSearchMixin).extend({
  name: 'ManageStaffMembers',

  components: {
    RcDialog,
  },

  props: {
    show: {
      type: Boolean,
      required: true,
    },

    eventId: {
      type: String,
      required: true,
    },

    appointmentProgramId: {
      type: String,
      required: true,
    },

  },

  data() {
    return {
      showAddStaffMembersDialog: false,
      loading: false,
      teamMembersLoading: false,
      selectedTeam: null as ITeamEntity,
      teamMembers: mockCombinedUserAccounts() as IUserAccountCombined[],
      selectedTeamMembers: [] as IUserAccountCombined[],
      teams: [mockTeamEntity()] as ITeamEntity[],
      searchMemberTerm: '',
      combinedUserAccountStore: new CombinedStoreFactory<IUserAccountEntity, IUserAccountMetadata, IdParams>(useUserAccountStore(), useUserAccountMetadataStore()),

    };
  },

  async created() {
    await this.getAssignableTeams();
  },

  computed: {

    customColumns(): Record<string, string> {
      return {
        name: 'Metadata/DisplayName',
        checkbox: 'checkbox',
      };
    },

    headers(): Array<DataTableHeader> {
      return [
        {
          text: this.$t('appointmentProgram.manageStaff.name') as string,
          class: 'team_member_header',
          filterable: false,
          sortable: true,
          value: this.customColumns.name,
        },
        {
          text: '',
          class: 'team_member_header',
          sortable: false,
          value: this.customColumns.checkbox,
        },
      ];
    },

    tableData(): IUserAccountCombined[] {
      return this.combinedUserAccountStore.getByIds(this.searchResultIds);
    },

  },

  methods: {
    onSubmit() {

    },

    isUserDisabled() {
      return false;
    },

    isUserSelected() {
      return false;
    },

    onSelectTeamMember({ item, value }:{ item: IUserAccountCombined, value: boolean }) {
      // eslint-disable-next-line no-console
      console.log(item, value);
    },

   async getAssignableTeams() {
     const res = await useTeamStore().search({ params: {
        filter: { Entity: { UseForAppointments: true, Events: { any: { Id: { value: this.eventId, type: EFilterKeyType.Guid } } } } },
        orderBy: 'Entity/Name asc',
      },
      includeInactiveItems: false });
      if (res) {
        this.teams = res.values;
      }
    },

    async fetchData(params: ISearchParams) {
      this.teamMembersLoading = true;
      const filter = {
          Metadata: {
            TeamsAsString: {
              contains: this.selectedTeam.id,
            },
            DisplayName: {
              contains: this.searchTerm || '',
            },
          },
      };
      const res = await this.combinedUserAccountStore.search({
        filter,
        top: params.top,
        skip: params.skip,
        orderBy: params.orderBy,
        count: true,
      }, null, false, true);

      this.teamMembersLoading = false;
      return res;
    },
  },

});

</script>
<style scoped lang='scss'>
.member-list-item {
  border-bottom: 1px solid var(--v-grey-lighten2);
}

.active-item {
  background-color: var(--v-primary-lighten2);;
}

::v-deep th.team_member_header {
  white-space: nowrap;
}

::v-deep .v-data-footer__pagination {
  margin-left: 8px;
  margin-right: 8px;
}

::v-deep .v-data-footer__select .v-select {
  margin: 8px 0 8px 8px;
}

</style>
