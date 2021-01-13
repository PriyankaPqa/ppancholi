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
          <v-btn color="primary" @click="signIn">
            {{ $t('loginError.signIn') }}
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
      authenticationProvider.signIn();
    },
  },
});
</script>
