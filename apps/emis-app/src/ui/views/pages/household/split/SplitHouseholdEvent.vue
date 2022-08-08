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
        :rules="{required:true}"
        @change="setEvent($event)" />
      <h4 v-if="event" class="pb-3">
        {{ $t('household.split.privacy_policy') }}
      </h4>
      <crc-privacy-statement v-if="event" :i18n="i18n" />
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import CrcPrivacyStatement from '@libs/registration-lib/components/privacy-statement/CrcPrivacyStatement.vue';
import EventsSelector from '@/ui/shared-components/EventsSelector.vue';
import { RegistrationEvent, IEvent } from '@libs/entities-lib/registration-event';

export default Vue.extend({
  name: 'SplitHouseholdEvent',

  components: {
    CrcPrivacyStatement,
    EventsSelector,
  },

  data() {
    return {
      i18n: this.$i18n,
      event: null as IEvent,
    };
  },

  async created() {
    const { event } = this.$store.state.registration;
    if (event) {
      this.event = new RegistrationEvent(event);
    }
  },

  methods: {
    setEvent(event: IEvent) {
      this.$storage.registration.mutations.setEvent(event);
      this.event = event;
    },

  },
});

</script>
