<template>
  <div>
    <div class="rc-heading-5 fw-bold mb-6">
      {{ $t('massActions.communication.details.title') }}
    </div>

    <v-row v-for="(row, index) in rows" :key="index" no-gutters :class="[row.customClass, 'row-data']">
      <v-col cols="12" md="5">
        <span class="rc-body14 fw-bold">{{ $t(row.label) }}</span>
      </v-col>
      <v-col md="7">
        <span v-if="!row.loading" :class="[row.customClassValue, 'rc-body14']" :data-test="row.dataTest">
          <!-- eslint is disabled because we purposefully decided to inject html in this -->
          <!-- eslint-disable -->
          <p v-if="row.html" v-html="row.html"/>
          <!-- eslint-enable -->
          <div v-else>{{ row.value }}</div>
        </span>
        <v-progress-circular v-else indeterminate color="primary" />
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import { IMassActionCommunicationDetails, IMassActionEntity, MassActionCommunicationMethod } from '@libs/entities-lib/mass-action';
import { IEventEntity } from '@libs/entities-lib/event';
import { useEventStore } from '@/pinia/event/event';

export default Vue.extend({
  name: 'CommunicationDetailsTable',

  props: {
    massAction: {
      type: Object as () => IMassActionEntity,
      required: true,
    },
  },

  data() {
    return {
      event: null as IEventEntity,
      eventLoading: false,
    };
  },
  computed: {
    rows(): Record<string, unknown>[] {
      return [
        {
          label: 'massActions.financialAssistance.create.event.label',
          value: this.$m(this.event?.name),
          dataTest: 'event',
          loading: this.eventLoading,
        },
        {
          label: 'massActions.communication.create.communicationMethod.label',
          value: this.$t((this.massAction.details as IMassActionCommunicationDetails).method === MassActionCommunicationMethod.Email
          ? 'enums.communicationMethod.Email' : 'enums.communicationMethod.SMS'),
          dataTest: 'communicationMethod',
        },
        {
          label: 'massActions.communication.create.messageSubject.label',
          value: this.$m((this.massAction.details as IMassActionCommunicationDetails).messageSubject),
          dataTest: 'messageSubject',
        },
        {
          label: 'massActions.communication.create.messageText.label',
          html: this.$m((this.massAction.details as IMassActionCommunicationDetails).message),
          dataTest: 'communicationMessage',
        },
      ];
    },
  },
  async created() {
    this.fetchEvent();
  },

  methods: {
    async fetchEvent() {
      this.eventLoading = true;
      this.event = await useEventStore().fetch(this.massAction.details.eventId) as IEventEntity;
      this.eventLoading = false;
    },
  },
});
</script>

<style lang="scss" scoped>

.grey-back {
  background-color: var(--v-grey-lighten5);
}

.row-data {
  min-height: 60px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border: solid var(--v-grey-lighten2);
  border-width: 1px 1px 0px 1px;
}
.row-data:last-child {
  border-bottom-right-radius: 4px;
  border-bottom-left-radius: 4px;
  border-width: 1px 1px 1px 1px;
}
.row-data:first-child {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  border-width: 1px 1px 0px 1px;
}
.row-data:only-child {
  border-width: 1px 1px 1px 1px;
}

</style>
