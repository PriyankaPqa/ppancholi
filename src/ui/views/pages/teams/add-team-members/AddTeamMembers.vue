<template>
  <rc-dialog
    :title="$t('teams.add_new_members')"
    :submit-action-label="$t('common.buttons.add')"
    :cancel-action-label="$t('common.buttons.cancel')"
    :submit-button-disabled="selectedUsers.length === 0"
    :show.sync="show"
    content-padding="6"
    content-only-scrolling
    fullscreen
    persistent
    show-close
    :loading="loading"
    @close="close"
    @cancel="close"
    @submit="submit">
    <v-row>
      <v-col cols="8" class="px-6">
        <div class="left-container">
          <div>
            <p class="rc-body16 fw-bold">
              {{ $t('teams.search_member') }}
            </p>
            <v-text-field
              v-model="search"
              clearable
              outlined
              prepend-inner-icon="mdi-magnify"
              data-test="team-search-input"
              :placeholder="$t('common.search')" />
          </div>
          <div class="table-container">
            <v-data-table
              v-if="search"
              data-test="table"
              class="search_members"
              show-select
              hide-default-footer
              :headers="headers"
              :item-class="getClassRow"
              :items="availableMembers"
              :items-per-page="Math.max(availableMembers.length, 1)"
              @toggle-select-all="onSelectAll">
              <template #item.data-table-select="{ item }">
                <v-simple-checkbox
                  :data-test="`select_${item.userAccountId}`"
                  :ripple="false"
                  :value="isSelected(item) || isAlreadyInTeam(item)"
                  :readonly="isAlreadyInTeam(item)"
                  :disabled="isAlreadyInTeam(item)"
                  @input="updateSelection(item)" />
              </template>
              <template #item.role="{ item }">
                {{ getRole(item) }}
              </template>
            </v-data-table>
          </div>
        </div>
      </v-col>

      <v-col cols="4" class="px-6">
        <div class="right-container">
          <div class="rc-body16 fw-bold pb-4">
            {{ $t('teams.selected_members') }}
          </div>
          <ul class="selected__members_container">
            <li v-for="user in selectedUsers" :key="user.userAccountId">
              <div class="py-2">
                <span class="rc-body14 fw-bold"> {{ user.displayName }}</span>
                <v-tooltip bottom>
                  <template #activator="{ on }">
                    <v-btn
                      icon
                      x-small
                      class="mr-4"
                      :data-test="`unselect_${user.userAccountId}`"
                      @click="updateSelection(user)"
                      v-on="on">
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t('eventSummary.deleteLinkTooltip') }}</span>
                </v-tooltip>
              </div>
            </li>
          </ul>
        </div>
      </v-col>
    </v-row>
  </rc-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcDialog } from '@crctech/component-library';
import { DataTableHeader } from 'vuetify';
import _difference from 'lodash/difference';
import { ITeamMemberData } from '@/entities/team';
import { IUserAccountSearchData } from '@/entities/user-account';

export default Vue.extend({
  name: 'AddTeamMembers',

  components: {
    RcDialog,
  },

  props: {
    show: {
      type: Boolean,
      required: true,
    },
    teamMembers: {
      type: Array as () => ITeamMemberData[],
      required: true,
    },
  },

  data() {
    return {
      search: '',
      selectedUsers: [],
      users: [] as Array<IUserAccountSearchData>,
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
          text: this.$t('teams.member_role') as string,
          class: 'team_member_header',
          filterable: false,
          sortable: false,
          value: 'role',
        },
        {
          text: this.$t('teams.member_status') as string,
          class: 'team_member_header',
          filterable: false,
          sortable: false,
          value: '',
        },
      ];
    },

    availableMembers(): ITeamMemberData[] {
      return this.$storage.userAccount.getters.searchUserAccounts(this.search, ['displayName', 'emailAddress']) || [];
    },

    loading(): boolean {
      return this.$store.state.team.submitLoading;
    },
  },

  methods: {
    close() {
      this.$emit('update:show', false);
    },

    getClassRow(user: ITeamMemberData): string {
      if (this.isAlreadyInTeam(user)) {
        return 'row_disabled';
      }
      if (this.isSelected(user)) {
        return 'row_active';
      }
      return '';
    },

    getRole(user: ITeamMemberData): string {
      return this.$m(user.roleName);
    },

    isAlreadyInTeam(user: ITeamMemberData): boolean {
      return this.teamMembers.findIndex((u) => user.userAccountId === u.userAccountId) !== -1;
    },

    isSelected(user: ITeamMemberData): boolean {
      return this.selectedUsers.findIndex((u) => user.userAccountId === u.userAccountId) !== -1;
    },

    onSelectAll({ items, value }: {items: Array<ITeamMemberData>; value: boolean}) {
      if (value) { // select all, get the new ones + old ones
        this.selectedUsers = [...this.selectedUsers, ...items.filter((i) => !this.isAlreadyInTeam(i))];
      } else { // deselect, only remove what is currently removed
        this.selectedUsers = _difference(this.selectedUsers, items);
      }
    },

    async submit() {
      await this.$storage.team.actions.addTeamMembers(this.selectedUsers);
      this.$toasted.global.success(this.$t('team.add_members.success'));
      this.close();
    },

    updateSelection(user: ITeamMemberData) {
      if (this.isSelected(user)) { // remove
        this.selectedUsers = this.selectedUsers.filter((u) => u.userAccountId !== user.userAccountId);
      } else { // add
        this.selectedUsers = [...this.selectedUsers, user];
      }
    },
  },
});
</script>

<style scoped lang="scss">

.left-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.right-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.selected__members_container {
  border: solid 1px var(--v-grey-lighten2);
  border-radius: 4px;
  height: 100%;

  & > li {
    list-style-type:none;
    & div {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}
</style>
