<template>
  <v-row class="flex-row justify-space-between ma-0 pa-2 pt-6">
    <v-col class="d-flex ma-0 pa-0" md="12" lg="6">
      <span class="rc-heading-5" data-test="event-summary-section-title">{{ title }}</span>
    </v-col>
    <v-col class="d-flex justify-end ma-0 pa-0" md="12" lg="6">
      <v-btn
        class="pl-3 pr-4"
        color="primary"
        data-test="add-section-button"
        @click="$emit('click-add-button', section)">
        <v-icon left size="16" color="white">
          mdi-plus
        </v-icon>
        {{ buttonCaption }}
      </v-btn>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import { EEventSummarySections } from '@/types';

export default Vue.extend({
  name: 'EventSummary',

  props: {
    /**
     * Section to which the header belongs
     */
    section: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      texts: {
        [EEventSummarySections.CallCentre]: {
          title: this.$t('eventSummary.callCentre'),
          buttonCaption: this.$t('eventSummary.addCallCentre'),
        },
        [EEventSummarySections.RegistrationLocation]: {
          title: this.$t('eventSummary.registrationLocation'),
          buttonCaption: this.$t('eventSummary.addRegistrationLocation'),
        },
        [EEventSummarySections.ShelterLocation]: {
          title: this.$t('eventSummary.shelterLocation'),
          buttonCaption: this.$t('eventSummary.addShelterLocation'),
        },
        [EEventSummarySections.Agreement]: {
          title: this.$t('eventSummary.agreement'),
          buttonCaption: this.$t('eventSummary.addAgreement'),
        },
      } as Record<string, {title: string, buttonCaption: string}>,
    };
  },
  computed: {
    title() : string {
      return this.texts[this.section].title;
    },

    buttonCaption(): string {
      return this.texts[this.section].buttonCaption;
    },
  },

});

</script>
