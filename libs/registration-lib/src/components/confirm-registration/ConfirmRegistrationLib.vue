<template>
  <div class="fixed-height pb-12">
    <template v-if="success">
      <div class="fixed-height mb-n8 flex-container">
        <div class="flex-body">
          <v-row no-gutters>
            <v-col cols="12" class="registration-result mb-3" data-test="confirm-registration-message">
              <i18n :path="confirmationMessagePath" tag="div">
                <template #x>
                  <span class="fw-bold" data-test="confirm-registration-full-name">{{ fullName }}</span>
                </template>
              </i18n>
            </v-col>
          </v-row>

          <v-row no-gutters class="grey-container pa-6">
            <v-col cols="12" sm="6">
              <span class="rc-body12">{{ $t('event.beneficiaries.registration_number') }}</span>
              <br>
              <span class="registration-result" data-test="confirm-registration-number">{{ registrationNumber }}</span>
            </v-col>
            <v-col cols="12" sm="6">
              <span class="rc-body12">{{ $t('registration.confirmation.event') }}</span>
              <br>
              <span class="registration-result" data-test="confirm-registration-event-name">{{ $m(event.name) }}</span>
            </v-col>
          </v-row>

          <v-row no-gutters>
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
        </div>
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
import { IHouseholdCreate, IHouseholdCreateData } from '@libs/entities-lib/src/household-create';
import { IEvent } from '@libs/entities-lib/src/registration-event';
import { IDetailedRegistrationResponse } from '@libs/entities-lib/src/household';
import { IServerError } from '@libs/shared-lib/src/types';
import ConfirmationError from './ConfirmationError.vue';
import { IRegistrationMenuItem } from '../../types';

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
      return this.$registrationStore.householdAssociationMode;
    },

    response(): IDetailedRegistrationResponse {
      return this.$registrationStore.registrationResponse;
    },

    fullName(): string {
      const identity = this.household.primaryBeneficiary.identitySet;
      const fullName = `${identity.firstName} ${identity.middleName} ${identity.lastName}`;
      return fullName;
    },

    household(): IHouseholdCreate {
      return this.$registrationStore.getHouseholdCreate();
    },

    errors(): IServerError {
      return this.$registrationStore.registrationErrors;
    },

    event(): IEvent {
      return this.$registrationStore.getEvent();
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
      return this.associationMode ? (this.household as IHouseholdCreateData).registrationNumber : this.response?.household?.registrationNumber;
    },

    phoneAssistance(): string {
      return this.event.responseDetails?.assistanceNumber || '';
    },

    isCRCRegistration(): boolean {
      return this.$registrationStore.isCRCRegistration();
    },

    initialTitle(): string {
      return this.$registrationStore.getCurrentTab()?.titleKey || '';
    },
    initialButtonText(): string {
      return this.$registrationStore.getCurrentTab()?.nextButtonTextKey || '';
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
      this.$registrationStore.mutateCurrentTab((tab: IRegistrationMenuItem) => {
        tab.nextButtonTextKey = 'common.cancel';
        tab.titleKey = 'registration.confirmation.error';
        tab.isValid = false;
      });
    },

    clearTabError() {
      this.$registrationStore.mutateCurrentTab(this.clearTabErrorFunc);
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
