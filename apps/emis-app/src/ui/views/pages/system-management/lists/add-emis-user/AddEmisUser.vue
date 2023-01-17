<template>
  <rc-dialog
    :title="$t('system_management.userAccounts.add_user_account_title')"
    :submit-action-label="$t('common.buttons.add')"
    :submit-button-disabled="!isSubmitAllowed"
    :loading="loading"
    :cancel-action-label="$t('common.buttons.cancel')"
    :show.sync="show"
    :help-link="$t('zendesk.help_link.addEMISUser')"
    content-padding="6"
    content-only-scrolling
    fullscreen
    persistent
    show-close
    @close="close"
    @cancel="close"
    @submit="submit">
    <v-row>
      <v-col cols="6" class="px-6">
        <div class="left-container">
          <div>
            <p class="rc-body16 fw-bold">
              {{ $t('system_management.userAccounts.search_title') }}
            </p>
            <v-text-field
              ref="userSearch"
              v-model="searchTerm"
              clearable
              outlined
              prepend-inner-icon="mdi-magnify"
              data-test="team-search-input"
              :label="$t('common.search')"
              @input="debounceSearch($event)" />
          </div>
          <div class="table-container">
            <v-data-table
              v-if="searchTerm"
              ref="userResultTable"
              data-test="table"
              class="search_members"
              show-select
              hide-default-footer
              must-sort
              :loading-text="loadingText"
              :headers="headers"
              :item-class="getClassRow"
              :items="orderedUsers"
              :loading="loading"
              @toggle-select-all="onSelectAll">
              <template slot="no-data">
                <div>{{ $t('system_management.userAccounts.no_users_found') }}</div>
              </template>
              <template #[`item.data-table-select`]="{ item }">
                <v-simple-checkbox
                  :data-test="`select_${item.id}`"
                  :ripple="false"
                  :value="isSelected(item) || item.isEMISUser"
                  :readonly="item.isEMISUser"
                  :disabled="item.isEMISUser"
                  @input="toggleUserSelection(item)" />
              </template>
              <template #[`item.displayName`]="{ item }">
                {{ item.displayName }}
              </template>
              <template #[`item.emailAddress`]="{ item }">
                {{ item.mail }}
              </template>
            </v-data-table>
          </div>
        </div>
      </v-col>

      <v-col cols="6" class="px-6">
        <div class="right-container">
          <div class="rc-body16 fw-bold pb-4">
            {{ $t('system_management.userAccounts.selected_members') }}
          </div>
          <div class="selected__members_container pa-4">
            <table>
              <tbody>
                <tr v-for="(user) in orderedSelectedUsers" :key="user.id">
                  <td class="mb-4 selected-name">
                    <div class="rc-body14 fw-bold mb-4">
                      {{ user.displayName }}
                    </div>
                  </td>
                  <td>
                    <div class="mb-4 pl-3">
                      <v-select-with-validation
                        dense
                        outlined
                        return-object
                        hide-details
                        :item-text="(item) => item ? $m(item.text) : ''"
                        :label="$t('system_management.userAccounts.role_header')"
                        :items="allAccessLevelRoles"
                        @change="assignRoleToUser($event, user)" />
                    </div>
                  </td>
                  <td>
                    <div class="mb-4 d-flex justify-end">
                      <v-tooltip bottom>
                        <template #activator="{ on }">
                          <v-btn
                            icon
                            x-small
                            :data-test="`unselect_${user.id}`"
                            @click="toggleUserSelection(user)"
                            v-on="on">
                            <v-icon>mdi-close</v-icon>
                          </v-btn>
                        </template>
                        <span>{{ $t('eventSummary.deleteLinkTooltip') }}</span>
                      </v-tooltip>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </v-col>
    </v-row>
  </rc-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import _orderBy from 'lodash/orderBy';
import _difference from 'lodash/difference';
import { RcDialog, VSelectWithValidation } from '@libs/component-lib/components';
import { TranslateResult } from 'vue-i18n';
import _debounce from 'lodash/debounce';
import { DataTableHeader } from 'vuetify';
import helpers from '@/ui/helpers/helpers';
import {
  IOptionSubItem,
} from '@libs/entities-lib/optionItem';
import { IUserAccountCombined } from '@libs/entities-lib/user-account';
import { IAppUserData } from '@libs/entities-lib/app-user';
import { IMultilingual } from '@libs/shared-lib/types';
import { Status } from '@libs/entities-lib/base';

interface IAppUser extends IAppUserData {
  isEMISUser: boolean;
}

export default Vue.extend({
  name: 'AddEmisUser',

  components: {
    RcDialog,
    VSelectWithValidation,
  },

  props: {
    show: {
      type: Boolean,
      required: true,
    },
    allSubRoles: {
      type: Array,
      default: () => [] as Array<IOptionSubItem>,
      required: true,
    },
    allAccessLevelRoles: {
      type: Array as ()=> { header?: string, value?: string, name?: IMultilingual }[],
      required: true,
    },
  },

  data() {
    return {
      searchTerm: '',
      filteredActiveDirectoryUsers: [] as IAppUser[],
      filteredAppUsers: [] as IUserAccountCombined[],
      selectedUsers: [] as IAppUserData[],
      loading: false,
      isSubmitAllowed: false as boolean,
    };
  },

  computed: {
    headers(): Array<DataTableHeader> {
      return [
        {
          text: this.$t('system_management.userAccounts.member_name') as string,
          class: 'emis_member_header',
          filterable: false,
          sortable: true,
          value: 'displayName',
          width: '35%',
        },
        {
          text: this.$t('system_management.userAccounts.member_email') as string,
          class: 'emis_member_header',
          filterable: false,
          sortable: false,
          value: 'emailAddress',
        },
      ];
    },

    loadingText(): TranslateResult {
      return this.$t('system_management.userAccounts.loading_users');
    },

    customColumns(): Record<string, string> {
      return {
        name: `EventName/Translation/${this.$i18n.locale}`,
        email: `ResponseLevelName/Translation/${this.$i18n.locale}`,
      };
    },

    orderedUsers():IAppUser[] {
      return _orderBy(this.filteredActiveDirectoryUsers, 'displayName');
    },

    orderedSelectedUsers():IAppUserData[] {
      return _orderBy(this.selectedUsers, 'displayName');
    },
  },

  watch: {
    searchTerm(newVal, oldVal) {
      if (newVal && newVal.trim() !== oldVal?.trim()) {
        this.debounceSearch(newVal.trim());
      } else {
        this.filteredActiveDirectoryUsers = [];
      }
    },
  },

  methods: {
    async fetchAppUsers(searchTerm: string) {
      const res = await this.$storage.userAccount.actions.search({
        search: helpers.toQuickSearch(searchTerm),
        queryType: 'full',
        searchMode: 'all',
      });
      if (res?.ids?.length) {
        this.filteredAppUsers = this.$storage.userAccount.getters.getByIds(res.ids);
      }
    },

    close() {
      this.$emit('update:show', false);
    },

    async fetchActiveDirectoryUsers(searchTerm: string) {
      try {
        const ActiveDirectoryUsers = await this.$services.appUsers.findAppUsers(searchTerm);
        this.filteredActiveDirectoryUsers = ActiveDirectoryUsers.map((u) => ({
          ...u,
          isEMISUser: this.isAlreadyInEmis(u),
        }));
      } catch {
        this.filteredActiveDirectoryUsers = [];
      }
    },

    isAlreadyInEmis(user: IAppUserData): boolean {
      return this.filteredAppUsers.some((u) => u.entity.id === user.id && u.entity.status === Status.Active);
    },

    isSelected(user: IAppUserData):boolean {
      return this.selectedUsers && this.selectedUsers.findIndex((u) => user.id === u.id) > -1;
    },

    toggleUserSelection(user: IAppUser) {
      if (user) {
        user.roles = []; // Reset role assignment
        const indexOfSelectedUser:number = this.selectedUsers.findIndex((item) => item.id === user.id);
        if (indexOfSelectedUser >= 0) {
          this.selectedUsers.splice(indexOfSelectedUser, 1);
        } else {
          this.selectedUsers.push(user);
        }
        this.updateIsSubmitAllowed();
      }
    },

    getClassRow(user: IAppUser): string {
      if (user.isEMISUser) {
        return 'row_disabled';
      }
      if (this.isSelected(user)) {
        return 'row_active';
      }
      return '';
    },

    onSelectAll({ items, value }: { items: Array<IAppUser>; value: boolean }) {
      if (value) { // select all, get the new ones + old ones
        this.selectedUsers = [...this.selectedUsers, ...items.filter((i) => !i.isEMISUser && !this.selectedUsers.find((u) => u.id === i.id))];
      } else { // deselect, only remove what is currently removed
        this.selectedUsers = _difference(this.selectedUsers, items);
      }
      this.updateIsSubmitAllowed();
    },

    assignRoleToUser(roleData: { text: IMultilingual, value: string }, user: IAppUserData) {
      if (roleData) {
        user.roles = [
          {
            id: roleData.value,
            displayName: this.$m(roleData.text),
            value: null,
          },
        ];
        this.updateIsSubmitAllowed();
      }
    },

    async submit() {
      if (this.isSubmitAllowed) {
        this.loading = true;
        this.selectedUsers.forEach(async (user) => {
          // eslint-disable-next-line no-await-in-loop
          await this.setUserRole(user);
        });
        this.close();
        this.$emit('users-added');
      }
    },

    getSubRoleById(roleId: string) {
      return (this.allSubRoles as IOptionSubItem[]).find((r) => r.id === roleId);
    },

    async setUserRole(user: IAppUserData) {
      const subRole:IOptionSubItem = this.getSubRoleById(user.roles[0].id);

      if (subRole) {
        const payload = {
          subRole,
          userId: user.id,
        };

        const userAccount = await this.$storage.userAccount.actions.assignRole(payload);
        if (userAccount) {
          this.$toasted.global.success(this.$t('system_management.add_users.success'));
        } else {
          this.$toasted.global.error(this.$t('system_management.add_users.error'));
        }
      }
    },

    // Recheck if the Submit button should be enabled or not. It should be disabled if some selected users don't have a role set (their roles list is empty)
    updateIsSubmitAllowed() {
      this.isSubmitAllowed = this.selectedUsers?.length && !this.selectedUsers.find((u) => !u.roles?.length);
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    debounceSearch: _debounce(async function func(this:any, value) {
      if (value) {
        this.loading = true;
        await this.fetchAppUsers(value);
        await this.fetchActiveDirectoryUsers(value);
        this.loading = false;
      }
    }, 500),
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

  & table {
    width: 100%;
  }

  .selected-name {
    width: 25%;
  }
}
</style>
