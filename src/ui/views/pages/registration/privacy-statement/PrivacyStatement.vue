<template>
  <lib-privacy-statement :checkbox-label="$t('registration.privacy_statement.agreeCRC')">
    <div class="grey-container py-3 px-3">
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field-with-validation
            v-model="privacyCRCUsername"
            background-color="white"
            data-test="privacyCRCUsername"
            :rules="rules.privacyCRCUsername"
            :label="`${$t('registration.privacy_statement.crc_username')} *`" />
        </v-col>
        <v-col cols="12" md="6">
          <v-select-with-validation
            v-model="privacyRegistrationMethod"
            background-color="white"
            data-test="privacyRegistrationMethod"
            :items="registrationMethods"
            :rules="rules.privacyRegistrationMethod"
            :label="`${$t('registration.privacy_statement.registration_method')} *`"
            @change="resetPrivacyRegistrationLocation()" />
        </v-col>

        <v-col v-if="isRegistrationMethodInPerson" cols="12">
          <v-select-with-validation
            :value="privacyRegistrationLocation"
            background-color="white"
            data-test="privacyRegistrationLocation"
            :item-text="(item) => $m(item.name)"
            return-object
            :items="activeRegistrationLocations"
            :rules="rules.privacyRegistrationLocation"
            :label="`${$t('registration.privacy_statement.registration_location')} *`"
            @change="setRegistrationLocation($event)" />
        </v-col>
      </v-row>
    </div>
  </lib-privacy-statement>
</template>

<script lang="ts">
import Vue from 'vue';
import { PrivacyStatement as LibPrivacyStatement } from '@crctech/registration-lib';
import { VSelectWithValidation, VTextFieldWithValidation } from '@crctech/component-library';
import { ERegistrationMethod } from '@crctech/registration-lib/src/types';
import helpers from '@/ui/helpers';
import { IUser } from '@/entities/user';
import { EEventLocationStatus, IEvent, IEventGenericLocation } from '@crctech/registration-lib/src/entities/event';

export default Vue.extend({
  name: 'PrivacyStatement',

  components: {
    LibPrivacyStatement,
    VSelectWithValidation,
    VTextFieldWithValidation,
  },

  data() {
    return {
      privacyRegistrationLocation: null as IEventGenericLocation,
    };
  },

  computed: {

    privacyCRCUsername: {
      get(): string {
        return this.$store.state.registration.householdCreate.consentInformation.crcUserName;
      },
      set(userName: string) {
        this.$storage.registration.mutations.setPrivacyCRCUsername(userName);
      },
    },

    privacyRegistrationMethod: {
      get(): string {
        return this.$store.state.registration.householdCreate.consentInformation.registrationMethod;
      },
      set(method: ERegistrationMethod) {
        this.$storage.registration.mutations.setPrivacyRegistrationMethod(method);
      },
    },

    user(): IUser {
      return this.$storage.user.getters.user();
    },

    rules(): Record<string, unknown> {
      return {
        privacyCRCUsername: 'required',
        privacyRegistrationMethod: 'required',
        privacyRegistrationLocation: 'required',
      };
    },

    registrationMethods(): Record<string, unknown>[] {
      const methods = helpers.enumToTranslatedCollection(ERegistrationMethod, 'registration.privacy_statement');
      if (this.activeRegistrationLocations.length > 0) {
        return methods;
      }
      return methods.filter((m) => m.value !== ERegistrationMethod.InPerson);
    },

    activeRegistrationLocations(): IEventGenericLocation[] {
      if (this.event.registrationLocations) {
        return this.event.registrationLocations.filter((r) => r.status === EEventLocationStatus.Active);
      }
      return [];
    },

    isRegistrationMethodInPerson(): boolean {
      return this.privacyRegistrationMethod === ERegistrationMethod.InPerson;
    },

    event(): IEvent {
      return this.$storage.registration.getters.event();
    },

  },

  created() {
    this.autoFillUserName();
    this.loadRegistrationLocation();
  },

  methods: {
    resetPrivacyRegistrationLocation() {
      this.$storage.registration.mutations.setPrivacyRegistrationLocationId(null);
    },

    autoFillUserName() {
      if (!this.privacyCRCUsername) {
        this.$storage.registration.mutations.setPrivacyCRCUsername(this.user.getFullName());
      }
    },

    setRegistrationLocation(location: IEventGenericLocation) {
      this.privacyRegistrationLocation = location;
      this.$storage.registration.mutations.setPrivacyRegistrationLocationId(location.id);
    },

    loadRegistrationLocation() {
      const registrationLocation = this.activeRegistrationLocations.find(
        (r) => r.id === this.$store.state.registration.householdCreate.consentInformation.registrationLocationId,
      );
      if (registrationLocation) {
        this.privacyRegistrationLocation = registrationLocation;
      }
    },
  },
});
</script>
