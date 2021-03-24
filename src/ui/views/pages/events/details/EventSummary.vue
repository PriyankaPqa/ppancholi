<template>
  <rc-page-content :outer-scroll="true" :title="$t('eventSummary.title')" :show-help="true" :help-link="$t('zendesk.help_link.editEvent')">
    <template slot="top">
      <div class="flex-row justify-space-between ma-0 pa-0 pb-4">
        <v-col class="d-flex ma-0 pa-0" cols="10">
          <span class="pr-4">
            <status-select
              data-test="event-detail-status"
              :value="event.schedule.status"
              :statuses="statuses"
              status-name="EEventStatus"
              @input="onStatusChangeInit($event)" />
          </span>

          <span class="rc-body14 borderLeft pa-0 pr-1 pl-4"> {{ $t('eventSummary.response') }}: </span>
          <span class="rc-body14" data-test="event-summary-response-level">
            {{ $m(event.responseLevelName) }}
          </span>
        </v-col>

        <v-col cols="2" class="text-right ma-0 pa-0">
          <v-btn icon data-test="event-edit-button" @click="editEvent()">
            <v-icon>
              mdi-pencil
            </v-icon>
          </v-btn>
        </v-col>
      </div>
    </template>

    <template slot="default">
      <event-summary-link
        data-test="event_summary_link"
        :event="event" />

      <div class="pa-2 pt-6">
        <div class="rc-body16 fw-bold">
          {{ $t('event.description') }}
        </div>
        <div class="pt-2 pb-0 rc-body14 event-description" data-test="event-summary-description">
          {{ $m(event.description) }}
        </div>
      </div>

      <event-summary-section-title
        :section="EEventSummarySections.CallCentre"
        @click-add-button="onSectionAdd($event)" />

      <event-summary-section-title
        :section="EEventSummarySections.RegistrationLocation"
        @click-add-button="onSectionAdd($event)" />

      <event-summary-section-title
        :section="EEventSummarySections.ShelterLocation"
        @click-add-button="onSectionAdd($event)" />

      <event-summary-section-title
        :section="EEventSummarySections.Agreement"
        @click-add-button="onSectionAdd($event)" />

      <event-status-dialog
        v-if="showEventStatusDialog && newStatus"
        data-test="event-summary-status-dialog"
        :to-status="newStatus"
        :show.sync="showEventStatusDialog"
        @submit="onStatusChange($event)"
        @cancelChange="showEventStatusDialog = false" />
    </template>
  </rc-page-content>
</template>

<script lang="ts">
import Vue from 'vue';
import _cloneDeep from 'lodash/cloneDeep';
import { RcPageContent } from '@crctech/component-library';
import StatusSelect from '@/ui/shared-components/StatusSelect.vue';
import routes from '@/constants/routes';
import { EEventStatus, IEvent, Event } from '@/entities/event';
import { EEventSummarySections } from '@/types/enums/EEventSummarySections';
import EventSummaryLink from './components/EventSummaryLink.vue';
import EventSummarySectionTitle from './components/EventSummarySectionTitle.vue';
import EventStatusDialog from './components/EventStatusDialog.vue';

export default Vue.extend({
  name: 'EventSummary',
  components: {
    RcPageContent,
    StatusSelect,
    EventSummaryLink,
    EventSummarySectionTitle,
    EventStatusDialog,
  },

  data() {
    return {
      error: false,
      statuses: [EEventStatus.Open, EEventStatus.OnHold, EEventStatus.Archived, EEventStatus.Closed],
      newStatus: null,
      showEventStatusDialog: false,
      loading: false,
      EEventStatus,
      EEventSummarySections,
    };
  },

  computed: {
    event(): IEvent {
      const { id } = this.$route.params;
      return this.$storage.event.getters.eventById(id) || new Event();
    },

  },

  async created() {
    try {
      const { id } = this.$route.params;
      if (id) {
        await this.$storage.event.actions.fetchEvent(id);
      }
    } catch {
      this.error = true;
    }
  },

  methods: {
    editEvent() {
      this.$router.replace({
        name: routes.events.edit.name,
        params: {
          id: this.event.id,
        },
      });
    },

    onStatusChangeInit(status: EEventStatus) {
      if (status === EEventStatus.Open || status === EEventStatus.Closed) {
        this.newStatus = status;
        this.showEventStatusDialog = true;
      } else {
        this.onStatusChange({ status, reason: null });
      }
    },

    onStatusChange({ status, reason }: {status: EEventStatus, reason: string}) {
      this.showEventStatusDialog = false;
      const updatedEvent = _cloneDeep(this.event);
      updatedEvent.schedule.status = status;
      if (status === EEventStatus.Open) {
        updatedEvent.schedule.reOpenReason = reason;
      }
      if (status === EEventStatus.Closed) {
        updatedEvent.schedule.closeReason = reason;
        updatedEvent.schedule.closeDate = new Date(); // TODO complete with all the rules for changing status
      }
      // call action to change status (next stories)
    },

    onSectionAdd(section: string) {
      // open dialog for adding section data ( next stories )
      return false;
    },
  },
});

</script>

<style scoped>
  .borderLeft { border-left: thin solid lightgrey; }
   .event-description {white-space: pre-line; }
</style>
