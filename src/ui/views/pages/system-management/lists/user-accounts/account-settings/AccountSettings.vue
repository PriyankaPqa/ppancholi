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
                  <div v-if="$hasLevel('level6')">
                    <v-select-with-validation
                      v-model="currentRole"
                      item-value="id"
                      :item-text="(item) => item ? $m(item.name) : ''"
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
                  {{ user.metadata.emailAddress }}
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
                <td style="width: 40%">
                  <v-select-with-validation
                    v-model="preferredLanguage"
                    hide-details
                    dense
                    class="py-2 rc-body10"
                    width="50%"
                    data-test="userAccount-language-preferences"
                    :label="`${$t('user.accountSettings.language')} *`"
                    :items="languages"
                    :item-text="(item) => item.name"
                    return-object
                    @change="setPreferredLanguage($event)" />
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
} from '@crctech/component-library';
import { IUserAccountCombined, AccountStatus } from '@/entities/user-account';
import StatusChip from '@/ui/shared-components/StatusChip.vue';

import { SUPPORTED_LANGUAGES_INFO } from '@/constants/trans';
import {
  EOptionListItemStatus, EOptionLists, IOptionItem, IOptionSubItem,
} from '@/entities/optionItem';

export default Vue.extend({
  name: 'AccountSettings',
  components: {
    RcPageContent,
    RcPageLoading,
    VSelectWithValidation,
    StatusChip,
  },

  data() {
    return {
      id: null,
      AccountStatus,
      preferredLanguage: null,
      loading: false,
      currentRole: null as IOptionSubItem,
      allAccessLevelRoles: [] as Array<IOptionSubItem|{header: string, id?: string}>,
    };
  },

  computed: {
    user(): IUserAccountCombined {
      return this.$storage.userAccount.getters.get(this.id);
    },

    languages(): Record<string, string>[] {
      return SUPPORTED_LANGUAGES_INFO; // Temporary values until preferred language setting mechanism is put in place
    },

    roleHasChanged() : boolean {
      return this.user?.entity?.roles && this.user.entity.roles[0]?.optionItemId !== this.currentRole?.id;
    },
  },

  async created() {
    try {
      this.loading = true;
      const id = this.$route.params.id || this.$storage.user.getters.userId();
      this.id = id;
      if (id) {
        await this.$storage.userAccount.actions.fetch(id);
      }
    } finally {
      this.loading = false;
    }

    await this.setRoles();
    this.resetCurrentRole();
    this.preferredLanguage = this.languages.find((l) => l.key === this.user.metadata.preferredLanguage);
  },

  methods: {
    setPreferredLanguage({ key }: {key:string;}) {
      this.$storage.userAccount.actions.setUserPreferredLanguage(this.id, key);
    },

    async setRoles() {
      this.$storage.optionList.mutations.setList(EOptionLists.Roles);
      const roles = await this.$storage.optionList.actions.fetchItems();
      this.setAllAccessLevelRoles(roles);
    },

    // set the hierarchical list of roles and subroles in the format needed for the dropdown of the select component
    setAllAccessLevelRoles(roles: IOptionItem[]) {
      if (roles?.length) {
        roles.forEach((accessLevel : IOptionItem) => {
          this.allAccessLevelRoles.push({
            header: this.$m(accessLevel.name),
          });
          accessLevel.subitems.forEach((role: IOptionSubItem) => {
            if (role.status === EOptionListItemStatus.Active) {
              this.allAccessLevelRoles.push(role);
            }
          });
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
        this.currentRole = this.allAccessLevelRoles.find((l) => l.id === this.user.entity.roles[0].optionItemId) as IOptionSubItem;
      }
    },

  },

});
</script>
