<template>
  <div class="container">
    <div class="error-banner">
      <div class="error-message">
        <h3 class="rc-heading-3">
          {{ $t('loginError.title') }}
        </h3>

        <p class="rc-body14">
          {{ $t('loginError.message') }}
        </p>

        <div>
          <v-btn color="primary" data-test="loginError__signInButton" @click="signIn">
            {{ $t('loginError.signIn') }}
          </v-btn>

          <v-btn class="ml-4" text data-test="loginError__signOutButton" @click="signOut">
            {{ $t('common.logout.label') }}
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import authenticationProvider from '@/auth/AuthenticationProvider';

export default Vue.extend({
  name: 'LoginError',

  methods: {
    signIn() {
      authenticationProvider.signIn(process.env.VUE_APP_AUTH_AAD_REDIRECT_URI);
    },

    signOut() {
      authenticationProvider.signOut();
    },
  },
});
</script>
