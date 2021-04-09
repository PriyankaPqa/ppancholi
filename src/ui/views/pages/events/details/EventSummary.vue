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

        <v-col v-if="showEditButton" cols="2" class="text-right ma-0 pa-0">
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
      <div>
        <div
          v-for="callCentre in sortedCallCentres"
          :key="callCentre.name.translation.en"
          class="justify-end mx-2 my-0 pa-4 pb-6 event-section-item">
          <event-call-centre-section
            data-test="call-centre-section"
            :call-centre="callCentre"
            @edit="editSection($event, EEventSummarySections.CallCentre)" />
        </div>
      </div>

      <event-summary-section-title
        :section="EEventSummarySections.RegistrationLocation"
        @click-add-button="onSectionAdd($event)" />

      <event-location-section
        data-test="registration-location-section"
        data-test-prefix="registration"
        :locations="event.registrationLocations"
        @edit="editSection($event, EEventSummarySections.RegistrationLocation)" />

      <event-summary-section-title
        :section="EEventSummarySections.ShelterLocation"
        @click-add-button="onSectionAdd($event)" />

      <event-location-section
        data-test="shelter-location-section"
        data-test-prefix="shelter"
        :locations="event.shelterLocations"
        @edit="editSection($event, EEventSummarySections.ShelterLocation)" />

      <event-summary-section-title
        :section="EEventSummarySections.Agreement"
        @click-add-button="onSectionAdd($event)" />
      <div>
        <div
          v-for="agreement in sortedAgreements"
          :key="agreement.name.translation.en"
          class="justify-end mx-2 my-0 pa-4 pb-6 event-section-item">
          <event-agreement-section
            data-test="agreement-section"
            :agreement="agreement"
            :agreement-types="agreementTypes"
            :event-id="event.id"
            @edit="editSection($event, EEventSummarySections.Agreement)" />
        </div>
      </div>

      <event-status-dialog
        v-if="showEventStatusDialog && newStatus"
        data-test="event-summary-status-dialog"
        :to-status="newStatus"
        :show.sync="showEventStatusDialog"
        @submit="onStatusChange($event)"
        @cancelChange="showEventStatusDialog = false" />
    </template>
    <component
      :is="currentDialog.component"
      v-if="currentDialog"
      :id="currentDialog.id"
      :event.sync="event"
      :is-edit-mode="currentDialog.isEditMode"
      :agreement-types="agreementTypes"
      @close="currentDialog = null" />
  </rc-page-content>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcPageContent } from '@crctech/component-library';
import StatusSelect from '@/ui/shared-components/StatusSelect.vue';
import routes from '@/constants/routes';
import helpers from '@/ui/helpers';
import {
  EEventStatus, IEvent, Event, IEventCallCentre, IEventAgreement,
} from '@/entities/event';
import { EEventSummarySections } from '@/types';
import { IOptionItem } from '@/entities/optionItem';
import EventSummaryLink from './components/EventSummaryLink.vue';
import EventSummarySectionTitle from './components/EventSummarySectionTitle.vue';
import EventStatusDialog from './components/EventStatusDialog.vue';
import EventCallCentreDialog from './components/EventCallCentreDialog.vue';
import EventRegistrationLocationDialog from './components/EventRegistrationLocationDialog.vue';
import EventShelterLocationDialog from './components/EventShelterLocationDialog.vue';
import EventAgreementDialog from './components/EventAgreementDialog.vue';
import EventCallCentreSection from './components/EventCallCentreSection.vue';
import EventAgreementSection from './components/EventAgreementSection.vue';
import EventLocationSection from './components/EventLocationSection.vue';

export enum EDialogComponent {
  CallCentre = 'EventCallCentreDialog',
  RegistrationLocation = 'EventRegistrationLocationDialog',
  ShelterLocation = 'EventShelterLocationDialog',
  Agreement = 'EventAgreementDialog',
}

interface DialogData {
  id?: string,
  isEditMode: boolean,
  component: EDialogComponent,
}

export default Vue.extend({
  name: 'EventSummary',
  components: {
    RcPageContent,
    StatusSelect,
    EventSummaryLink,
    EventSummarySectionTitle,
    EventStatusDialog,
    EventCallCentreDialog,
    EventRegistrationLocationDialog,
    EventShelterLocationDialog,
    EventCallCentreSection,
    EventAgreementSection,
    EventAgreementDialog,
    EventLocationSection,
  },

  data() {
    return {
      EEventSummarySections,
      EEventStatus,
      error: false,
      newStatus: null,
      showEventStatusDialog: false,
      loading: false,
      currentDialog: null as DialogData,
    };
  },

  computed: {
    agreementTypes(): Array<IOptionItem> {
      return this.$storage.event.getters.agreementTypes();
    },

    event(): IEvent {
      const { id } = this.$route.params;
      return this.$storage.event.getters.eventById(id) || new Event();
    },

    statuses(): EEventStatus[] {
      if (this.event.schedule.status === EEventStatus.Open) {
        return [EEventStatus.OnHold, EEventStatus.Closed];
      }

      if (this.event.schedule.status === EEventStatus.OnHold) {
        return [EEventStatus.Open, EEventStatus.Closed];
      }

      if (this.event.schedule.status === EEventStatus.Closed) {
        return [EEventStatus.Open, EEventStatus.OnHold, EEventStatus.Archived];
      }

      if (this.event.schedule.status === EEventStatus.Archived) {
        return [EEventStatus.Open, EEventStatus.OnHold];
      }

      return [];
    },

    showEditButton(): boolean {
      return this.event.schedule.status === EEventStatus.Open || this.event.schedule.status === EEventStatus.OnHold;
    },

    sortedAgreements():Array<IEventAgreement> {
      return helpers.sortMultilingualArray(this.event.agreements, 'name');
    },

    sortedCallCentres(): Array<IEventCallCentre> {
      return helpers.sortMultilingualArray(this.event.callCentres, 'name');
    },
  },

  async created() {
    try {
      const { id } = this.$route.params;
      if (id) {
        await this.$storage.event.actions.fetchEvent(id);
      }
      await this.$storage.event.actions.fetchAgreementTypes();
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
      if ((status === EEventStatus.Open && this.event.hasBeenOpen) || status === EEventStatus.Closed) {
        this.newStatus = status;
        this.showEventStatusDialog = true;
      } else {
        this.onStatusChange({ status, reason: null });
      }
    },

    onStatusChange({ status, reason }: {status: EEventStatus, reason: string}) {
      this.showEventStatusDialog = false;

      this.$storage.event.actions.setEventStatus({
        event: this.event,
        status,
        reason,
      });
    },

    onSectionAdd(section: EEventSummarySections) {
      // set the current dialog data to the component corresponding to the section to add
      this.currentDialog = {
        component: EDialogComponent[EEventSummarySections[section]],
        isEditMode: false,
      };
    },

    editSection(id: string, section: EEventSummarySections) {
      // set the current dialog data to the component corresponding to the section to edit
      // with the id corresponding to the selected element
      this.currentDialog = {
        component: EDialogComponent[EEventSummarySections[section]],
        isEditMode: true,
        id,
      };
    },
  },
});

</script>

<style scoped lang='scss'>
  .borderLeft {
     border-left: thin solid lightgrey;
  }

  .event-description {white-space: pre-line; }

  .event-section-item {
    border: 1px solid var(--v-grey-lighten2);
    border-bottom: none;

    &:first-child {
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
    }
    &:last-child {
      border-bottom-left-radius: 4px;
      border-bottom-right-radius: 4px;
      border-bottom: 1px solid var(--v-grey-lighten2)  !important;
    }
  }
</style>
