<template>
  <div class="fixed-height pb-12">
    <template v-if="success">
      <div class="fixed-height mb-n8">
        <v-row no-gutters>
          <v-col cols="12" class="rc-body16 mb-3" data-test="confirm-registration-message">
            {{ confirmationMessage }}
          </v-col>

          <v-col cols="12" sm="6" class="grey-container pt-6 pl-6">
            <span class="rc-body12">{{ $t('event.beneficiaries.registration_number') }}</span>
            <br>
            <span class="registration-result" data-test="confirm-registration-number">{{ response.registrationNumber }}</span>
          </v-col>
          <v-col cols="12" sm="6" class="grey-container pa-6">
            <span class="rc-body12">{{ $t('registration.confirmation.event') }}</span>
            <br>
            <span class="registration-result" data-test="confirm-registration-event-name">{{ $m(event.name) }}</span>
          </v-col>

          <v-col cols="12" class="rc-body14 mt-3">
            <i18n path="registration.confirmation.additional_assistance" tag="div">
              <template #phone>
                <span class="fw-bold" data-test="confirm-registration-phoneAssistance">{{ phoneAssistance }}</span>
              </template>
            </i18n>
          </v-col>
        </v-row>
      </div>

      <!-- TODO -->
      <!-- <v-icon>mdi-information</v-icon>
      <span class="rc-body14 ml-2">{{ $t('registration.confirmation.email_sent') }}</span> -->
    </template>

    <div v-else>
      <h3>Unable to complete registration</h3>
    </div>
  </div>
</template>

<script lang="ts">
import { ICreateBeneficiaryResponse } from '@crctech/registration-lib/src/entities/beneficiary';
import { IEventData } from '@crctech/registration-lib/src/entities/event';
import { TranslateResult } from 'vue-i18n';
import Vue from 'vue';

export default Vue.extend({
  name: 'ConfirmRegistration',

  computed: {
    success() {
      return true;
    },
    response(): ICreateBeneficiaryResponse {
      return this.$storage.registration.getters.registrationResponse();
    },
    event(): IEventData {
      return this.$storage.registration.getters.event();
    },

    confirmationMessage(): TranslateResult {
      const fullName = `${this.response.person.firstName} ${this.response.person.middleName} ${this.response.person.lastName}`;
      return this.$t('registration.confirmation.thank_you', { x: fullName });
    },

    phoneAssistance(): string {
      return this.event.responseDetails?.assistanceNumber;
    },
  },
  methods: {},
});
</script>

<style scoped lang="scss">
.fixed-height {
  height: 100%;
}
.registration-result {
  font-size: 24px;
  font-weight: 500;
}
</style>
