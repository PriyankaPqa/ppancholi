<template>
  <rc-page-content
    :full-height="false"
    :outer-scroll="true"
    :title="$t('system_management.leftMenu.user_accounts_title')"
    :help-link="$t('zendesk.help_link.manageEMISUsers')"
    :show-add-button="true"
    :add-button-label="$t('system_management.userAccounts.add_user_account_title')"
    :labels="labels"
    :table-props="tableProps"
    :search="search"
    :show-help="false"
    show-search
    content-padding="0"
    @search="setSearch($event)"
    @clear-search="clearSearch()"
    @add-button="addUser()">
    <div class="lists__container">
      <div>
        <v-data-table
          data-test="users-table"
          hide-header
          must-sort
          :loading="loading"
          :loading-text="loadingText"
          :items="filteredUserAccounts"
          :table-props="tableProps"
          :count="filteredUserAccounts.length"
          :labels="labels"
          :headers="headers"
          :sort-by.sync="options.sortBy"
          :sort-desc.sync="options.sortDesc"
          :custom-columns="Object.values(customColumns)"
          :options.sync="options">
          <template slot="default">
            <div>{{ $t('system_management.userAccounts.no_users_found') }}</div>
          </template>

          <template #[`item.${customColumns.displayName}`]="{ item }">
            <router-link
              class="rc-link14 font-weight-bold"
              :data-test="`user_link_${item.entity.id}`"
              :to="getUserAccountDetailsRoute(item.entity.id)">
              <span data-test="user_displayName"> {{ item.metadata.displayName }}</span>
            </router-link>
          </template>

          <template #[`item.${customColumns.email}`]="{ item }">
            <span data-test="user_email"> {{ item.metadata.emailAddress || item.metadata.userPrincipalName }} </span>
          </template>

          <template #[`item.${customColumns.roleId}`]="{ item }">
            <v-select-with-validation
              dense
              outlined
              return-object
              hide-details
              :attach="false"
              data-test="user_roleId"
              :disabled="canNotManageRoleForUser(item)"
              :value="getRoleValue(item)"
              :item-text="(item) => item ? $m(item.text): ''"
              :item-disabled="(item) => item.isInactive"
              :label="$t('system_management.userAccounts.role_header')"
              :items="getRolesForUser(item)"
              @change="updateUserRole($event, item)" />
          </template>

          <template #[`item.${customColumns.accountStatus}`]="{ item }">
            <status-chip
              data-test="user_status"
              status-name="AccountStatus"
              :status="item.entity.accountStatus" />
          </template>

          <template #[`item.${customColumns.edit}`]="{ item }">
            <div v-if="modifiedUser(item)" class="inline-flex align-vertical-centre">
              <v-btn
                small
                color="primary"
                :loading="submitting[item.entity.id]"
                data-test="apply-role-button"
                @click="applyRoleChange(item)">
                {{ $t('common.apply') }}
              </v-btn>
              <v-btn
                icon
                data-test="cancel-role-change"
                @click="cancelRoleChange(item)">
                <v-icon>
                  mdi-close
                </v-icon>
              </v-btn>
            </div>
          </template>

          <template #[`item.${customColumns.delete}`]="{ item }">
            <v-btn
              icon
              :disabled="canNotManageRoleForUser(item)"
              data-test="delete-user"
              @click="deleteUserAccount(item)">
              <v-icon>
                mdi-delete
              </v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </div>
    </div>

    <add-emis-user
      v-if="showAddEmisUserDialog"
      data-test="add-emis-user"
      :all-sub-roles="allActiveSubRoles"
      :all-access-level-roles="allAccessLevelRoles"
      :all-emis-users="users"
      :show.sync="showAddEmisUserDialog"
      @hide="showAddEmisUserDialog = false"
      @users-added="fetchAllEmisUsers" />

    <rc-confirmation-dialog
      v-if="showDeleteUserAccountDialog"
      data-test="delete-user-account-dialog"
      :show.sync="showDeleteUserAccountDialog"
      :loading="submittingDelete"
      :title="$t('system_management.userAccounts.delete_user.title')"
      :messages="$t('system_management.userAccounts.confirmDeleteDialog.message')"
      @submit="applyDeleteUserAccount()"
      @cancel="clearDeletionStatus()"
      @close="clearDeletionStatus()" />
  </rc-page-content>
</template>

<script lang="ts">
import Vue from 'vue';
import {
  RcPageContent,
  VSelectWithValidation,
  RcConfirmationDialog,
} from '@libs/component-lib/components';
import { DataTableHeader } from 'vuetify';
import { TranslateResult } from 'vue-i18n';
import { isEmpty } from 'lodash';
import _cloneDeep from 'lodash/cloneDeep';
import { Route, NavigationGuardNext } from 'vue-router';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import {
  IOptionItem,
  IOptionSubItem,
} from '@/entities/optionItem';

import AddEmisUser from '@/ui/views/pages/system-management/lists/add-emis-user/AddEmisUser.vue';
import routes from '@/constants/routes';
import { IUserAccountCombined, IUserAccountEntity } from '@/entities/user-account';
import { IMultilingual } from '@/types';
import helpers from '@/ui/helpers/helpers';
import { Status } from '@libs/core-lib/entities/base';

export default Vue.extend({
  name: 'UserAccounts',

  components: {
    RcPageContent,
    AddEmisUser,
    StatusChip,
    VSelectWithValidation,
    RcConfirmationDialog,
  },

  async beforeRouteLeave(to: Route, from: Route, next: NavigationGuardNext) {
    await helpers.confirmBeforeLeaving(this, !!this.modifiedUsers.length, next);
  },

  data() {
    return {
      routes,
      options: {
        page: 1,
        sortBy: ['metadata.displayName'],
        sortDesc: [false],
      },
      search: '',
      showAddEmisUserDialog: false,
      showDeleteUserAccountDialog: false,
      userToDelete: null as IUserAccountCombined,
      loading: true,
      submitting: {} as Record<string, boolean>,
      submittingDelete: false,
      allSubRoles: [] as IOptionSubItem[],
      allActiveSubRoles: [] as IOptionSubItem[],
      allAccessLevelRoles: [],
      modifiedUsers: [] as IUserAccountCombined[],
      disallowedLevels: ['Level 6', 'ContributorIM', 'ContributorFinance', 'Contributor 3', 'Read Only'],
      disallowedRoles: [] as IOptionSubItem[],
    };
  },

  computed: {
    roles(): IOptionItem[] {
      return this.$storage.userAccount.getters.roles();
    },

    headers(): Array<DataTableHeader> {
      return [
        {
          text: this.$t('system_management.userAccounts.name_header') as string,
          class: 'emis_member_header',
          filterable: true,
          sortable: true,
          align: 'start',
          value: 'metadata.displayName',
          width: '25%',
        },
        {
          text: this.$t('system_management.userAccounts.emailUsername_header') as string,
          class: 'emis_member_header',
          filterable: true,
          sortable: true,
          value: 'metadata.emailAddress',
          width: '25%',
        },
        {
          text: this.$t('system_management.userAccounts.role_header') as string,
          class: 'emis_member_header',
          filterable: false,
          sortable: true,
          value: 'metadata.roleId',
          width: '25%',
        },
        {
          text: this.$t('system_management.userAccounts.status_header') as string,
          class: 'emis_member_header',
          filterable: false,
          sortable: true,
          value: 'entity.accountStatus',
        },
        {
          text: '',
          class: 'emis_member_header',
          filterable: false,
          sortable: false,
          value: 'edit',
        },
        {
          text: '',
          class: 'emis_member_header',
          filterable: false,
          sortable: false,
          align: 'end',
          value: 'delete',
        },
      ];
    },

    customColumns(): Record<string, string> {
      return {
        displayName: 'metadata.displayName',
        email: 'metadata.emailAddress',
        roleId: 'metadata.roleId',
        accountStatus: 'entity.accountStatus',
        edit: 'edit',
        delete: 'delete',
      };
    },

    loadingText(): TranslateResult {
      return this.$t('system_management.userAccounts.loading_users');
    },

    tableProps(): Record<string, boolean> {
      return {
        loading: this.loading,
      };
    },

    itemsPerPage(): number {
      return this.users ? this.users.length : 0;
    },

    labels(): { header: { title: TranslateResult; searchPlaceholder: TranslateResult } } {
      return {
        header: {
          title: this.$t('system_management.leftMenu.user_accounts_title'),
          searchPlaceholder: this.$t('common.inputs.quick_search'),
        },
      };
    },

    filteredUserAccounts(): IUserAccountCombined[] {
      let filteredUsers:IUserAccountCombined[];

      if (isEmpty(this.search) || !this.users) {
        filteredUsers = this.users || [];
      } else {
        filteredUsers = this.users.filter(
          (user) => user.metadata.displayName && user.metadata.displayName.toLowerCase().indexOf(this.search.toLowerCase()) >= 0,
        );
      }

      return filteredUsers;
    },

    users(): IUserAccountCombined[] {
      return this.$storage.userAccount.getters.getAll()?.filter((u) => u.entity.status === Status.Active) || [];
    },
  },

  async created() {
    await Promise.all([this.$storage.userAccount.actions.fetchRoles(), this.fetchAllEmisUsers()]);
    this.setRoles();
    this.loading = false;
  },

  methods: {
    /**
     * Clear the search related data.
     * @public
     */
    clearSearch() {
      this.search = '';
    },

    setSearch(search: string): void {
      this.search = search;
    },

    addUser() {
      this.showAddEmisUserDialog = true;
    },

    modifiedUser(user: IUserAccountCombined): IUserAccountCombined {
      return this.modifiedUsers.find((u) => u.entity.id === user.entity.id);
    },

    getSubRoleById(roleId: string) {
      return (this.allSubRoles as IOptionSubItem[]).find((r) => r.id === roleId);
    },

    getRoleListItem(roleId: string) : {text:IMultilingual, value: string, isInactive: boolean} {
      const role = this.getSubRoleById(roleId);
      if (role) {
        return {
          text: role.name,
          value: role.id,
          isInactive: role.status === Status.Inactive,
        };
      }
      return { } as {text:IMultilingual, value: string, isInactive: boolean};
    },

    getRolesForUser(user: IUserAccountCombined) {
      if (this.canNotManageRoleForUser(user)) {
        return [{ // in this case, dropdown should be disabled
          text: user.metadata.roleName,
          value: user.metadata.roleId,
        }];
      }

      if (this.allAccessLevelRoles.find((x) => x.value === user.entity.roles[0]?.optionItemId)) {
        return this.allAccessLevelRoles;
      }
      return [this.getRoleListItem(user.entity.roles[0]?.optionItemId), ...this.allAccessLevelRoles];
    },

    updateUserRole(roleData: {text: IMultilingual, value: string}, user: IUserAccountCombined) {
      if (!roleData || !user) {
        return;
      }

      const previouslyModifiedUser = this.modifiedUser(user);

      // Only update if this changes the user role
      if (roleData.value !== user.entity.roles[0].optionItemId) {
        const role:IOptionSubItem = this.allSubRoles.find((r) => r.id === roleData.value);
        const userToUpdate = previouslyModifiedUser || _cloneDeep(user);

        userToUpdate.entity.roles[0].optionItemId = role.id;
        userToUpdate.metadata.roleId = role.id;
        userToUpdate.metadata.roleName = role.name;

        // If the currently modified user has not been previously modified, add it to the list of modified users
        if (!previouslyModifiedUser) {
          this.modifiedUsers.push(userToUpdate);
        }
      } else {
        this.modifiedUsers.splice(this.modifiedUsers.indexOf(previouslyModifiedUser), 1);
      }
    },

    async applyRoleChange(user: IUserAccountCombined) {
      const modifiedUser = this.modifiedUser(user);
      if (!modifiedUser) {
        return;
      }

      this.submitting = { ...this.submitting, [user.entity.id]: true }; // Visual cue of busy state for the specific user
      const newRole = this.getSubRoleById(modifiedUser.entity.roles[0].optionItemId);
      const request = {
        subRole: newRole,
        userId: user.entity.id,
      };

      try {
        const resultAccount:IUserAccountEntity = await this.$storage.userAccount.actions.assignRole(request);
        if (resultAccount) {
          this.fetchAllEmisUsers();
          this.modifiedUsers.splice(this.modifiedUsers.findIndex((u) => u.entity.id === user.entity.id), 1);
          this.$toasted.global.success(this.$t('system_management.userAccounts.role_update_success'));
        }
      } finally {
        this.submitting[user.entity.id] = false;
      }
    },

    cancelRoleChange(user: IUserAccountCombined) {
      // Remove from pending role change
      if (this.modifiedUser(user)) {
        this.modifiedUsers.splice(this.modifiedUsers.findIndex((u) => u.entity.id === user.entity.id), 1);
      }
    },

    deleteUserAccount(user: IUserAccountCombined) {
      this.userToDelete = user;
      this.showDeleteUserAccountDialog = true;
    },

    async applyDeleteUserAccount() {
      if (this.userToDelete) {
        this.submittingDelete = true;
        try {
          const response = await this.$storage.userAccount.actions.deactivate(this.userToDelete.entity.id);

          if (response) {
            this.fetchAllEmisUsers();
            this.clearDeletionStatus();
            this.$toasted.global.success(this.$t('system_management.userAccounts.delete_success'));
          }
        } finally {
          this.submittingDelete = false;
        }
      }
    },

    clearDeletionStatus() {
      this.userToDelete = null;
      this.showDeleteUserAccountDialog = false;
    },

    async fetchAllEmisUsers() {
      await this.$storage.userAccount.actions.fetchAll();
    },

    setRoles() {
      this.disallowedRoles = this.roles
        .filter((r) => this.disallowedLevels.some((level) => level === r.name.translation.en))
        .reduce((acc, val) => acc.concat(val.subitems), []);
      this.setAllActiveSubRoles(this.roles);
      this.setAllAccessLevelRoles(this.roles);
    },

    setAllActiveSubRoles(roles: IOptionItem[]) {
      this.allSubRoles = roles.reduce((acc: IOptionSubItem[], curr:IOptionItem) => {
        acc.push(...curr.subitems);
        return acc;
      }, []);
      this.allActiveSubRoles = this.allSubRoles?.filter((role: IOptionSubItem) => role.status === Status.Active) || [];
    },

    // set the hierarchical list of roles and subroles in the format needed for the dropdown of the select component
    setAllAccessLevelRoles(roles: IOptionItem[]) {
      roles.forEach((accessLevel : IOptionItem) => {
        if (this.$hasLevel('level5') && !this.$hasLevel('level6')
        && this.disallowedLevels.some((level) => level === accessLevel.name.translation.en)) {
          return;
        }

        const activeSubRoles: {text: IMultilingual, value: string}[] = [];
        accessLevel.subitems.forEach((role: IOptionSubItem) => {
          if (role.status === Status.Active) {
            activeSubRoles.push({
              text: role.name,
              value: role.id,
            });
          }
        });
        if (activeSubRoles.length) {
          this.allAccessLevelRoles.push({
            header: this.$m(accessLevel.name),
          });
          activeSubRoles.forEach((a) => this.allAccessLevelRoles.push(a));
        }
      });
    },

    getUserAccountDetailsRoute(id: string) {
      return {
        name: routes.systemManagement.userAccounts.details.name,
        params: {
          id,
        },
      };
    },

    canNotManageRoleForUser(user: IUserAccountCombined): boolean {
      if (this.$hasLevel('level5') && !this.$hasLevel('level6')) {
        return this.disallowedRoles.some((r) => r.name.translation.en === user.metadata?.roleName?.translation.en);
      }

      return false;
    },

    getRoleValue(user: IUserAccountCombined) {
      const modifiedUser = this.modifiedUsers.length && this.modifiedUser(user);

      if (modifiedUser) {
        return this.getRoleListItem(modifiedUser.entity.roles[0].optionItemId);
      }

      return this.getRoleListItem(user.entity.roles[0].optionItemId);
    },
  },
});
</script>

<style scoped lang="scss">
  .inline-flex {
    display: inline-flex;
  }
  .align-vertical-centre {
    align-items: center;
  }
</style>

<style  lang="scss">
  .v-select-with-validation-dropdown {
    max-width: min-content;
  }
</style>
