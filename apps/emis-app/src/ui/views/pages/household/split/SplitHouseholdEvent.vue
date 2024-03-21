<template>
  <v-row justify="center">
    <v-col cols="12" md="8">
      <h3>{{ $t('household.split.event') }}</h3>
      <div class="rc-body14 pb-4">
        {{ $t('household.split.event.select_an_event_text') }}
      </div>
      <events-selector
        v-model="event"
        return-object
        async-mode
        :label="`${$t('household.split.event.event_name')}*`"
        data-test="household_profile_split_event_select"
        :rules="{ required: true }"
        @change="setEvent($event)" />
      <h4 v-if="event" class="pb-3">
        {{ $t('household.split.privacy_policy') }}
      </h4>
      <crc-privacy-statement v-if="event" :i18n="i18n" :user="user" :consent-statements="consentStatements" />
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import CrcPrivacyStatement from '@libs/registration-lib/components/privacy-statement/CrcPrivacyStatement.vue';
import EventsSelector from '@/ui/shared-components/EventsSelector.vue';
import { RegistrationEvent } from '@libs/entities-lib/registration-event';
import { IUser } from '@libs/entities-lib/user';
import { useUserStore } from '@/pinia/user/user';
import { useRegistrationStore } from '@/pinia/registration/registration';
import { useTenantSettingsStore } from '@/pinia/tenant-settings/tenant-settings';
import { IConsentStatement } from '@libs/entities-lib/tenantSettings';
import { IEventSummary } from '@libs/entities-lib/event';

export default Vue.extend({
  name: 'SplitHouseholdEvent',

  components: {
    CrcPrivacyStatement,
    EventsSelector,
  },

  data() {
    return {
      i18n: this.$i18n,
      event: null as IEventSummary,
    };
  },
  computed: {
    user(): IUser {
      return useUserStore().getUser();
    },
    consentStatements(): Array<IConsentStatement> {
      return useTenantSettingsStore().currentTenantSettings.consentStatements;
    },
  },

  async created() {
    const event = useRegistrationStore().event;
    if (event) {
      this.event = new RegistrationEvent(event);
    }
  },

  methods: {
    async setEvent(event: IEventSummary) {
      if (event.registrationAssessments?.length) {
        const assessment = await this.$services.assessmentForms.get({ id: event.registrationAssessments[0].assessmentId });
        useRegistrationStore().setAssessmentToComplete({ assessmentForm: assessment, registrationAssessment: event.registrationAssessments[0] });
      } else {
        useRegistrationStore().setAssessmentToComplete(null);
      }

      if (useRegistrationStore().event && useRegistrationStore().event !== event) {
        this.resetConsent();
      }

      useRegistrationStore().event = event;
      this.event = event;
    },

    resetConsent() {
      useRegistrationStore().isPrivacyAgreed = false;
      useRegistrationStore().householdCreate.consentInformation.registrationMethod = null;
      useRegistrationStore().householdCreate.consentInformation.registrationLocationId = null;
      useRegistrationStore().householdCreate.consentInformation.privacyDateTimeConsent = null;
    },

  },
});

</script>
