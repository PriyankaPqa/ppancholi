<template>
  <v-row class="flex-row justify-space-between ma-0 pa-2 pt-6">
    <v-col class="d-flex ma-0 pa-1" md="12" lg="6">
      <span class="rc-heading-5" data-test="event-summary-section-title">{{ $t(title) }}</span>
    </v-col>
    <v-col class="d-flex justify-end ma-0 pa-0" md="12" lg="6">
      <v-btn
        v-if="canAdd"
        class="pl-3 pr-4"
        color="primary"
        data-test="add-section-button"
        @click="$emit('click-add-button', section)">
        <v-icon left size="16" color="white">
          mdi-plus
        </v-icon>
        {{ $t(buttonCaption) }}
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
    /**
     * Whether the user can add event sections
     */
    canAdd: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      texts: {
        [EEventSummarySections.CallCentre]: {
          title: 'eventSummary.callCentre',
          buttonCaption: 'eventSummary.addCallCentre',
        },
        [EEventSummarySections.RegistrationLocation]: {
          title: 'eventSummary.registrationLocation',
          buttonCaption: 'eventSummary.addRegistrationLocation',
        },
        [EEventSummarySections.ShelterLocation]: {
          title: 'eventSummary.shelterLocation',
          buttonCaption: 'eventSummary.addShelterLocation',
        },
        [EEventSummarySections.Agreement]: {
          title: 'eventSummary.agreement',
          buttonCaption: 'eventSummary.addAgreement',
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
