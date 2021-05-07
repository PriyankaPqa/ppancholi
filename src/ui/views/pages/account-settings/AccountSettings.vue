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
                      v-if="user.accountStatus"
                      data-test="userAccount-status-chip"
                      status-name="EUserAccountStatus"
                      :status="user.accountStatus" />
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
                  {{ user.firstName }}
                </td>
              </tr>
              <tr>
                <td>
                  {{ $t('user.accountSettings.last_name') }}
                </td>
                <td colspan="2" class="fw-bold" data-test="userAccount-status-lastName">
                  {{ user.lastName }}
                </td>
              </tr>
              <tr>
                <td>
                  {{ $t('user.accountSettings.role') }}
                </td>
                <td colspan="2" class="fw-bold" data-test="userAccount-status-roleName">
                  {{ $m(user.roleName) }}
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
                  {{ user.email }}
                </td>
              </tr>
              <tr>
                <td>
                  {{ $t('user.accountSettings.phone') }}
                </td>
                <td class="fw-bold" data-test="userAccount-status-phoneNumber">
                  {{ user.phoneNumber }}
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
                    :disabled="false" />
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
import { IUserAccount, EUserAccountStatus } from '@/entities/user-account';
import StatusChip from '@/ui/shared-components/StatusChip.vue';

import { SUPPORTED_LANGUAGES_INFO } from '@/constants/trans';

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
      EUserAccountStatus,
      preferredLanguage: { key: 'en', name: 'English' }, // Temporary mock until preferred language setting mechanism is put in place
    };
  },

  computed: {
    loading(): boolean {
      return this.$store.state.userAccount.searchLoading;
    },

    user(): IUserAccount {
      return this.$storage.userAccount.getters.userAccountById(this.id);
    },

    languages(): Record<string, string>[] {
      return SUPPORTED_LANGUAGES_INFO; // Temporary values until preferred language setting mechanism is put in place
    },
  },

  async  created() {
    const id = this.$storage.user.getters.userId();
    this.id = id;
    if (id) {
      await this.$storage.userAccount.actions.fetchUserAccount(id);
    }
  },

});
</script>
