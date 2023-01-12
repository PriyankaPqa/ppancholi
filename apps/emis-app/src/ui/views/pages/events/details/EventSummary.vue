<template>
  <rc-page-content :outer-scroll="true" :title="$t('eventSummary.title')" :show-help="false" :help-link="$t('zendesk.help_link.eventDetails')">
    <template slot="top">
      <v-row class=" ma-0 pa-0 pb-4">
        <v-col class="d-flex ma-0 pa-0 align-center" cols="10">
          <span class="pr-4">
            <status-select
              data-test="event-detail-status"
              :value="event.schedule.status"
              :statuses="statuses"
              status-name="EEventStatus"
              :disabled="!$hasLevel('level5')"
              @input="onStatusChangeInit($event)" />
          </span>

          <span class="rc-body14 borderLeft pa-0 pr-1 pl-4"> {{ $t('eventSummary.response') }}: </span>
          <span class="rc-body14" data-test="event-summary-response-level">
            {{ responseLevelName }}
          </span>
        </v-col>

        <v-col v-if="canEdit" cols="2" class="text-right ma-0 pa-0">
          <v-btn icon data-test="event-edit-button" @click="editEvent()">
            <v-icon>
              mdi-pencil
            </v-icon>
          </v-btn>
        </v-col>
      </v-row>
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

      <div v-if="$hasFeature(FeatureKeys.CouplingAssessmentsWithRegistration)">
        <event-summary-section-title
          :section="EEventSummarySections.RegistrationAssessment"
          :can-add="canEditAssessmentSection && activeAssessments.length == 0"
          @click-add-button="onSectionAdd($event)" />
        <event-summary-section-body v-slot="{ item, index }" :items="activeAssessments">
          <event-registration-assessment-section
            :key="item.assessmentId"
            data-test="registration-assessment-section"
            :registration-assessment="item"
            :event-id="event.id"
            :index="index"
            :can-edit="canEditAssessmentSection"
            @edit="editSection($event, EEventSummarySections.RegistrationAssessment)" />
        </event-summary-section-body>
      </div>

      <event-summary-section-title
        :section="EEventSummarySections.CallCentre"
        :can-add="canEditSections"
        @click-add-button="onSectionAdd($event)" />
      <event-summary-section-body v-slot="{ item, index }" :items="sortedCallCentres">
        <event-call-centre-section
          data-test="call-centre-section"
          :call-centre="item"
          :index="index"
          :can-edit="canEditSections"
          @edit="editSection($event, EEventSummarySections.CallCentre)" />
      </event-summary-section-body>

      <event-summary-section-title
        :section="EEventSummarySections.RegistrationLocation"
        :can-add="canEditSections"
        @click-add-button="onSectionAdd($event)" />

      <event-summary-section-body v-slot="{ item, index }" :items="sortedRegistrationLocations">
        <event-location-section
          data-test="registration-location-section"
          data-test-prefix="registration"
          :location="item"
          :index="index"
          :can-edit="canEditSections"
          @edit="editSection($event, EEventSummarySections.RegistrationLocation)" />
      </event-summary-section-body>

      <event-summary-section-title
        :section="EEventSummarySections.ShelterLocation"
        :can-add="canEditSections"
        @click-add-button="onSectionAdd($event)" />
      <event-summary-section-body v-slot="{ item, index }" :items="sortedShelterLocations">
        <event-location-section
          data-test="shelter-location-section"
          data-test-prefix="shelter"
          :location="item"
          :index="index"
          :can-edit="canEditSections"
          @edit="editSection($event, EEventSummarySections.ShelterLocation)" />
      </event-summary-section-body>

      <event-summary-section-title
        :section="EEventSummarySections.Agreement"
        :can-add="canEditSections"
        @click-add-button="onSectionAdd($event)" />
      <event-summary-section-body v-slot="{ item, index }" :items="sortedAgreements">
        <event-agreement-section
          data-test="agreement-section"
          :agreement="item"
          :agreement-types="agreementTypes"
          :index="index"
          :event-id="event.id"
          :can-edit="canEditSections"
          @edit="editSection($event, EEventSummarySections.Agreement)" />
      </event-summary-section-body>

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
      :event="event"
      :is-edit-mode="currentDialog.isEditMode"
      :agreement-types="agreementTypes"
      @close="currentDialog = null" />
  </rc-page-content>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcPageContent } from '@libs/component-lib/components';
import { TranslateResult } from 'vue-i18n';
import StatusSelect from '@/ui/shared-components/StatusSelect.vue';
import routes from '@/constants/routes';
import helpers from '@/ui/helpers/helpers';
import {
  EEventStatus,
  IEventCallCentre,
  IEventAgreement,
  IEventGenericLocation,
  EResponseLevel,
  EventEntity,
  IRegistrationAssessment,
} from '@libs/entities-lib/event';
import { EEventSummarySections } from '@/types';
import { IOptionItem } from '@libs/entities-lib/optionItem';
import { useEventStore } from '@/pinia/event/event';
import { Status } from '@libs/entities-lib/base';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import EventSummaryLink from './components/EventSummaryLink.vue';
import EventSummarySectionTitle from './components/EventSummarySectionTitle.vue';
import EventSummarySectionBody from './components/EventSummarySectionBody.vue';
import EventStatusDialog from './components/EventStatusDialog.vue';
import EventCallCentreDialog from './components/EventCallCentreDialog.vue';
import EventRegistrationLocationDialog from './components/EventRegistrationLocationDialog.vue';
import EventShelterLocationDialog from './components/EventShelterLocationDialog.vue';
import EventAgreementDialog from './components/EventAgreementDialog.vue';
import EventCallCentreSection from './components/EventCallCentreSection.vue';
import EventAgreementSection from './components/EventAgreementSection.vue';
import EventLocationSection from './components/EventLocationSection.vue';
import EventRegistrationAssessmentSection from './components/EventRegistrationAssessmentSection.vue';
import EventRegistrationAssessmentDialog from './components/EventRegistrationAssessmentDialog.vue';

export enum EDialogComponent {
  CallCentre = 'EventCallCentreDialog',
  RegistrationLocation = 'EventRegistrationLocationDialog',
  ShelterLocation = 'EventShelterLocationDialog',
  Agreement = 'EventAgreementDialog',
  RegistrationAssessment = 'EventRegistrationAssessmentDialog',
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
    EventSummarySectionBody,
    EventStatusDialog,
    EventCallCentreDialog,
    EventRegistrationLocationDialog,
    EventShelterLocationDialog,
    EventCallCentreSection,
    EventAgreementSection,
    EventAgreementDialog,
    EventLocationSection,
    EventRegistrationAssessmentSection,
    EventRegistrationAssessmentDialog,
  },

  data() {
    return {
      EEventSummarySections,
      EEventStatus,
      newStatus: null,
      showEventStatusDialog: false,
      loading: false,
      currentDialog: null as DialogData,
      FeatureKeys,
    };
  },

  computed: {
    agreementTypes(): Array<IOptionItem> {
      const currentAgreementTypeIds = this.event.agreements?.map((a) => a.agreementType.optionItemId);
      if (currentAgreementTypeIds) {
        return useEventStore().getAgreementTypes(true, currentAgreementTypeIds);
      }
      return [];
    },

    event(): EventEntity {
      const { id } = this.$route.params;
      const storeEvent = useEventStore().getById(id);
      return new EventEntity(storeEvent);
    },

    responseLevelName():TranslateResult {
      return this.$t(`event.response_level.${EResponseLevel[this.event.responseDetails.responseLevel]}`);
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

    sortedAgreements():Array<IEventAgreement> {
      return helpers.sortMultilingualArray(this.event.agreements, 'name');
    },

    sortedCallCentres(): Array<IEventCallCentre> {
      return helpers.sortMultilingualArray(this.event.callCentres, 'name');
    },

    sortedRegistrationLocations(): Array<IEventGenericLocation> {
      return helpers.sortMultilingualArray(this.event.registrationLocations, 'name');
    },

    sortedShelterLocations(): Array<IEventGenericLocation> {
      return helpers.sortMultilingualArray(this.event.shelterLocations, 'name');
    },

    activeAssessments(): Array<IRegistrationAssessment> {
      return (this.event.registrationAssessments || []).filter((r: IRegistrationAssessment) => r.status === Status.Active);
    },

    canEditSections(): boolean {
      return (this.$hasLevel('level6') && this.event.schedule.status === EEventStatus.OnHold)
      || (this.$hasLevel('level5') && this.event.schedule.status === EEventStatus.Open);
    },

    canEditAssessmentSection(): boolean {
      return (this.$hasLevel('level6') && (this.event.schedule.status === EEventStatus.OnHold
      || this.event.schedule.status === EEventStatus.Open));
    },

    canEdit(): boolean {
      return this.$hasLevel('level5')
      && (this.event.schedule.status === EEventStatus.Open || this.event.schedule.status === EEventStatus.OnHold);
    },
  },

  async created() {
    try {
      // No need to fetch event again, because event is already fetched in EventDetails.vue
      await useEventStore().fetchAgreementTypes();
    } catch (e) {
      this.$appInsights.trackException(e, {}, 'EventSummary', 'created');
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

    onStatusChange({ status, reason }: { status: EEventStatus, reason: string }) {
      this.showEventStatusDialog = false;

      useEventStore().setEventStatus({
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

  ::v-deep .theme--light.v-btn:hover::before{
    opacity: 0.2;
  }
</style>
