<template>
  <div class="fixed-height pb-12">
    <template v-if="success">
      <div class="fixed-height mb-n8 flex-container">
        <v-row no-gutters class="flex-body">
          <v-col cols="12" class="rc-body16 mb-3" data-test="confirm-registration-message">
            <i18n :path="confirmationMessagePath" tag="div">
              <template #x>
                <span class="fw-bold" data-test="confirm-registration-full-name">{{ fullName }}</span>
              </template>
            </i18n>
          </v-col>

          <v-col cols="12" sm="6" class="grey-container pt-6 pl-6">
            <span class="rc-body12">{{ $t('event.beneficiaries.registration_number') }}</span>
            <br>
            <span class="registration-result" data-test="confirm-registration-number">{{ registrationNumber }}</span>
          </v-col>
          <v-col cols="12" sm="6" class="grey-container pa-6">
            <span class="rc-body12">{{ $t('registration.confirmation.event') }}</span>
            <br>
            <span class="registration-result" data-test="confirm-registration-event-name">{{ $m(event.name) }}</span>
          </v-col>

          <v-col v-if="!isCRCRegistration" cols="12" class="rc-body14 mt-3">
            <i18n path="registration.confirmation.additional_assistance" tag="div">
              <template #phone>
                <span class="fw-bold" data-test="confirm-registration-phoneAssistance">{{ phoneAssistance }}</span>
              </template>
            </i18n>
          </v-col>

          <v-col v-if="isCRCRegistration" cols="12" class="rc-body14 mt-3" data-test="confirm-registration-additional_assistance-fullname">
            <i18n path="registration.crc_confirmation.additional_assistance" tag="div">
              <template #x>
                <span class="fw-bold" data-test="confirm-registration-additional_assistance">{{ fullName }}</span>
              </template>
            </i18n>
          </v-col>
        </v-row>

        <div v-if="isCRCRegistration">
          <v-icon>mdi-information</v-icon>
          <span class="rc-body14 ml-2">{{ $t('registration.crc_confirmation.email_sent') }}</span>
        </div>
      </div>
    </template>

    <div v-else>
      <confirmation-error
        :is-crc-registration="isCRCRegistration"
        :errors="errors"
        :phone="phoneAssistance"
        @search-household="$emit('search-household')" />
    </div>
  </div>
</template>

<script lang="ts">
import { TranslateResult } from 'vue-i18n';
import Vue from 'vue';
import { IRegistrationMenuItem } from '../../types';
import { IHouseholdCreate, IHouseholdCreateData } from '../../../../entities-lib/src/household-create';
import { IEvent } from '../../../../entities-lib/src/registration-event';
import { IHouseholdEntity } from '../../../../entities-lib/src/household';
import ConfirmationError from './ConfirmationError.vue';
import { IServerError } from '../../../../shared-lib/src/types';

export default Vue.extend({
  name: 'ConfirmRegistration',
  components: {
    ConfirmationError,
  },

  computed: {
    success(): boolean {
      return !this.errors && this.response !== undefined;
    },

    associationMode(): boolean {
      return this.$store.state.registration.householdAssociationMode;
    },

    response(): IHouseholdEntity {
      return this.$storage.registration.getters.registrationResponse();
    },

    fullName(): string {
      const identity = this.household.primaryBeneficiary.identitySet;
      const fullName = `${identity.firstName} ${identity.middleName} ${identity.lastName}`;
      return fullName;
    },

    household(): IHouseholdCreate {
      return this.$storage.registration.getters.householdCreate();
    },

    errors(): IServerError {
      return this.$storage.registration.getters.registrationErrors();
    },

    event(): IEvent {
      return this.$storage.registration.getters.event();
    },

    confirmationMessagePath(): TranslateResult {
      if (this.associationMode) {
        return 'registration.confirmation.associate';
      }
      if (this.isCRCRegistration) {
        return 'registration.crc_confirmation.thank_you';
      }
      return 'registration.confirmation.thank_you';
    },

    registrationNumber(): string {
      return this.associationMode ? (this.household as IHouseholdCreateData).registrationNumber : this.response?.registrationNumber;
    },

    phoneAssistance(): string {
      return this.event.responseDetails?.assistanceNumber || '';
    },

    isCRCRegistration(): boolean {
      return this.$storage.registration.getters.isCRCRegistration();
    },

    initialTitle(): string {
      return this.$storage.registration.getters.currentTab()?.titleKey || '';
    },
    initialButtonText(): string {
      return this.$storage.registration.getters.currentTab()?.nextButtonTextKey || '';
    },
  },

  watch: {
    success: {
      immediate: true,
      handler(success) {
        if (!success) {
          this.setTabWithError();
        } else {
          this.clearTabError();
        }
      },
    },
  },

  methods: {
    setTabWithError() {
      this.$storage.registration.mutations.mutateCurrentTab((tab: IRegistrationMenuItem) => {
        tab.nextButtonTextKey = 'common.cancel';
        tab.titleKey = 'registration.confirmation.error';
        tab.isValid = false;
      });
    },

    clearTabError() {
      this.$storage.registration.mutations.mutateCurrentTab(this.clearTabErrorFunc);
    },

    clearTabErrorFunc(tab: IRegistrationMenuItem) {
      tab.nextButtonTextKey = this.initialButtonText;
      tab.titleKey = this.initialTitle;
      tab.isValid = true;
    },
  },
});
</script>

<style scoped lang="scss">
.fixed-height {
  height: 100%;
}

.flex-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.flex-body {
  flex-grow: 0;
}

.registration-result {
  font-size: 24px;
  font-weight: 500;
}
</style>
