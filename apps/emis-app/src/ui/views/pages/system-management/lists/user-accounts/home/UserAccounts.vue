<template>
  <div class="ma-0 pa-0">
    <rc-data-table
      ref="userAccountsTable"
      data-test="user-accounts-table"
      :items="tableData"
      :count="itemsCount"
      :headers="headers"
      :footer-text="footerText"
      :labels="labels"
      :table-props="tableProps"
      :show-add-button="true"
      :options.sync="options"
      :initial-search="params && params.search"
      :custom-columns="Object.values(customColumns)"
      @search="search"
      @add-button="addUser()">
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

      <template #[`item.${customColumns.role}`]="{ item }">
        <v-select-with-validation
          dense
          outlined
          return-object
          hide-details
          :attach="false"
          data-test="user_roleId"
          :disabled="canNotManageRoleForUser(item)"
          :value="getRoleValue(item)"
          :item-text="(item) => item ? $m(item.text) : ''"
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
    </rc-data-table>

    <add-emis-user
      v-if="showAddEmisUserDialog"
      data-test="add-emis-user"
      :all-sub-roles="allActiveSubRoles"
      :all-access-level-roles="allAccessLevelRoles"
      :show.sync="showAddEmisUserDialog"
      @hide="showAddEmisUserDialog = false"
      @users-added="search(params)" />

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
  </div>
</template>

<script lang="ts">
import mixins from 'vue-typed-mixins';
import {
  RcPageContent,
  VSelectWithValidation,
  RcConfirmationDialog,
  RcDataTable,
} from '@libs/component-lib/components';
import { DataTableHeader } from 'vuetify';
import _cloneDeep from 'lodash/cloneDeep';
import { Route, NavigationGuardNext } from 'vue-router';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import {
  IOptionItem,
  IOptionSubItem,
} from '@libs/entities-lib/optionItem';

import AddEmisUser from '@/ui/views/pages/system-management/lists/add-emis-user/AddEmisUser.vue';
import routes from '@/constants/routes';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import {
  IdParams, IUserAccountCombined, IUserAccountEntity, IUserAccountMetadata,
} from '@libs/entities-lib/user-account';
import { IAzureSearchParams, IMultilingual } from '@libs/shared-lib/types';
import helpers from '@/ui/helpers/helpers';
import { Status } from '@libs/entities-lib/base';
import { useUiStateStore } from '@/pinia/ui-state/uiState';
import { CombinedStoreFactory } from '@libs/stores-lib/base/combinedStoreFactory';
import { useUserAccountMetadataStore, useUserAccountStore } from '@/pinia/user-account/user-account';
import { UserRolesNames, UserRoles } from '@libs/entities-lib/user';

export default mixins(TablePaginationSearchMixin).extend({
  name: 'UserAccounts',

  components: {
    RcPageContent,
    RcDataTable,
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
      options: {
        page: 1,
        sortBy: ['Metadata/DisplayName'],
        sortDesc: [false],
        itemsPerPage: 10,
      },
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
      disallowedLevels: [UserRolesNames.level6, UserRolesNames.contributorIM, UserRolesNames.contributorFinance,
        UserRolesNames.contributor3, UserRolesNames.readonly],
      disallowedRoles: [] as IOptionSubItem[], // Roles that a Level5 cannot change
      tableName: 'user-accounts',
      combinedUserAccountStore: new CombinedStoreFactory<IUserAccountEntity, IUserAccountMetadata, IdParams>(useUserAccountStore(), useUserAccountMetadataStore()),
    };
  },

  computed: {
    tableData(): IUserAccountCombined[] {
      return this.combinedUserAccountStore.getByIds(this.searchResultIds, { prependPinnedItems: true, baseDate: this.searchExecutionDate });
    },

    roles(): IOptionItem[] {
      return useUserAccountStore().getRoles();
    },

    headers(): Array<DataTableHeader> {
      return [
        {
          text: this.$t('system_management.userAccounts.name_header') as string,
          class: 'emis_member_header',
          filterable: true,
          sortable: true,
          align: 'start',
          value: this.customColumns.displayName,
          width: '25%',
        },
        {
          text: this.$t('system_management.userAccounts.emailUsername_header') as string,
          class: 'emis_member_header',
          filterable: true,
          sortable: true,
          value: this.customColumns.email,
          width: '25%',
        },
        {
          text: this.$t('system_management.userAccounts.role_header') as string,
          class: 'emis_member_header',
          filterable: false,
          sortable: true,
          value: this.customColumns.role,
          width: '25%',
        },
        {
          text: this.$t('system_management.userAccounts.status_header') as string,
          class: 'emis_member_header',
          filterable: false,
          sortable: true,
          value: this.customColumns.accountStatus,
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
        displayName: 'Metadata/DisplayName',
        email: 'Metadata/EmailAddress',
        role: `Metadata/RoleName/Translation/${this.$i18n.locale}`,
        accountStatus: 'Entity/AccountStatus',
        edit: 'edit',
        delete: 'delete',
      };
    },

    tableProps(): Record<string, unknown> {
      return {
        loading: useUserAccountStore().searchLoading,
        footerProps: { itemsPerPageOptions: [5, 10, 15, 250] },
      };
    },

    labels(): Record<string, unknown> {
      return {
        header: {
          title: this.$t('system_management.leftMenu.user_accounts_title'),
          searchPlaceholder: this.$t('common.inputs.quick_search'),
          addButtonLabel: this.$t('system_management.userAccounts.add_user_account_title'),
        },
      };
    },
  },

  watch: {
    'options.itemsPerPage': {
      handler(value: number) {
        useUiStateStore().setSearchTableState(this.tableName, _cloneDeep({
          itemsPerPage: value,
        }));
      },
    },
  },

  async created() {
    const prevState = useUiStateStore().getSearchTableState(this.tableName);
    if (prevState && prevState.itemsPerPage) {
      this.options.itemsPerPage = prevState.itemsPerPage;
    }
    await useUserAccountStore().fetchRoles();
    this.setRoles();
    this.loading = false;
  },

  methods: {
    async fetchData(params: IAzureSearchParams) {
      const res = await this.combinedUserAccountStore.search({
        search: params.search,
        filter: params.filter,
        top: params.top,
        skip: params.skip,
        orderBy: params.orderBy,
        count: true,
        queryType: 'full',
        searchMode: 'all',
      });
      return res;
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

    getRoleListItem(roleId: string) : { text:IMultilingual, value: string, isInactive: boolean } {
      const role = this.getSubRoleById(roleId);
      if (role) {
        return {
          text: role.name,
          value: role.id,
          isInactive: role.status === Status.Inactive,
        };
      }
      return { } as { text:IMultilingual, value: string, isInactive: boolean };
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

    updateUserRole(roleData: { text: IMultilingual, value: string }, user: IUserAccountCombined) {
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
        const resultAccount:IUserAccountEntity = await useUserAccountStore().assignRole(request);
        if (resultAccount) {
          this.search(this.params);
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
          const response = await useUserAccountStore().deactivate(this.userToDelete.entity.id);

          if (response) {
            this.search(this.params);
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
        if (this.$hasLevel(UserRoles.level5) && !this.$hasLevel(UserRoles.level6)
        && this.disallowedLevels.some((level) => level === accessLevel.name.translation.en)) {
          return;
        }

        const activeSubRoles: { text: IMultilingual, value: string }[] = [];
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
      if (this.$hasLevel(UserRoles.level5) && !this.$hasLevel(UserRoles.level6)) {
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
