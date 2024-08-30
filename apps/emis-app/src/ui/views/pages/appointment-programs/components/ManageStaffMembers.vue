<template>
  <rc-dialog
    :title="$t('appointmentProgram.manageStaff.title')"
    :show.sync="show"
    :loading="loading"
    :cancel-action-label="$t('common.buttons.cancel')"
    :submit-action-label=" $t('common.confirm')"
    :submit-button-disabled="false"
    :persistent="true"
    data-test="manage-staff-dialog"
    :tooltip-label="$t('common.tooltip_label')"
    fullscreen
    @cancel="$emit('update:show', false)"
    @close="$emit('update:show', false)"
    @submit="onSubmit">
    <v-row class="pa-0">
      <v-col cols="12" md="4" class="pt-0 d-flex flex-column">
        <div class="rc-body16 fw-bold mb-2">
          {{ $t('appointmentProgram.manageStaff.title.teamMembers') }}
        </div>
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
          :value="searchTerm"
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
        <v-sheet v-if="selectedTeam" rounded outlined height="100%">
          <rc-data-table
            data-test="manage-staff-members-team-members-table"
            class="flex-grow-1 scrollable individuals-table"
            :headers="headers"
            hide-header
            dense
            :table-props="{ loading: teamMembersLoading }"
            :count="itemsCount"
            must-sort
            :options.sync="options"
            :initial-search="params && params.search"
            :custom-columns="Object.values(customColumns)"
            :item-class="(item)=> isMemberSelected(item) ? 'row_active' : ''"
            :has-border="false"
            :items="tableData"
            @search="search">
            <template #[`header.${customColumns.checkbox}`]>
              <v-btn color="primary" small data-test="add-staff-member" @click="addAllTeamMembers">
                {{ $t('appointmentProgram.manageStaff.title.addAll') }}
              </v-btn>
            </template>

            <template #[`item.${customColumns.name}`]="{ item }">
              <div class="d-flex flex-column">
                <div class="d-flex align-center">
                  <v-icon v-if="isPrimaryContact(item.id)" data-test="primary_icon" size="14" color="red">
                    mdi-account
                  </v-icon>
                  <span class="rc-body14 fw-bold ml-1">  {{ item.displayName }} </span>
                </div>
                <span class="rc-body12">  {{ $m(item.roleName) }} </span>
              </div>
            </template>

            <template #[`item.${customColumns.checkbox}`]="{ item }">
              <v-simple-checkbox
                :data-test="`select_${item.id}`"
                :ripple="false"
                :value="isMemberSelected(item)"
                @input="onSelectTeamMember({ item, value: $event })" />
            </template>
          </rc-data-table>
        </v-sheet>
      </v-col>
      <v-col cols="12" md="8" class="pt-0 d-flex flex-column">
        <div class="rc-body16 fw-bold mb-2">
          {{ $t('appointmentProgram.manageStaff.title.assignStaff') }}
        </div>
        <assign-service-options
          :service-options.sync="localServiceOptions"
          :staff-members.sync="allStaffMembers"
          :teams="teams" />
      </v-col>
    </v-row>
  </rc-dialog>
</template>

<script lang="ts">
import mixins from 'vue-typed-mixins';
// import _cloneDeep from 'lodash/cloneDeep';
import { RcDialog } from '@libs/component-lib/components';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import { useTeamStore } from '@/pinia/team/team';
import { ITeamEntity, mockTeamEntity } from '@libs/entities-lib/team';
import { IdParams, IUserAccountEntity, IUserAccountMetadata } from '@libs/entities-lib/user-account';
import { useUserAccountMetadataStore, useUserAccountStore } from '@/pinia/user-account/user-account';
import { DataTableHeader } from 'vuetify';
import { ISearchParams } from '@libs/shared-lib/types';
import { CombinedStoreFactory } from '@libs/stores-lib/base/combinedStoreFactory';
import { EFilterKeyType } from '@libs/component-lib/types';
import { IServiceOption } from '@libs/entities-lib/appointment';
import { SERVICE_OPTIONS } from '../../appointments/home/mocks';
import AssignServiceOptions from './AssignServiceOptions.vue';

export default mixins(TablePaginationSearchMixin).extend({
  name: 'ManageStaffMembers',

  components: {
    RcDialog,
    AssignServiceOptions,
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

    serviceOptions: {
      type: Array as ()=> IServiceOption[],
      required: true,
    },
  },

  data() {
    return {
      combinedUserAccountStore: new CombinedStoreFactory<IUserAccountEntity, IUserAccountMetadata, IdParams>(useUserAccountStore(), useUserAccountMetadataStore()),
      showAddStaffMembersDialog: false,
      loading: false,
      teamMembersLoading: false,
      selectedTeam: null as ITeamEntity,
      teamMembers: [] as IUserAccountMetadata[],
      teams: [mockTeamEntity()] as ITeamEntity[],
      allStaffMembers: [] as IUserAccountMetadata[],
      localServiceOptions: [] as IServiceOption[],
      SERVICE_OPTIONS,
    };
  },

  async created() {
    this.localServiceOptions = SERVICE_OPTIONS;// _cloneDeep(this.serviceOptions);
    await this.fetchAssignableTeams();
    await this.fetchInitialStaffMembers();
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
          align: 'end',
          value: this.customColumns.checkbox,
        },
      ];
    },

    tableData(): IUserAccountMetadata[] {
      return this.combinedUserAccountStore.getByIds(this.searchResultIds).map((i) => i.metadata);
    },
  },

  watch: {
    'selectedTeam.id': {
      handler(currentTeamId: string) {
        if (currentTeamId) {
          if (this.params) {
            this.goToFirstPage();
            this.searchTerm = '';
            this.search(this.params);
          }
        }
      },
    },
  },

  methods: {
    async fetchAssignableTeams() {
     const res = await useTeamStore().search({ params: {
        filter: { Entity: { UseForAppointments: true, Events: { any: { Id: { value: this.eventId, type: EFilterKeyType.Guid } } } } },
        orderBy: 'Entity/Name asc',
      },
      includeInactiveItems: false });
      if (res) {
        this.teams = res.values;
      }
    },

    async fetchInitialStaffMembers() {
      const allIds = this.localServiceOptions.reduce((ids, so) => {
        ids.push(...so.staffMembers);
        return ids;
      }, []);
      const uniqueIds = [...new Set(allIds)];
      this.allStaffMembers = await useUserAccountMetadataStore().fetchByIds(uniqueIds, true);
    },

    isMemberSelected(teamMember: IUserAccountMetadata) {
      return this.allStaffMembers.some((m) => m.id === teamMember.id);
    },

    isPrimaryContact(teamMemberId: string) {
      return this.selectedTeam.teamMembers.find((m) => m.id === teamMemberId).isPrimaryContact;
    },

    onSelectTeamMember({ item, value }:{ item: IUserAccountMetadata, value: boolean }) {
      if (value) {
        this.allStaffMembers = [...this.allStaffMembers, item];
      } else {
        this.allStaffMembers = this.allStaffMembers.filter((m) => m.id !== item.id);
        this.localServiceOptions.forEach((so) => {
          so.staffMembers = so.staffMembers.filter((m) => m !== item.id);
        });
      }
    },

    async addAllTeamMembers() {
      const teamMemberIds = this.selectedTeam.teamMembers.map((m) => m.id).filter((id) => !this.allStaffMembers.some((m) => m.id === id));
      const allMembersData = await useUserAccountMetadataStore().fetchByIds(teamMemberIds, true);
      this.allStaffMembers.push(...allMembersData);
    },

    // Fetch the team members of a selected team
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

    onSubmit() {
      if (this.allUsersAreAssigned()) {
        // make call to update service options
      } else {
        this.$message({ title: this.$t('common.error'), message: this.$t('appointmentProgram.manageStaff.error.notAllMembersAreAssigned') });
      }
    },

    allUsersAreAssigned():boolean {
      return !this.allStaffMembers.some((m) => !this.localServiceOptions.some((so) => so.staffMembers.includes(m.id)));
    },
  },
});

</script>
<style scoped lang='scss'>

.active-item {
  background-color: var(--v-primary-lighten2);;
}

::v-deep th.team_member_header {
  white-space: nowrap;
}

::v-deep .v-data-footer {
  .v-btn {
    margin: 0 !important;
  }
}

::v-deep .v-data-footer__pagination {
  margin-left: 8px;
  margin-right: 8px;
  .v-btn {
    margin: 0;
  }
}

::v-deep .v-data-footer__select  {
  margin-right: 8px ;

   .v-select {
    margin: 8px 0 8px 8px;
  }
}

</style>
