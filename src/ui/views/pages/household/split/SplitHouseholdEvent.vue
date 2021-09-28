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
        :item-text="(item) => $m(item.entity.name)"
        return-object
        :attach="true"
        :rules="{required:true}"
        :label="$t('household.split.event.event_name')"
        data-test="household_profile_split_event_select" />
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import { VAutocompleteWithValidation } from '@crctech/component-library';
import { EEventStatus, IEventMainInfo } from '@/entities/event';

export default Vue.extend({
  name: 'SplitHouseholdEvent',

  components: {
    VAutocompleteWithValidation,
  },

  data() {
    return {
      loading: false,
      events: [] as Array<IEventMainInfo>,
      event: null as IEventMainInfo,
    };
  },

  async created() {
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
      this.events = res?.value;
    },

  },
});

</script>
