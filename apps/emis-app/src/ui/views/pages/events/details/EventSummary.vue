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
              :disabled="!$hasLevel(UserRoles.level5)"
              @input="onStatusChangeInit($event)" />
          </span>

          <span class="rc-body14 borderLeft pa-0 pr-1 pl-4"> {{ $t('eventSummary.response') }}: </span>
          <span class="rc-body14" data-test="event-summary-response-level">
            {{ responseLevelName }}
          </span>
        </v-col>

        <v-col v-if="canEdit" cols="2" class="text-right ma-0 pa-0">
          <v-btn icon data-test="event-edit-button" :aria-label="$t('common.edit')" @click="editEvent()">
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

      <div>
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
      <event-summary-section-body :items="sortedCallCentres" :section-name="EEventSummarySections.CallCentre">
        <template #default="{ item, index }">
          <event-call-centre-section
            data-test="call-centre-section"
            :call-centre="item"
            :index="index"
            :can-edit="canEditSections"
            @edit="editSection($event, EEventSummarySections.CallCentre)" />
        </template>

        <template v-if="showToggleForL0Access" #toggleArea>
          <event-summary-toggle
            :toggle-value="event.registrationsForL0usersEnabled"
            :loading="updatingRegistrationToggle"
            :title-of-toggle="$t('eventSummary.registrationEnabled')"
            data-test="event-summary-toggle-registration"
            @toggleChanged="toggleRegistration($event)" />

          <event-summary-toggle
            :toggle-value="event.assessmentsForL0usersEnabled"
            :loading="updatingAccessAssessmentToggle"
            :title-of-toggle="$t('eventSummary.accessAssessmentEnabled')"
            is-last-child
            data-test="event-summary-toggle-assessment"
            @toggleChanged="toggleAccessAssessment($event)" />

          <event-summary-toggle
            v-if="$hasFeature(FeatureKeys.AppointmentBooking)"
            :toggle-value="event.appointmentBookingForL0usersEnabled"
            :loading="updatingAppointmentBookingToggle"
            :title-of-toggle="$t('eventSummary.enableAppointmentBooking')"
            is-last-child
            data-test="event-summary-toggle-appointment-booking"
            @toggleChanged="toggleAppointmentBooking($event)" />
        </template>
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

      <event-summary-section-title
        :section="EEventSummarySections.ExceptionalAuthenticationType"
        :can-add="$hasLevel(UserRoles.level6)"
        @click-add-button="onSectionAdd($event)" />
      <event-summary-section-body v-slot="{ item, index }" :items="sortedExceptionalAuth">
        <event-exceptional-authentication-section
          data-test="exceptional-authentication-section"
          :excpt-auth="item"
          :index="index"
          :event-id="event.id" />
      </event-summary-section-body>

      <div v-if="$hasLevel(UserRoles.level6)">
        <event-summary-section-title
          :section="EEventSummarySections.EventConsent"
          :can-add="canEditConsentSection"
          @click-add-button="onSectionAdd($event)" />
        <event-summary-section-body v-slot="{ item }" :items="[consentStatement]">
          <div class="fw-bold">
            {{ item }}
          </div>
        </event-summary-section-body>
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
import { EEventStatus, EResponseLevel, EventEntity, IEventAgreement,
  IEventCallCentre, IEventGenericLocation,
  IRegistrationAssessment } from '@libs/entities-lib/event';
import { EEventSummarySections } from '@/types';
import { IOptionItem } from '@libs/entities-lib/optionItem';
import { useEventStore } from '@/pinia/event/event';
import { Status } from '@libs/entities-lib/base';
import { UserRoles } from '@libs/entities-lib/user';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import { useTenantSettingsStore } from '@/pinia/tenant-settings/tenant-settings';
import { ICaseFileCountByExceptionalAuthentication } from '@libs/services-lib/case-files/entity';
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
import EventExceptionalAuthenticationSection from './components/EventExceptionalAuthenticationSection.vue';
import EventExceptionalAuthenticationDialog from './components/EventExceptionalAuthenticationDialog.vue';
import EventLocationSection from './components/EventLocationSection.vue';
import EventRegistrationAssessmentSection from './components/EventRegistrationAssessmentSection.vue';
import EventRegistrationAssessmentDialog from './components/EventRegistrationAssessmentDialog.vue';
import EventConsentSelectionDialog from './components/EventConsentSelectionDialog.vue';
import EventSummaryToggle from './components/EventSummaryToggle.vue';
import { DialogData, EDialogComponent } from './components/DialogComponents';

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
    EventExceptionalAuthenticationSection,
    EventExceptionalAuthenticationDialog,
    EventLocationSection,
    EventRegistrationAssessmentSection,
    EventRegistrationAssessmentDialog,
    EventConsentSelectionDialog,
    EventSummaryToggle,
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
      updatingAccessAssessmentToggle: false,
      updatingRegistrationToggle: false,
      updatingAppointmentBookingToggle: false,
      UserRoles,
      exceptionalTypeCounts: null as ICaseFileCountByExceptionalAuthentication[],
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

    sortedAgreements(): Array<IEventAgreement> {
      return helpers.sortMultilingualArray(this.event.agreements, 'name');
    },

    sortedExceptionalAuth(): Array<{ item: IOptionItem, max?: number, count?: number }> {
      const types = useEventStore().getExceptionalAuthenticationTypes(true, this.event.exceptionalAuthenticationTypes.map((x) => x.exceptionalAuthenticationTypeId), this.event);

      return types.map((t) => ({
        item: t,
        max: this.event.exceptionalAuthenticationTypes.find((e) => e.exceptionalAuthenticationTypeId === t.id)?.maxNumberOfUsages,
        count: this.exceptionalTypeCounts ? ((this.exceptionalTypeCounts.find((e) => e.exceptionalAuthenticationTypeId === t.id)?.caseFileCount || 0)
          + (this.exceptionalTypeCounts.find((e) => !e.exceptionalAuthenticationTypeId && t.isDefault)?.caseFileCount || 0)) : null,
      }));
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
      return (this.$hasLevel(UserRoles.level6) && this.event.schedule.status === EEventStatus.OnHold)
      || (this.$hasLevel(UserRoles.level5) && this.event.schedule.status === EEventStatus.Open);
    },

    canEditAssessmentSection(): boolean {
      return (this.$hasLevel(UserRoles.level6) && (this.event.schedule.status === EEventStatus.OnHold
      || this.event.schedule.status === EEventStatus.Open));
    },

    canEditConsentSection(): boolean {
      return (this.$hasLevel(UserRoles.level6) && (this.event.schedule.status === EEventStatus.OnHold
      || this.event.schedule.status === EEventStatus.Open));
    },

    canEdit(): boolean {
      return this.$hasLevel(UserRoles.level5)
      && (this.event.schedule.status === EEventStatus.Open || this.event.schedule.status === EEventStatus.OnHold);
    },

    showToggleForL0Access(): boolean {
      return this.event.callCentres.length && this.$hasLevel(UserRoles.level6);
    },

    consentStatement(): TranslateResult {
      const statement = (useTenantSettingsStore().currentTenantSettings.consentStatements || []).find((x) => x.id === this.event?.consentStatementId);
      return statement?.name ? this.$m(statement.name) : this.$t('eventSummary.defaultConsentName');
    },
  },

  async created() {
    try {
      // No need to fetch event again, because event is already fetched in EventDetails.vue
      await useEventStore().fetchAgreementTypes();
      await useEventStore().fetchExceptionalAuthenticationTypes();
      this.$services.caseFiles.getExceptionalTypeCounts(this.event.id).then((counts) => {
        this.exceptionalTypeCounts = counts;
      });
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

    async toggleAccessAssessment(toggleChangedResult: boolean) {
      this.updatingAccessAssessmentToggle = true;

      const response = await useEventStore().toggleAssessmentsForL0Users({
        id: this.event.id,
        assessmentsForL0UsersEnabled: toggleChangedResult,
      });

      if (response) {
        if (toggleChangedResult) {
          this.$toasted.global.success(this.$t('eventSummary.accessAssessmentEnabled'));
        } else {
          this.$toasted.global.success(this.$t('eventSummary.accessAssessmentDisabled'));
        }
      }

      this.updatingAccessAssessmentToggle = false;
    },

    async toggleRegistration(toggleChangedResult: boolean) {
      this.updatingRegistrationToggle = true;

      const response = await useEventStore().toggleRegistrationForL0Users({
        id: this.event.id,
        registrationsForL0UsersEnabled: toggleChangedResult,
      });

      if (response) {
        if (toggleChangedResult) {
          this.$toasted.global.success(this.$t('eventSummary.registrationEnabled'));
        } else {
          this.$toasted.global.success(this.$t('eventSummary.registrationDisabled'));
        }
      }

      this.updatingRegistrationToggle = false;
    },

    async toggleAppointmentBooking(toggleChangedResult: boolean) {
      this.updatingAppointmentBookingToggle = true;

      const response = await useEventStore().toggleAppointmentBookingForL0Users({
        id: this.event.id,
        appointmentBookingForL0usersEnabled: toggleChangedResult,
      });

      if (response) {
        if (toggleChangedResult) {
          this.$toasted.global.success(this.$t('eventSummary.appointmentBookingEnabled'));
        } else {
          this.$toasted.global.success(this.$t('eventSummary.appointmentBookingDisabled'));
        }
      }

      this.updatingAppointmentBookingToggle = false;
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
