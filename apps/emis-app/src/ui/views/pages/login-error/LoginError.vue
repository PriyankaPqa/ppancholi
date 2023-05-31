<template>
  <div id="login-error">
    <div>
      <v-alert type="error" border="left" elevation="1">
        {{ title }}
      </v-alert>

      <v-card elevation="1" class="pa-4 rc-body14">
        {{ message }}
      </v-card>

      <div class="actions">
        <v-btn color="primary" class="mt-4 mb-1" data-test="loginError__signInButton" @click="signIn">
          {{ $t('loginError.signIn') }}
        </v-btn>
        <v-btn data-test="loginError__signOutButton" @click="signOut">
          {{ $t('loginError.signOut') }}
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import AuthenticationProvider from '@/auth/AuthenticationProvider';

export default Vue.extend({
  name: 'LoginError',

  data() {
    return {
      title: this.$i18n.t(this.$route.params.title) || this.$i18n.t('loginError.title'),
      message: this.$i18n.t(this.$route.params.message) || this.$i18n.t('loginError.message'),
      userInactive: false,
    };
  },

  methods: {
    signIn() {
      AuthenticationProvider.signIn(AuthenticationProvider.currentDomainTenant);
    },

    signOut() {
      AuthenticationProvider.signOut();
    },
  },
});
</script>

<style lang="scss" scoped>

#login-error {
  background-color: var(--v-grey-lighten4) !important;
  height: 100%;
  display: flex;
  justify-content: center;

  & > div {
    margin:auto;
    max-width: 400px;
  }

  & .actions {
    display: flex;
    flex-direction: column;
  }
}

</style>
