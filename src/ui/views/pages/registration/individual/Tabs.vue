<template>
  <v-navigation-drawer
    v-if="!$slots['navigation']"
    data-test="navigationWithoutValidation"
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

        <v-list-item-content class="rc-body14">
          {{ $t(tab.labelKey) }}
        </v-list-item-content>

        <v-list-item-icon>
          <v-icon v-if="tab.isTouched" :class="tab.isValid ? 'status_success--text' : 'status_error--text'">
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
import { ILeftMenuItem } from '@crctech/registration-lib/src/types/interfaces/ILeftMenuItem';
import Vue from 'vue';
import {
  mockPerson, mockAddress, mockContactInformation, mockCampGround, mockHouseholdMember,
} from '@crctech/registration-lib/src/entities/beneficiary';

export default Vue.extend({
  name: 'Tabs',

  data() {
    return {
      showErrorIcon: true,
      showSuccessIcon: true,
    };
  },

  computed: {
    tabs(): ILeftMenuItem[] {
      return this.$storage.registration.getters.tabs();
    },

    currentTab(): ILeftMenuItem {
      return this.$storage.registration.getters.currentTab();
    },

    isDev() {
      return process.env.NODE_ENV === 'development';
    },
  },

  methods: {
    prefill() {
      this.$storage.registration.mutations.setIsPrivacyAgreed(true);
      this.$storage.beneficiary.mutations.setPerson(mockPerson());
      this.$storage.beneficiary.mutations.setContactInformation(mockContactInformation());
      this.$storage.beneficiary.mutations.setHomeAddress(mockAddress());
      this.$storage.beneficiary.mutations.setTemporaryAddress(mockCampGround());
      this.$storage.beneficiary.mutations.addHouseholdMember(mockHouseholdMember(), false);
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
</style>
