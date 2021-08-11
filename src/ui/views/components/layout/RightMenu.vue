<template>
  <v-navigation-drawer
    :value="show"
    app
    right
    temporary
    :width="$vuetify.breakpoint.xs ? '100%' : '350px'"
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

    <div class="flex-row align-start pa-4">
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

    <div v-if="user.email" class="flex-row align-start align-center ps-4 pb-4">
      <v-icon small>
        mdi-email
      </v-icon>
      <div class="rc-body14 break-word pl-2" data-test="rightMenu__email">
        {{ user.email }}
      </div>
    </div>

    <div class="flex-row align-start align-center ps-4">
      <v-icon small>
        mdi-account-circle
      </v-icon>
      <div class="rc-body14 break-word pl-2" data-test="rightMenu__role">
        <template v-if="user.hasRole(NO_ROLE)">
          {{ $t('rightmenu.noRoleAssigned') }}
        </template>
        <template v-else>
          {{ $t(`user.role.${user.currentRole()}`) }}
        </template>
      </div>
    </div>

    <v-select
      v-if="isDev"
      class="mt-4 pa-4"
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

    <template #append>
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

export default Vue.extend({
  name: 'RightMenu',

  data() {
    return {
      NO_ROLE,

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

    logout() {
      this.$storage.user.actions.signOut();
    },
  },
});
</script>
