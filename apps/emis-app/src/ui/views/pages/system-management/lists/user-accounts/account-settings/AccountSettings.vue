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
                      :status="user.accountStatus || accountStatus.Inactive" />
                  </span>
                </th>
                <th class="text-right">
                  <span class="rc-transparent-text">icon</span>
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
                  {{ userMetadata.givenName || basicUserData.firstName }}
                </td>
              </tr>
              <tr>
                <td>
                  {{ $t('user.accountSettings.last_name') }}
                </td>
                <td colspan="2" class="fw-bold" data-test="userAccount-status-lastName">
                  {{ userMetadata.surname || basicUserData.lastName }}
                </td>
              </tr>
              <tr>
                <td>
                  {{ $t('user.accountSettings.role') }}
                </td>
                <td colspan="2" class="fw-bold" data-test="userAccount-status-roleName">
                  {{ userMetadata.roleName ? $m(userMetadata.roleName) : basicUserData.roles[0] }}
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
                  {{ userMetadata.emailAddress || userMetadata.userPrincipalName || basicUserData.email }}
                </td>
              </tr>
              <tr>
                <td>
                  {{ $t('user.accountSettings.phone') }}
                </td>
                <td class="fw-bold" data-test="userAccount-status-phoneNumber">
                  {{ userMetadata.phoneNumber }}
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
import {
  AccountStatus, IUserAccountEntity, IUserAccountMetadata,
} from '@libs/entities-lib/user-account';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import { useUserStore } from '@/pinia/user/user';
import { Status } from '@libs/shared-lib/types';
import { IUser } from '@libs/entities-lib/user';
import { useUserAccountMetadataStore, useUserAccountStore } from '@/pinia/user-account/user-account';

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
      return useUserStore().getUser();
    },

    user(): IUserAccountEntity {
      return useUserAccountStore().getById(this.id);
    },

    userMetadata(): IUserAccountMetadata {
      return useUserAccountMetadataStore().getById(this.id);
    },

    id(): string {
      return this.$route.params.id || useUserStore().getUserId();
    },

    preferredLanguage(): string {
      const preferredLanguage = this.userMetadata.preferredLanguage;

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
      await useUserAccountStore().fetch(this.$route.params.id);
      await useUserAccountMetadataStore().fetch(this.$route.params.id, false);
    }
  },
});
</script>
