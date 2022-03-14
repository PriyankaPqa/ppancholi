<template>
  <rc-page-content v-if="user" :title="$t('user.accountSettings.title')">
    <rc-page-loading v-if="loading" data-test="loading" />
    <v-row v-else class="justify-center">
      <v-col cols="12" lg="7">
        <v-sheet rounded outlined class="mt-8">
          <v-simple-table>
            <thead>
              <tr>
                <th class="text-left" style="width: 30%">
                  <span class="rc-body18 fw-bold">{{ $t('user.accountSettings.profile') }}</span>
                </th>
                <th class="text-left">
                  <span class="fw-normal">
                    <status-chip
                      v-if="user.entity.accountStatus"
                      data-test="userAccount-status-chip"
                      status-name="AccountStatus"
                      :status="user.entity.accountStatus" />
                  </span>
                </th>
                <th class="text-right">
                  <v-icon>
                    mdi-account-circle
                  </v-icon>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  {{ $t('user.accountSettings.first_name') }}
                </td>
                <td colspan="2" class="fw-bold" data-test="userAccount-status-firstName">
                  {{ user.metadata.givenName }}
                </td>
              </tr>
              <tr>
                <td>
                  {{ $t('user.accountSettings.last_name') }}
                </td>
                <td colspan="2" class="fw-bold" data-test="userAccount-status-lastName">
                  {{ user.metadata.surname }}
                </td>
              </tr>
              <tr>
                <td>
                  {{ $t('user.accountSettings.role') }}
                </td>
                <td class="fw-bold" data-test="userAccount-status-roleName" style="width: 40%">
                  <div v-if="$hasLevel('level5')">
                    <v-select-with-validation
                      v-model="currentRole"
                      :attach="false"
                      item-value="id"
                      :item-disabled="(item) => item.status !== activeStatus"
                      :item-text="(item) => item ? $m(item.name) : ''"
                      :disabled="disableForL5"
                      dense
                      outlined
                      return-object
                      hide-details
                      data-test="user_roleId"
                      :label="$t('system_management.userAccounts.role_header')"
                      :items="allAccessLevelRoles" />
                  </div>
                  <div v-else>
                    {{ $m(user.metadata.roleName) }}
                  </div>
                </td>
                <td>
                  <div v-if="roleHasChanged">
                    <v-btn
                      small
                      color="primary"
                      data-test="apply-role-button"
                      @click="applyRoleChange()">
                      {{ $t('common.apply') }}
                    </v-btn>
                    <v-btn
                      icon
                      data-test="cancel-role-change"
                      @click="resetCurrentRole()">
                      <v-icon>
                        mdi-close
                      </v-icon>
                    </v-btn>
                  </div>
                </td>
              </tr>
            </tbody>
          </v-simple-table>
        </v-sheet>

        <v-sheet rounded outlined class="mt-6">
          <v-simple-table>
            <thead>
              <tr>
                <th class="text-left" colspan="2">
                  <span class="rc-body18 fw-bold">{{ $t('user.accountSettings.contact_info') }}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="width: 30%">
                  {{ $t('user.accountSettings.email_username') }}
                </td>
                <td class="fw-bold" data-test="userAccount-status-email">
                  {{ user.metadata.emailAddress || user.metadata.userPrincipalName }}
                </td>
              </tr>
              <tr>
                <td>
                  {{ $t('user.accountSettings.phone') }}
                </td>
                <td class="fw-bold" data-test="userAccount-status-phoneNumber">
                  {{ user.metadata.phoneNumber }}
                </td>
              </tr>
            </tbody>
          </v-simple-table>
        </v-sheet>

        <v-sheet rounded outlined class="mt-6">
          <v-simple-table>
            <thead>
              <tr>
                <th class="text-left" colspan="3">
                  <span class="rc-body18 fw-bold">{{ $t('user.accountSettings.preferences') }}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="width: 30%">
                  <v-icon medium class="mr-1">
                    language
                  </v-icon>
                  {{ $t('user.accountSettings.language') }}
                </td>
                <td class="fw-bold" data-test="userAccount-language-preferences">
                  {{ preferredLanguage }}
                  <rc-tooltip top>
                    <template #activator="{ on }">
                      <v-icon small class="ml-1" v-on="on">
                        mdi-help-circle-outline
                      </v-icon>
                    </template>
                    {{ $t('account_settings.preferredLanguage.tooltip') }}
                  </rc-tooltip>
                </td>
                <td />
              </tr>
            </tbody>
          </v-simple-table>
        </v-sheet>
      </v-col>
    </v-row>
  </rc-page-content>
</template>

<script lang="ts">
import Vue from 'vue';
import {
  RcPageContent,
  RcPageLoading,
  VSelectWithValidation,
  RcTooltip,
} from '@libs/component-lib/components';
import { NavigationGuardNext, Route } from 'vue-router';
import { IUserAccountCombined, AccountStatus } from '@/entities/user-account';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import {
  IOptionItem, IOptionSubItem,
} from '@/entities/optionItem';
import helpers from '@/ui/helpers/helpers';

import { Status } from '@/entities/base';

export default Vue.extend({
  name: 'AccountSettings',
  components: {
    RcPageContent,
    RcPageLoading,
    VSelectWithValidation,
    StatusChip,
    RcTooltip,
  },

  async beforeRouteLeave(to: Route, from: Route, next: NavigationGuardNext) {
    await helpers.confirmBeforeLeaving(this, this.roleHasChanged, next);
  },

  data() {
    return {
      AccountStatus,
      loading: false,
      currentRole: null as IOptionSubItem,
      allAccessLevelRoles: [] as Array<IOptionSubItem|{header: string, id?: string}>,
      activeStatus: Status.Active,
      allRoles: [] as IOptionSubItem[],
      disableForL5: false,
    };
  },

  computed: {
    roles(): IOptionItem[] {
      return this.$storage.userAccount.getters.roles();
    },

    user(): IUserAccountCombined {
      return this.$storage.userAccount.getters.get(this.id);
    },

    roleHasChanged() : boolean {
      if (this.currentRole) {
        return this.user?.entity?.roles && this.user.entity.roles[0]?.optionItemId !== this.currentRole?.id;
      }
      return false;
    },

    id(): string {
      return this.$route.params.id || this.$storage.user.getters.userId();
    },

    preferredLanguage(): string {
      const preferredLanguage = this.user.metadata.preferredLanguage;

      if (preferredLanguage?.includes('en')) {
        return `${this.$t('enums.preferredLanguage.English')} (${preferredLanguage})`;
      }

      if (preferredLanguage?.includes('fr')) {
        return `${this.$t('enums.preferredLanguage.French')} (${preferredLanguage})`;
      }

      return `${this.$t('account_settings.preferredLanguage.notSet')}`;
    },

    isL5(): boolean {
      return this.$hasLevel('level5') && !this.$hasLevel('level6');
    },
  },

  async created() {
    await Promise.all([this.$storage.userAccount.actions.fetchRoles(), this.fetchUserAccount(this.id)]);

    if (!this.$hasRole('noAccess')) {
      await this.setRoles();
    }

    this.resetCurrentRole();
  },

  methods: {
    async setRoles() {
      this.setAllAccessLevelRoles(this.roles);
      this.allRoles = this.roles.reduce((acc: IOptionSubItem[], curr: IOptionItem) => acc.concat(curr.subitems), []);
    },

    // set the hierarchical list of roles and subroles in the format needed for the dropdown of the select component
    setAllAccessLevelRoles(roles: IOptionItem[]) {
      if (roles?.length) {
        roles.forEach((accessLevel: IOptionItem) => {
          let subitems: IOptionSubItem[];

          if (this.isL5 && this.isLevelNotAllowedForL5(accessLevel)) {
            subitems = this.setNonEditableRolesForL5(accessLevel);
          } else {
            subitems = accessLevel.subitems;
          }

          const activeSubRoles: IOptionSubItem[] = [];
          subitems.forEach((role: IOptionSubItem) => {
            if (role.status === Status.Active || (this.user.entity.roles && this.user.entity.roles[0]?.optionItemId === role.id)) {
              activeSubRoles.push(role);
            }
          });
          if (activeSubRoles.length) {
            this.allAccessLevelRoles.push({
              header: this.$m(accessLevel.name),
            });
            activeSubRoles.forEach((a) => this.allAccessLevelRoles.push(a));
          }
        });
      }
    },

    async applyRoleChange() {
      if (this.currentRole) {
        try {
          this.loading = true; // Visual cue of busy state
          const request = {
            subRole: this.currentRole,
            userId: this.user.entity.id,
          };
          const r = await this.$storage.userAccount.actions.assignRole(request);
          if (r) {
            this.$toasted.global.success(this.$t('system_management.userAccounts.role_update_success'));
          }
        } finally {
          this.loading = false;
        }
      }
    },

    resetCurrentRole() {
      if (this.user.entity.roles && this.user.entity.roles[0]) {
        this.currentRole = this.allRoles.find((l) => l.id === this.user.entity.roles[0].optionItemId) as IOptionSubItem;
      }
    },

    async fetchUserAccount(id: string) {
      this.loading = true;
      try {
        await this.$storage.userAccount.actions.fetch(id);
      } finally {
        this.loading = false;
      }
    },

    isLevelNotAllowedForL5(level: IOptionItem): boolean {
      return ['Level 6', 'ContributorIM', 'ContributorFinance', 'Contributor 3', 'Read Only']
        .some((lev) => lev === level.name.translation.en);
    },

    setNonEditableRolesForL5(level: IOptionItem): IOptionSubItem[] {
      const roleToDisable = level.subitems.find((sub) => sub.id === this.user.entity.roles[0]?.optionItemId);
      if (roleToDisable) {
        this.disableForL5 = true;
        return [roleToDisable];
      }
      return [];
    },

  },
});
</script>
