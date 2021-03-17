<template>
  <div>
    <div
      :class="['table_top_header', isEditMode? 'border-radius-top no-bottom-border' : 'border-radius-all']">
      <div class="toolbar">
        <v-btn color="primary" data-test="add-new-member" :disabled="!isEditMode" @click="showAddTeamMemberDialog = true">
          {{ $t('teams.add_new_members') }}
        </v-btn>
        <div>
          <v-text-field
            v-if="isEditMode"
            v-model="search"
            data-test="search"
            :placeholder="$t('common.search')"
            clearable
            prepend-inner-icon="mdi-magnify"
            background-color="grey lighten-4"
            outlined
            hide-details
            dense />
        </div>
      </div>
    </div>
    <v-data-table
      v-if="isEditMode"
      class="table border-radius-bottom"
      data-test="teamMembers__table"
      hide-default-footer
      :headers="headers"
      :items="computedTeamMembers"
      @update:sort-by="sortBy = $event"
      @update:sort-desc="sortDesc = $event">
      <template #item.displayName="{ item }">
        <v-icon v-if="item.isPrimaryContact" data-test="primary_icon" size="18" color="red">
          mdi-account
        </v-icon>
        <span data-test="member_name">
          {{ item.displayName }}
        </span>
      </template>
    </v-data-table>
    <add-team-members
      v-if="showAddTeamMemberDialog"
      data-test="add-team-members"
      :team-members="teamMembers"
      :show.sync="showAddTeamMemberDialog"
      @refresh-team="$emit('refresh-team')" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { DataTableHeader } from 'vuetify';
import _orderBy from 'lodash/orderBy';
import { ITeamMember } from '@/entities/team';
import helpers from '@/ui/helpers';
import AddTeamMembers from '@/ui/views/pages/teams/add-team-members/AddTeamMembers.vue';

export default Vue.extend({
  name: 'TeamMembersTable',
  components: {
    AddTeamMembers,
  },

  props: {
    teamMembers: {
      type: Array as () => Array<ITeamMember>,
      required: true,
    },

    isEditMode: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      sortDesc: false,
      sortBy: 'displayName',
      search: '',
      showAddTeamMemberDialog: false,
    };
  },

  computed: {
    headers(): Array<DataTableHeader> {
      return [
        {
          text: this.$t('teams.member_name') as string,
          class: 'team_member_header',
          filterable: false,
          sortable: true,
          value: 'displayName',
        },
        {
          text: this.$t('teams.member_email') as string,
          class: 'team_member_header',
          filterable: false,
          sortable: false,
          value: 'emailAddress',
        },
        {
          text: this.$t('teams.phone_number') as string,
          class: 'team_member_header',
          filterable: false,
          sortable: false,
          value: 'phoneNumber',
        },
        {
          text: this.$t('teams.member_role') as string,
          class: 'team_member_header',
          filterable: false,
          sortable: false,
          value: 'role',
        },
        {
          text: this.$t('teams.teams') as string,
          class: 'team_member_header',
          filterable: false,
          sortable: false,
          value: 'teamCount',
        },
        {
          text: this.$t('teams.count_file.total') as string,
          class: 'team_member_header',
          filterable: false,
          sortable: true,
          value: 'caseFilesCount',
        },
        {
          text: this.$t('teams.count_file.open') as string,
          class: 'team_member_header',
          filterable: false,
          sortable: true,
          value: 'openCaseFilesCount',
        },
        {
          text: this.$t('teams.count_file.inactive') as string,
          class: 'team_member_header',
          filterable: false,
          sortable: true,
          value: 'inactiveCaseFilesCount',
        },
      ];
    },

    computedTeamMembers(): Array<ITeamMember> {
      const direction = this.sortDesc ? 'desc' : 'asc';
      const filtered = helpers.filterCollectionByValue(this.teamMembers, this.search);
      return _orderBy(filtered, this.sortBy, direction) as ITeamMember[];
    },

    teamMembersId(): Array<string> {
      return this.teamMembers.map((m: ITeamMember) => m.id);
    },
  },
});

</script>

<style lang="scss">

.toolbar {
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

.team_member_header {
  font-size: 14px !important;
  font-weight: 700 !important;
  color: var(--v-grey-darken4) !important;;
}

.no-bottom-border {
  border-bottom: none;
}

</style>
