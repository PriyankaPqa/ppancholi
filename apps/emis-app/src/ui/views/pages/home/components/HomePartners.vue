<template>
  <rc-page-content title="PARTNER FUTURE PAGE">
    <v-container class="fill-height">
      <v-row justify="center">
        <v-col cols="12" md="8">
          <div class="border text-center">
            <div class="rc-body16 font-weight-bold mb-4 mt-8" data-test="account_settings__title">
              Future page for partners, {{ user.getFullName() }}, of role {{ user.roles[0] }}
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </rc-page-content>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcPageContent } from '@libs/component-lib/components';
import { IUser } from '@libs/entities-lib/user';
import { useUserStore } from '@/pinia/user/user';

export default Vue.extend({
  name: 'HomePartners',

  components: {
    RcPageContent,
  },

  computed: {
    user(): IUser {
      return useUserStore().getUser();
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
