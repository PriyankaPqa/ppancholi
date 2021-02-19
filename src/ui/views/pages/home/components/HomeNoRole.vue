<template>
  <rc-page-content :title="$t('noRoles.welcome')">
    <v-container class="fill-height">
      <v-row justify="center">
        <v-col cols="12" md="8">
          <div class="border text-center">
            <div class="rc-body16 font-weight-bold mb-4 mt-8" data-test="account_settings__title">
              {{ $t('noRoles.welcome') }}, {{ user.getFullName() }}
            </div>
            <div class="rc-body14" data-test="account_settings__subtitle">
              {{ $t('noRoles.welcomeMessage') }}
            </div>
            <v-btn color="primary" class="mt-8 mb-8" data-test="account_settings__submit" @click.native="redirect">
              <v-icon left>
                mdi-cog
              </v-icon>
              <span data-test="account_settings__submit_label">
                {{ $t('noRoles.leftMenuTitle') }}
              </span>
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </rc-page-content>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcPageContent } from '@crctech/component-library';
import { IUser } from '@/entities/user';
import routes from '@/constants/routes';

export default Vue.extend({
  name: 'HomeNoRole',

  components: {
    RcPageContent,
  },

  computed: {
    user(): IUser {
      return this.$storage.user.getters.user();
    },
  },

  methods: {
    redirect() {
      this.$router.push({ name: routes.accountSettings.home.name });
    },
  },
});
</script>

<style scoped lang="scss">

.border {
  border: 1px solid var(--v-grey-lighten2);
  padding: 16px 32px;
}
</style>
