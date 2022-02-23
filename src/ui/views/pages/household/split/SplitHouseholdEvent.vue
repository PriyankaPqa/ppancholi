<template>
  <v-row justify="center">
    <v-col cols="12" md="8">
      <h3>{{ $t('household.split.event') }}</h3>
      <div class="rc-body14 pb-4">
        {{ $t('household.split.event.select_an_event_text') }}
      </div>
      <v-autocomplete-with-validation
        v-model="event"
        outlined
        :items="events"
        :loading="loading"
        :item-text="(item) => $m(item.name)"
        return-object
        :attach="true"
        :rules="{required:true}"
        :label="`${$t('household.split.event.event_name')}*`"
        data-test="household_profile_split_event_select"
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
import { VAutocompleteWithValidation } from '@crctech/component-library';
import { CrcPrivacyStatement } from '@crctech/registration-lib';
import { IEventData, Event, IEvent } from '@crctech/registration-lib/src/entities/event';
import { EEventStatus, IEventMainInfo } from '@/entities/event';

export default Vue.extend({
  name: 'SplitHouseholdEvent',

  components: {
    VAutocompleteWithValidation,
    CrcPrivacyStatement,
  },

  data() {
    return {
      i18n: this.$i18n,
      loading: false,
      events: [] as Array<IEvent>,
      event: null as IEvent,
    };
  },

  async created() {
    const { event } = this.$store.state.registration;

    if (event) {
      this.event = new Event(event);
    }
    await this.fetchActiveEvents();
  },

  methods: {
    async fetchActiveEvents() {
      this.loading = true;
      const res = await this.$services.events.searchMyEvents({
        filter: {
          Entity: {
            Schedule: {
              Status: EEventStatus.Open,
            },
          },
        },
        top: 999,
      });
      this.loading = false;

      this.events = res?.value.map((e: IEventMainInfo) => new Event(e.entity as unknown as IEventData));
    },

    setEvent(event: IEvent) {
      this.$storage.registration.mutations.setEvent(event);
    },

  },
});

</script>
