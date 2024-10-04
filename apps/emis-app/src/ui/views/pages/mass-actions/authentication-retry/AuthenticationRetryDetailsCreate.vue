<template>
  <div>
    <div class="rc-body16 fw-bold mb-6">
      {{ $t('massActions.authenticationRetry.details.title') }}
    </div>
    <div class="grey-container pa-6">
      <v-row>
        <v-col cols="12">
          <events-selector
            v-model="formCopy.event"
            async-mode
            :force-events="filteredEvents"
            return-object
            data-test="authentication_retry_event_name"
            fetch-all-events
            :label="`${$t('massActions.authenticationRetry.create.event.label')} *`"
            :rules="rules.event"
            @click:clear="onClearEvent()"
            @change="onSetEvent($event)" />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-select-with-validation
          v-model="formCopy.tier"
          data-test="authentication_retry_details_tier"
          :items="authenticationTiers"
          :rules="rules.tier"
          :label="`${$t('massActions.authenticationRetry.create.authenticationTier.label')} *`" />
        </v-col>
      </v-row>
      
     
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import cloneDeep from 'lodash/cloneDeep';
import EventsSelector from '@/ui/shared-components/EventsSelector.vue';
import { VSelectWithValidation } from '@libs/component-lib/components';
import { IEventEntity } from '@libs/entities-lib/event';
import {AuthenticationTier } from '@libs/entities-lib/mass-action';
import { AuthenticationRetryDetailsForm } from './AuthenticationRetryCreate.vue';
import helpers from '@/ui/helpers/helpers';

export default Vue.extend({
  name: 'AuthenticationRetryDetailsCreate',

  components: {
    EventsSelector,
    VSelectWithValidation,
  },

  props: {
    form: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      loadingEvent: false,
      filteredEvents: [],
      formCopy: null as AuthenticationRetryDetailsForm,
      authenticationTiers: helpers.enumToTranslatedCollection(AuthenticationTier, 'enums.authenticationTier'),
    };
  },

  computed: {
    rules(): Record<string, unknown> {
      return {
        event: {
          required: true,
        },
        tier: {
          required: true,
        },
      };
    },
  },

  watch: {
    formCopy: {
      deep: true,
      handler(newVal) {
        this.$emit('update', newVal);
      },
    },

    'formCopy.event': {
      async handler(newEvent) {
        if (newEvent) {
          this.onSetEvent(newEvent);
        }
      },
    },
  },

  async created() {
    this.formCopy = cloneDeep(this.form);
  },

  methods: {
    onClearEvent() {
      this.onSetEvent(null);
    },

    async onSetEvent(event: IEventEntity) {
      this.formCopy.event = event;
    },
  },
});
</script>
