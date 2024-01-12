<template>
  <right-menu-template v-if="show" title-key="rightmenu.title" :show.sync="show">
    <template #main>
      <div class="pa-4">
        <div class="flex-row align-start">
          <v-avatar class="mr-4" color="grey darken-2" size="32" data-test="rightMenu__avatar">
            <span class="rc-body12 fw-medium white--text">
              {{ user.getInitials() }}
            </span>
          </v-avatar>

          <div>
            <div class="rc-title-3 fw-medium break-word" data-test="rightMenu__userName">
              {{ user.getFullName() }}
            </div>
          </div>
        </div>

        <v-divider v-if="user.email" class="my-4" />

        <div v-if="user.email" class="flex-row align-start align-center">
          <v-icon small>
            mdi-email
          </v-icon>
          <div class="rc-body14 break-word pl-2" data-test="rightMenu__email">
            {{ user.email }}
          </div>
        </div>

        <v-divider class="my-4" />

        <div class="flex-row align-start align-center">
          <v-icon small>
            mdi-account-circle
          </v-icon>
          <div class="rc-body14 break-word pl-2" data-test="rightMenu__role">
            <template v-if="user.hasRole(UserRoles.no_role)">
              {{ $t('rightmenu.noRoleAssigned') }}
            </template>
            <template v-else>
              {{ userAccountMetadata ? $m(userAccountMetadata.roleName) : '' }}
            </template>
          </div>
        </div>

        <v-divider class="my-4" />

        <div>
          <div class="rc-body12">
            {{ $t('rightmenu.switchTenant') }}
          </div>
          <div data-test="rightMenu__tenant">
            <v-select
              v-model="currentTenantId"
              data-test="rightMenu__tenantdd"
              :items="tenants"
              item-value="id"
              :aria-label="$t('rightmenu.switchTenant')"
              outlined
              @change="changeTenant()">
              <template #item="data">
                <div class="flex-row justify-space-between full-width">
                  <div>
                    {{ $m(data.item.name) }}
                  </div>
                  <v-icon v-if="currentTenantId === data.item.id" small color="status_success">
                    mdi-check-circle
                  </v-icon>
                </div>
              </template>
              <template #selection="data">
                <div class="flex-row justify-space-between full-width">
                  <div>
                    {{ $m(data.item.name) }}
                  </div>
                  <v-icon v-if="currentTenantId === data.item.id" small color="status_success">
                    mdi-check-circle
                  </v-icon>
                </div>
              </template>
            </v-select>
          </div>
        </div>

        <v-divider v-if="isDev" class="my-4" />

        <v-select
          v-if="isDev"
          :aria-label="$t('approvals.nestedTable.headers.roles')"
          outlined
          :items="[
            { text: 'No role', value: '' },
            { text: UserRoles.level1, value: UserRoles.level1 },
            { text: UserRoles.level2, value: UserRoles.level2 },
            { text: UserRoles.level3, value: UserRoles.level3 },
            { text: UserRoles.level4, value: UserRoles.level4 },
            { text: UserRoles.level5, value: UserRoles.level5 },
            { text: UserRoles.level6, value: UserRoles.level6 },
            { text: UserRoles.contributorIM, value: UserRoles.contributorIM },
            { text: UserRoles.contributorFinance, value: UserRoles.contributorFinance },
          ]"
          @change="useUserStore().setRole($event)" />
      </div>
    </template>
    <template #footer>
      <div class="rc-body12 pl-4 pb-1">
        {{ $t('rightmenu.version') }}: {{ appVersion }}
      </div>
      <v-divider />

      <v-list-item data-test="account-settings" link @click.native="accountSettings">
        <v-list-item-icon>
          <v-icon>
            mdi-cog
          </v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title>{{ $t('rightmenu.accountSettings') }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-divider />

      <v-list-item data-test="sign-out" link @click="logout">
        <v-list-item-icon>
          <v-icon color="secondary">
            mdi-logout-variant
          </v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title>{{ $t('common.logout.label') }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </template>
  </right-menu-template>
</template>

<script lang="ts">
import Vue from 'vue';
import { IUser, UserRoles } from '@libs/entities-lib/user';
import routes from '@/constants/routes';
import { IBrandingEntity } from '@libs/entities-lib/tenantSettings';
import {
  IUserAccountEntity, IUserAccountMetadata,
} from '@libs/entities-lib/user-account';
import { sessionStorageKeys } from '@/constants/sessionStorage';
import { Status } from '@libs/entities-lib/base';
import { useUserStore } from '@/pinia/user/user';
import { useDashboardStore } from '@/pinia/dashboard/dashboard';
import { useTenantSettingsStore } from '@/pinia/tenant-settings/tenant-settings';
import { useUserAccountMetadataStore, useUserAccountStore } from '@/pinia/user-account/user-account';
import RightMenuTemplate from './RightMenuTemplate.vue';

export default Vue.extend({
  name: 'RightMenu',

  components: {
    RightMenuTemplate,
  },

  data() {
    return {
      tenants: [] as IBrandingEntity[],
      currentTenantId: null as string,
      appVersion: '',
      UserRoles,
    };
  },

  computed: {
    show: {
      get(): boolean {
        return useDashboardStore().rightMenuVisible;
      },
      set(value: boolean) {
        useDashboardStore().rightMenuVisible = value;
      },
    },
    user(): IUser {
      return useUserStore().getUser();
    },
    isDev() {
      return process.env.VITE_APP_ENV === 'development';
    },
    userAccount(): IUserAccountEntity {
      return useUserAccountStore().getById(useUserStore().getUserId());
    },
    userAccountMetadata(): IUserAccountMetadata {
      return useUserAccountMetadataStore().getById(useUserStore().getUserId());
    },
  },

  async mounted() {
    const noAccess = useUserStore().getUser().hasRole(UserRoles.noAccess);
    this.appVersion = sessionStorage.getItem(sessionStorageKeys.appVersion.name);
    if (!noAccess) {
      await useUserAccountStore().fetch(useUserStore().getUserId(), false);
      await useUserAccountMetadataStore().fetch(useUserStore().getUserId(), false);
      if (this.userAccount) {
        this.currentTenantId = this.userAccount.tenantId;
      }

      // @ts-ignore
      if (!window.Cypress) { // Those calls require a new token in the BE. Origin of those calls is the APIM which is hard to whitelist for sign-in. No impact on E2E, so we can skip them
        this.tenants = await useTenantSettingsStore().fetchUserTenants();
        this.tenants = this.tenants.filter((t) => t.status === Status.Active);

        (await useTenantSettingsStore().fetchAll());
      }
    }
  },

  methods: {
    accountSettings() {
      if (this.$route.name !== routes.accountSettings.home.name) {
        this.$router.push({
          name: routes.accountSettings.home.name,
        });
      }
    },

    async logout() {
      await this.$signalR.unsubscribeAll();
      useUserStore().signOut();
    },

    changeTenant() {
      useTenantSettingsStore();
      const tenant = useTenantSettingsStore().getById(this.currentTenantId);
      // while testing we might want to switch to localhost... localhost is not https
      // outside of localhost everything is https.
      const url = this.$m(tenant.emisDomain).indexOf('localhost') > -1 ? `http://${this.$m(tenant.emisDomain)}` : `https://${this.$m(tenant.emisDomain)}`;
      window.location.href = url;
    },
  },
});
</script>
