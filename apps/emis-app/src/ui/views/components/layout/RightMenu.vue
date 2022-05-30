<template>
  <v-navigation-drawer
    :value="show"
    app
    right
    temporary
    :width="$vuetify.breakpoint.xs ? '100%' : '450px'"
    :style="$vuetify.breakpoint.xs ? '' : `top: ${$vuetify.application.top}px`"
    :height="$vuetify.breakpoint.xs ? '100%' : `calc(100vh - ${$vuetify.application.top}px)`"
    @input="updateShow">
    <v-toolbar color="grey darken-2" height="56" flat dark>
      <v-toolbar-title class="rc-title-3 white--text">
        {{ $t('rightmenu.title') }}
      </v-toolbar-title>
      <v-spacer />
      <v-btn icon data-test="closeButton" @click="updateShow(false)">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-toolbar>

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
          <template v-if="user.hasRole(NO_ROLE)">
            {{ $t('rightmenu.noRoleAssigned') }}
          </template>
          <template v-else>
            {{ userAccount && userAccount.metadata ? $m(userAccount.metadata.roleName) : '' }}
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
        outlined
        :items="[
          {text: 'No role', value: ''},
          {text: 'level1', value: 'level1'},
          {text: 'level2', value: 'level2'},
          {text: 'level3', value: 'level3'},
          {text: 'level4', value: 'level4'},
          {text: 'level5', value: 'level5'},
          {text: 'level6', value: 'level6'},
          {text: 'contributorIM', value: 'contributorIM'},
          {text: 'contributorFinance', value: 'contributorFinance'},
        ]"
        @change="$store.commit('user/setRole', $event);" />
    </div>

    <template #append>
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
  </v-navigation-drawer>
</template>

<script lang="ts">
import Vue from 'vue';
import { IUser, NO_ROLE } from '@/entities/user';
import routes from '@/constants/routes';
import { IBrandingEntity } from '@/entities/tenantSettings';
import { IUserAccountCombined } from '@/entities/user-account';
import { sessionStorageKeys } from '@/constants/sessionStorage';
import { Status } from '@libs/core-lib/entities/base';

export default Vue.extend({
  name: 'RightMenu',

  data() {
    return {
      NO_ROLE,
      userAccount: null as IUserAccountCombined,
      tenants: [] as IBrandingEntity[],
      currentTenantId: null as string,
      appVersion: '',
    };
  },

  computed: {
    show(): boolean {
      return this.$store.state.dashboard.rightMenuVisible;
    },
    user(): IUser {
      return this.$storage.user.getters.user();
    },
    isDev() {
      return process.env.NODE_ENV === 'development';
    },
  },

  async mounted() {
    const noAccess = this.$storage.user.getters.user().hasRole('noAccess');
    this.appVersion = sessionStorage.getItem(sessionStorageKeys.appVersion.name);
    if (!noAccess) {
      this.userAccount = await this.$storage.userAccount.actions.fetch(this.$storage.user.getters.userId(),
        { useEntityGlobalHandler: false, useMetadataGlobalHandler: false });
      this.currentTenantId = this.userAccount.entity?.tenantId;
      this.tenants = await this.$storage.tenantSettings.actions.fetchUserTenants();
      this.tenants = this.tenants.filter((t) => t.status === Status.Active);
      (await this.$storage.tenantSettings.actions.fetchAll());
    }
  },

  methods: {
    updateShow(value: boolean) {
      this.$storage.dashboard.mutations.setProperty({
        property: 'rightMenuVisible',
        value,
      });
    },

    accountSettings() {
      if (this.$route.name !== routes.accountSettings.home.name) {
        this.$router.push({
          name: routes.accountSettings.home.name,
        });
      }
    },

    async logout() {
      await this.$signalR.unsubscribeAll();
      this.$storage.user.actions.signOut();
    },

    changeTenant() {
      const tenant = this.$storage.tenantSettings.getters.get(this.currentTenantId).entity;
      // while testing we might want to switch to localhost... localhost is not https
      // outside of localhost everything is https.
      const url = this.$m(tenant.emisDomain).indexOf('localhost') > -1 ? `http://${this.$m(tenant.emisDomain)}` : `https://${this.$m(tenant.emisDomain)}`;

      window.location.href = url;
    },
  },
});
</script>
