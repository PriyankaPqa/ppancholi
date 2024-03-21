<template>
  <privacy-statement-lib
    :checkbox-label="$t('registration.privacy_statement.agreeCRC.individual')"
    :consent-statement="consentStatement">
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
            :item-text="(item) => getRegistrationLocationText(item)"
            return-object
            :items="activeRegistrationLocations"
            :rules="rules.privacyRegistrationLocation"
            :label="`${$t('registration.privacy_statement.registration_location')} *`"
            @change="setRegistrationLocation($event)" />
        </v-col>
      </v-row>
    </div>
  </privacy-statement-lib>
</template>

<script lang="ts">
import Vue from 'vue';
import { VSelectWithValidation, VTextFieldWithValidation } from '@libs/component-lib/components';
import helpers from '@libs/entities-lib/helpers';
import VueI18n from 'vue-i18n';
import { ERegistrationMethod } from '@libs/shared-lib/types';
import { IConsentStatement, FeatureKeys } from '@libs/entities-lib/tenantSettings';

import { EEventLocationStatus, IEventGenericLocation, IEventSummary } from '@libs/entities-lib/event';
import { IEventGenericLocationWithEventName } from '@libs/entities-lib/household-create';
import PrivacyStatementLib from './PrivacyStatementLib.vue';

export interface IUser {
  readonly id: string;
  readonly email: string;
  readonly lastName: string;
  readonly firstName: string;
  readonly roles: Array<string>;
  getFullName(): string;
  getInitials(): string;
  hasRole(role: string): boolean;
  hasLevel(level: string): boolean;
}

export default Vue.extend({
  name: 'CrcPrivacyStatement',

  components: {
    PrivacyStatementLib,
    VSelectWithValidation,
    VTextFieldWithValidation,
  },

  props: {
    i18n: {
      type: Object as () => VueI18n,
      required: true,
    },

    registrationLocations: {
      type: Array as () => IEventGenericLocation[],
      default: null,
    },

    user: {
      type: Object as () => IUser,
      required: true,
    },

    consentStatements: {
      type: Array as () => IConsentStatement[],
      default: null,
    },
  },

  data() {
    return {
      FeatureKeys,
      privacyRegistrationLocation: null as IEventGenericLocation,
    };
  },

  computed: {

    privacyCRCUsername: {
      get(): string {
        return this.$registrationStore.householdCreate.consentInformation.crcUserName;
      },
      set(userName: string) {
        this.$registrationStore.householdCreate.consentInformation.crcUserName = userName;
      },
    },

    privacyRegistrationMethod: {
      get(): ERegistrationMethod {
        return this.$registrationStore.householdCreate.consentInformation.registrationMethod;
      },
      set(method: ERegistrationMethod) {
        this.$registrationStore.householdCreate.consentInformation.registrationMethod = method;
      },
    },

    rules(): Record<string, unknown> {
      return {
        privacyCRCUsername: 'required',
        privacyRegistrationMethod: 'required',
        privacyRegistrationLocation: 'required',
      };
    },

    registrationMethods(): Record<string, unknown>[] {
      const methods = helpers.enumToTranslatedCollection(ERegistrationMethod, 'registration.privacy_statement', this.i18n);
      if (this.activeRegistrationLocations.length > 0) {
        return methods;
      }
      return methods.filter((m) => m.value !== ERegistrationMethod.InPerson);
    },

    activeRegistrationLocations(): IEventGenericLocation[] {
      if (this.registrationLocations) {
        return this.registrationLocations;
      }
      if (this.event?.registrationLocations) {
        return this.event.registrationLocations.filter((r) => r.status === EEventLocationStatus.Active);
      }
      return [];
    },
    consentStatement(): IConsentStatement {
      if (this.consentStatements && this.event?.consentStatementId) {
        return this.consentStatements.find((r) => r.id === this.event?.consentStatementId);
      }
      return null;
    },

    isRegistrationMethodInPerson(): boolean {
      return this.privacyRegistrationMethod === ERegistrationMethod.InPerson;
    },

    event(): IEventSummary {
      return this.$registrationStore.event;
    },

  },

  created() {
    this.autoFillUserName();
    this.loadRegistrationLocation();
  },

  methods: {
    resetPrivacyRegistrationLocation() {
      this.$registrationStore.householdCreate.consentInformation.registrationLocationId = null;
    },

    autoFillUserName() {
      if (!this.privacyCRCUsername) {
        this.$registrationStore.householdCreate.consentInformation.crcUserName = this.user.getFullName();
      }
    },

    setRegistrationLocation(location: IEventGenericLocation) {
      this.privacyRegistrationLocation = location;
      this.$registrationStore.householdCreate.consentInformation.registrationLocationId = location.id;
    },

    loadRegistrationLocation() {
      const registrationLocation = this.activeRegistrationLocations.find(
        (r) => r.id === this.$registrationStore.householdCreate.consentInformation.registrationLocationId,
      );
      if (registrationLocation) {
        this.privacyRegistrationLocation = registrationLocation;
      }
    },

    getRegistrationLocationText(item:IEventGenericLocationWithEventName): string {
        if (item.eventName) {
          return `${this.$m(item.name)} - ${this.$m(item.eventName)}`;
        }
        return this.$m(item.name);
    },
  },
});
</script>
