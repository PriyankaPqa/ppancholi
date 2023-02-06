<template>
  <div>
    <div
      :class="['table_top_header', showMembers ? 'border-radius-top no-bottom-border' : 'border-radius-all']">
      <div class="team_member_toolbar">
        <v-btn v-if="showAddMember" color="primary" data-test="add-new-member" :disabled="disableAddMembers" @click="showAddTeamMemberDialog = true">
          {{ $t('teams.add_new_members') }}
        </v-btn>
        <div v-else />
        <div>
          <v-text-field
            v-if="showSearch"
            v-model="search"
            data-test="search"
            :placeholder="$t('common.search')"
            clearable
            prepend-inner-icon="mdi-magnify"
            background-color="grey lighten-4"
            outlined
            hide-details
            dense
            @click:clear="search = ''" />
        </div>
      </div>
    </div>
    <v-data-table
      v-if="showMembers"
      id="table_member"
      :class="{ 'table border-radius-bottom': true, loading: loading }"
      data-test="teamMembers__table"
      must-sort
      :loading="loading"
      :headers="headers"
      :items="filteredTeamMembers"
      @update:sort-by="sortBy = $event"
      @update:sort-desc="sortDesc = $event">
      <template #[`item.${customColumns.displayName}`]="{ item }">
        <v-icon v-if="item.isPrimaryContact" data-test="primary_icon" size="18" color="red">
          mdi-account
        </v-icon>
        <span
          role="button"
          tabindex="0"
          class="rc-link14 font-weight-bold"
          data-test="member_name"
          @keydown.enter="viewMemberCaseFiles(item)"
          @click=" viewMemberCaseFiles(item)">
          {{ item.metadata.displayName }}
        </span>
      </template>

      <template #[`item.${customColumns.emailAddress}`]="{ item }">
        {{ item.metadata.emailAddress }}
      </template>

      <template #[`item.${customColumns.roleName}`]="{ item }">
        {{ getRole(item) }}
      </template>

      <template #[`item.${customColumns.phoneNumber}`]="{ item }">
        <rc-phone-display :value="item.metadata.phoneNumber" />
      </template>

      <template #[`item.${customColumns.teamCount}`]="{ item }">
        <span
          role="button"
          tabindex="0"
          class="rc-link14 font-weight-bold"
          data-test="member_name"
          @keydown.enter="viewMemberTeams(item)"
          @click="viewMemberTeams(item)">
          {{ item.metadata.teamCount || '0' }}
        </span>
      </template>

      <template #[`item.${customColumns.caseFileCount}`]="{ item }">
        {{ item.caseFileCount }}
      </template>

      <template #[`item.${customColumns.openCaseFileCount}`]="{ item }">
        {{ item.openCaseFileCount }}
      </template>

      <template #[`item.${customColumns.inactiveCaseFileCount}`]="{ item }">
        {{ item.inactiveCaseFileCount }}
      </template>

      <template #[`item.${customColumns.actions}`]="{ item }">
        <v-btn
          v-if="showDeleteIcon(item)"
          icon
          x-small
          :data-test="`remove_team_member_${item.entity.id}`"
          @click="handleRemoveTeamMember(item)">
          <v-icon color="grey darken-2">
            mdi-delete
          </v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <add-team-members
      v-if="showAddTeamMemberDialog"
      data-test="add-team-members"
      :team-members="team.teamMembers"
      :team-id="team.id"
      :show.sync="showAddTeamMemberDialog"
      @addMembers="addMembers" />

    <team-member-teams v-if="showMemberTeamsDialog" :show.sync="showMemberTeamsDialog" :member="clickedMember" />
    <team-member-case-files
      v-if="showMemberCaseFilesDialog"
      :show="showMemberCaseFilesDialog"
      :member="clickedMember"
      @dialogClose="onCloseCaseFileDialog" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import _orderBy from 'lodash/orderBy';
import { DataTableHeader } from 'vuetify';
import { RcPhoneDisplay } from '@libs/component-lib/components';
import {
  ITeamEntity, ITeamMember, ITeamMemberAsUser,
} from '@libs/entities-lib/team';
import sharedHelpers from '@libs/shared-lib/helpers/helpers';
import AddTeamMembers from '@/ui/views/pages/teams/add-team-members/AddTeamMembers.vue';
import TeamMemberTeams from '@/ui/views/pages/teams/components/TeamMemberTeams.vue';
import TeamMemberCaseFiles from '@/ui/views/pages/teams/components/TeamMemberCaseFiles.vue';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import {
 IAssignedCaseFileCountByTeam, IUserAccountEntity, IUserAccountMetadata,
} from '@libs/entities-lib/user-account';
import { IUserAccountCombined, IdParams as IdParamsUserAccount } from '@libs/entities-lib/src/user-account/userAccount.types';
import { CombinedStoreFactory } from '@libs/stores-lib/base/combinedStoreFactory';
import { useUserAccountMetadataStore, useUserAccountStore } from '@/pinia/user-account/user-account';
import { useTeamStore } from '@/pinia/team/team';

export interface Result extends IUserAccountCombined {
  isPrimaryContact: boolean;
}

export const LOAD_SIZE = 999;

export default Vue.extend({
  name: 'TeamMembersTable',

  components: {
    AddTeamMembers,
    RcPhoneDisplay,
    TeamMemberTeams,
    TeamMemberCaseFiles,
  },

  props: {
    showSearch: {
      type: Boolean,
      default: true,
    },

    showMembers: {
      type: Boolean,
      default: true,
    },

    disableAddMembers: {
      type: Boolean,
      default: false,
    },

    showAddMember: {
      type: Boolean,
      default: true,
    },

    disabledDeleteMember: {
      type: Boolean,
      default: false,
    },

    teamId: {
      type: String,
      required: true,
    },

    primaryContact: {
      type: Object as ()=> IUserAccountCombined,
      default: null,
    },
  },

  data() {
    return {
      sortDesc: false,
      sortBy: 'metadata.displayName',
      search: '',
      showAddTeamMemberDialog: false,
      removeMemberId: '',
      searchAmong: [
        'metadata.displayName',
        'metadata.emailAddress',
        'metadata.phoneNumber',
        'metadata.teamCount',
        'metadata.caseFilesCount',
        'metadata.openCaseFilesCount',
        'metadata.inactiveCaseFilesCount',
        'metadata.roleName',
      ],
      showMemberTeamsDialog: false,
      showMemberCaseFilesDialog: false,
      clickedMember: null as ITeamMemberAsUser,
      removeLoading: false,
      loading: true,
      FeatureKeys,
      teamMembers: [] as ITeamMemberAsUser[],
      combinedUserAccountStore: new CombinedStoreFactory<IUserAccountEntity, IUserAccountMetadata, IdParamsUserAccount>(useUserAccountStore(), useUserAccountMetadataStore()),
    };
  },

  computed: {
    customColumns(): Record<string, string> {
      return {
        displayName: 'metadata.displayName',
        emailAddress: 'Metadata/EmailAddress',
        phoneNumber: 'Metadata/PhoneNumber',
        roleName: `metadata.roleName.translation.${this.$i18n.locale}`,
        teamCount: 'Metadata/TeamCount',
        caseFileCount: 'caseFileCount',
        openCaseFileCount: 'openCaseFileCount',
        inactiveCaseFileCount: 'inactiveCaseFileCount',
        actions: 'actions',
      };
    },

    headers(): Array<DataTableHeader> {
      const headers = [
        {
          text: this.$t('teams.member_name') as string,
          class: 'team_member_header',
          filterable: false,
          sortable: true,
          value: this.customColumns.displayName,
        },
        {
          text: this.$t('teams.member_email') as string,
          class: 'team_member_header',
          filterable: false,
          sortable: false,
          value: this.customColumns.emailAddress,
        },
        {
          text: this.$t('teams.phone_number') as string,
          class: 'team_member_header',
          filterable: false,
          sortable: false,
          value: this.customColumns.phoneNumber,
        },
        {
          text: this.$t('teams.member_role') as string,
          class: 'team_member_header',
          filterable: false,
          sortable: true,
          value: this.customColumns.roleName,
        },
        {
          text: this.$t('teams.teams') as string,
          class: 'team_member_header',
          filterable: false,
          sortable: false,
          value: this.customColumns.teamCount,
          width: '20px',
        },
        {
          text: this.$t('teams.count_file.total') as string,
          class: 'team_member_header',
          filterable: false,
          sortable: true,
          value: this.customColumns.caseFileCount,
          width: '20px',
        },
        {
          text: this.$t('teams.count_file.open') as string,
          class: 'team_member_header',
          filterable: false,
          sortable: true,
          value: this.customColumns.openCaseFileCount,
          width: '20px',
        },
        {
          text: this.$t('teams.count_file.inactive') as string,
          class: 'team_member_header',
          filterable: false,
          sortable: true,
          value: this.customColumns.inactiveCaseFileCount,
          width: '20px',
        },
        {
          text: '',
          value: this.customColumns.actions,
          width: '10px',
          sortable: false,
          filterable: false,
        },
      ];
      if (this.disabledDeleteMember) {
        return headers.filter((h) => h.value !== 'delete');
      }
      return headers;
    },

    team(): ITeamEntity {
      return useTeamStore().getById(this.teamId);
    },

    filteredTeamMembers(): ITeamMemberAsUser[] {
      return sharedHelpers.filterCollectionByValue(this.teamMembers, this.search, false, this.searchAmong, true);
    },

    primaryContactId(): string {
      return this.primaryContact?.entity?.id || this.team.teamMembers.find((m:ITeamMember) => m.isPrimaryContact).id;
    },
  },

  watch: {
    async primaryContact(newValue) {
      if (newValue?.entity?.id) {
        await this.loadTeamMembers();

        const teamMemberIds = this.teamMembers?.map((m) => m.entity.id) || [];
        if (!teamMemberIds.includes(newValue.entity.id)) {
          this.addMembers([newValue]);
        }
      }
    },
  },

  async created() {
    await this.loadTeamMembers();
  },

  methods: {
    async loadTeamMembers(skip = 0) {
      const filter = {
        Metadata: {
          Teams: {
            any: {
              TeamId: this.teamId,
            },
          },
        },
      };

      const res = await this.combinedUserAccountStore.search({
        search: this.search,
        filter,
        top: LOAD_SIZE,
        skip,
        count: true,
        queryType: 'full',
        searchMode: 'all',
      });

      if (res) {
        const members = this.combinedUserAccountStore.getByIds(res.ids);
        const mappedTeamMembers = this.makeMappedMembers(members);

        if (skip === 0) {
          this.teamMembers = mappedTeamMembers;
        } else {
          this.teamMembers.push(...mappedTeamMembers);
        }

        if (res.count > skip + LOAD_SIZE) {
          this.loadTeamMembers(skip + LOAD_SIZE);
        }
      }
      this.loading = false;
    },

    async removeTeamMember(id: string, isLastMember = false) {
      try {
        this.removeLoading = true;
        const res = isLastMember ? await useTeamStore().emptyTeam({ teamId: this.teamId }) : await useTeamStore().removeTeamMember({ teamId: this.teamId, teamMemberId: id });
        if (isLastMember) {
          this.$emit('reloadTeam');
        }
        if (res) {
          this.teamMembers = this.teamMembers.filter((member) => member.entity.id !== id);
          this.$toasted.global.success(this.$t('teams.remove_team_members_success'));
        }
      } finally {
        this.removeLoading = false;
      }
    },

    getRole(user: ITeamMemberAsUser): string {
      if (user.metadata.roleName) {
        return this.$m(user.metadata.roleName);
      }
      return '';
    },

    showDeleteIcon(member: ITeamMemberAsUser): boolean {
      if (member.isPrimaryContact) {
        return this.$hasLevel('level5');
      }
      return this.$hasLevel('level4');
    },

    async viewMemberTeams(member: ITeamMemberAsUser) {
      this.showMemberTeamsDialog = true;
      this.clickedMember = member;
    },

    async viewMemberCaseFiles(member: ITeamMemberAsUser) {
      this.showMemberCaseFilesDialog = true;
      this.clickedMember = member;
    },

    canRemovePrimary():boolean {
      return this.$hasLevel('level5') && this.team.teamMembers.length === 1;
    },

    async handleRemoveTeamMember(item: ITeamMemberAsUser) {
      let doDelete = false;
      if (item.isPrimaryContact) {
        if (this.canRemovePrimary()) {
          doDelete = await this.$confirm({
            title: this.$t('teams.remove_team_members'),
            messages: this.$t('teams.remove_last_team_members_confirm'),
          });
        } else {
          this.$toasted.global.warning(this.$t('teams.remove_team_members_change_contact'));
        }
      } else {
        doDelete = await this.$confirm({
          title: this.$t('teams.remove_team_members'),
          messages: this.$t('teams.remove_team_members_confirm'),
        });
      }

      if (doDelete) {
        await this.removeTeamMember(item.entity.id, item.isPrimaryContact);
      }
    },

    makeMappedMembers(members: IUserAccountCombined[]): ITeamMemberAsUser[] {
      return members.map((m) => {
        const memberAssignedCaseFiles = m.metadata?.assignedCaseFileCountByTeam?.find((t:IAssignedCaseFileCountByTeam) => t.teamId === this.teamId);
        return {
          ...m,
          isPrimaryContact: m.entity.id === this.primaryContactId,
          openCaseFileCount: memberAssignedCaseFiles?.openCaseFileCount || 0,
          inactiveCaseFileCount: memberAssignedCaseFiles?.inactiveCaseFileCount || 0,
          caseFileCount: memberAssignedCaseFiles?.allCaseFileCount || 0,
        };
      });
    },

    addMembers(members: IUserAccountCombined[]) {
      const mappedNewMembers = this.makeMappedMembers(members);
      const newMembersList = [...this.teamMembers, ...mappedNewMembers];
      this.teamMembers = _orderBy(newMembersList, this.sortBy, this.sortDesc ? 'desc' : 'asc');
    },

    async onCloseCaseFileDialog() {
      await this.loadTeamMembers();
      this.showMemberCaseFilesDialog = false;
    },
  },
});

</script>

<style scoped lang="scss">

.team_member_toolbar {
  display: flex;
  width: 100%;
  justify-content: space-between;

  & div:nth-child(2) {
    max-width: 500px;
  }
}

.table_top_header {
  border: solid 1px var(--v-grey-lighten2);
  padding: 10px 15px;
}

.table {
  border: solid 1px var(--v-grey-lighten2);
}

#table_member ::v-deep th.team_member_header {
  white-space: nowrap;
}

.no-bottom-border {
  border-bottom: none;
}

</style>
