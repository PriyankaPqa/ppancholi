<template>
  <v-navigation-drawer
    v-if="!$slots['navigation']"
    floating
    color="grey lighten-5"
    width="100%"
    style="height: auto;"
    :value="true"
    permanent>
    <v-list>
      <v-list-item
        v-for="(tab, index) in tabs"
        :key="index"
        :disabled="tab.disabled"
        :class="{ navMenu__active: currentTab.id === tab.id }"
        :data-test="`registration-tab-${tab.id}`"
        @click="$emit('jump', index)">
        <v-list-item-icon v-if="tab.icon">
          <v-icon
            :color="currentTab.id === tab.id ? 'secondary' : 'primary darken-1'"
            :data-test="`registration-tab-icon-${tab.id}`"
            v-text="tab.icon" />
        </v-list-item-icon>

        <v-list-item-content class="rc-body14 fw-bold">
          {{ $t(tab.labelKey) }}
        </v-list-item-content>

        <v-list-item-icon class="ml-0">
          <v-icon v-if="tab.isTouched" size="18" :class="[tab.isValid ? 'status_success--text' : 'status_error--text']">
            {{ tab.isValid ? 'mdi-checkbox-marked-circle' : 'mdi-alert-circle' }}
          </v-icon>
        </v-list-item-icon>
      </v-list-item>

      <div v-if="isDev" class="dev-container">
        <v-btn @click="prefill">
          Fill data
        </v-btn>
      </div>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { IRegistrationMenuItem } from '@crctech/registration-lib/src/types/interfaces/IRegistrationMenuItem';
import Vue from 'vue';
import {
  mockMember, mockAddress, mockContactInformation, mockCampGround, mockAdditionalMember,
} from '@crctech/registration-lib/src/entities/household-create';

export default Vue.extend({
  name: 'Tabs',

  data() {
    return {
      showErrorIcon: true,
      showSuccessIcon: true,
    };
  },

  computed: {
    tabs(): IRegistrationMenuItem[] {
      return this.$storage.registration.getters.tabs();
    },

    currentTab(): IRegistrationMenuItem {
      return this.$storage.registration.getters.currentTab();
    },

    isDev() {
      return process.env.NODE_ENV === 'development';
    },
  },

  methods: {
    prefill() {
      this.$storage.registration.mutations.setIsPrivacyAgreed(true);
      this.$storage.registration.mutations.setPrimaryBeneficiary(mockMember());
      this.$storage.registration.mutations.setContactInformation(mockContactInformation());
      this.$storage.registration.mutations.setHomeAddress(mockAddress());
      this.$storage.registration.mutations.setCurrentAddress(mockCampGround());
      this.$storage.registration.mutations.addAdditionalMember(mockAdditionalMember(), false);
    },
  },
});
</script>

<style scoped lang="scss">
.dev-container {
  margin-top: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.navMenu__active {
  background: var(--v-grey-lighten4);
  border-left: 4px solid var(--v-secondary-base);
}
</style>
