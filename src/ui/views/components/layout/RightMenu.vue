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
        {{ $t('dashboard.rightmenu.title') }}
      </v-toolbar-title>
      <v-spacer />
      <v-btn icon data-test="closeButton" @click="updateShow(false)">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-toolbar>

    <div class="flex-row align-start pa-4">
      <v-avatar class="mr-4" color="grey lighten-4" size="32" data-test="rightMenu__avatar">
        <span class="rc-body12 fw-medium">
          {{ user.getInitials() }}
        </span>
      </v-avatar>

      <div>
        <div class="rc-title-3 fw-medium break-word" data-test="rightMenu__userName">
          {{ user.getFullName() }}
        </div>

        <div class="rc-body12 break-word" data-test="rightMenu__email">
          {{ user.email }}
        </div>
      </div>
    </div>

    <template #append>
      <v-divider />

      <!--      <v-list-item data-test="account-settings" link @click="accountSettings">-->
      <!--        <v-list-item-icon>-->
      <!--          <v-icon>-->
      <!--            mdi-cog-->
      <!--          </v-icon>-->
      <!--        </v-list-item-icon>-->

      <!--        <v-list-item-content>-->
      <!--          <v-list-item-title>{{ $t('dashboard.rightmenu.accountSettings') }}</v-list-item-title>-->
      <!--        </v-list-item-content>-->
      <!--      </v-list-item>-->

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

export default Vue.extend({
  name: 'RightMenu',
  computed: {
    show() {
      return this.$store.state.dashboard.rightMenuVisible;
    },
    user() {
      return this.$storage.user.getters.user();
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
      // this.$router.push({
      //   name: routes.accountSettings.name,
      // });
    },

    logout() {
      this.$storage.user.actions.signOut();
    },
  },
});
</script>
