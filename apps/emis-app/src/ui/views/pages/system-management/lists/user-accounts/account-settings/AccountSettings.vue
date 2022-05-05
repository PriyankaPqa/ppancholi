<template>
  <rc-page-content v-if="user" :title="$t('user.accountSettings.title')">
    <v-row class="justify-center">
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
                      data-test="userAccount-status-chip"
                      status-name="AccountStatus"
                      :status="user.entity.accountStatus || accountStatus.Inactive" />
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
                  {{ user.metadata.givenName || basicUserData.firstName }}
                </td>
              </tr>
              <tr>
                <td>
                  {{ $t('user.accountSettings.last_name') }}
                </td>
                <td colspan="2" class="fw-bold" data-test="userAccount-status-lastName">
                  {{ user.metadata.surname || basicUserData.lastName }}
                </td>
              </tr>
              <tr>
                <td>
                  {{ $t('user.accountSettings.role') }}
                </td>
                <td colspan="2" class="fw-bold" data-test="userAccount-status-roleName">
                  {{ user.metadata.roleName? $m(user.metadata.roleName) : basicUserData.roles[0] }}
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
                  {{ user.metadata.emailAddress || user.metadata.userPrincipalName || basicUserData.email }}
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
  RcTooltip,
} from '@libs/component-lib/components';
import { IUserAccountCombined, AccountStatus } from '@/entities/user-account';
import StatusChip from '@/ui/shared-components/StatusChip.vue';

import { Status } from '@libs/core-lib/entities/base';
import { IUser } from '@/entities/user';

export default Vue.extend({
  name: 'AccountSettings',
  components: {
    RcPageContent,
    StatusChip,
    RcTooltip,
  },

  data() {
    return {
      AccountStatus,
      accountStatus: Status,
    };
  },

  computed: {
    //  Get user data for users without a role, which don't have access to the user-account API
    //  we'll only fill if we wanted the current user
    basicUserData() {
      if (this.$route.params.id) {
        return { roles: [] } as IUser;
      }
      return this.$storage.user.getters.user();
    },

    user(): IUserAccountCombined {
      return this.$storage.userAccount.getters.get(this.id);
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
  },

  async created() {
    if (this.$route.params.id) {
      await this.$storage.userAccount.actions.fetch(this.$route.params.id);
    }
  },
});
</script>
