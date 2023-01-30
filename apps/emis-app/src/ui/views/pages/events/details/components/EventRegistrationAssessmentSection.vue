<template>
  <v-row class="no-gutters">
    <v-col cols="12">
      <v-row class="d-flex justify-space-between pr-0">
        <v-col col="12" class="pt-0 pb-1 px-2 d-flex align-center justify-space-between">
          <div
            class="fw-bold registration-assessment-title pa-1"
            :data-test="`event-registrationAssessment-section-name-${index}`">
            {{ $m(assessment.name) }}
          </div>

          <div class="d-flex justify-end align-center py-0">
            <status-chip
              class="mr-4"
              status-name="Status"
              :data-test="`event-assessment-section-status-${index}`"
              :status="assessment.status" />
            <div class="fw-bold mr-4">
              {{ $t(`enums.assessmentPublishStatus.${PublishStatus[assessment.publishStatus]}`) }}
            </div>
            <v-btn
              v-if="canEdit"
              icon
              class="mr-2"
              :data-test="`edit-event-registrationAssessment-${index}`"
              @click="$emit('edit', registrationAssessment.id)">
              <v-icon size="24" color="grey darken-2">
                mdi-pencil
              </v-icon>
            </v-btn>
            <v-btn
              v-if="canEdit"
              icon
              :data-test="`delete-event-registrationAssessment-${index}`"
              @click="deleteRegistrationAssessment">
              <v-icon size="24" color="grey darken-2">
                mdi-delete
              </v-icon>
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <v-row class="no-gutters mt-1">
        <v-col cols="12" class="d-flex py-0 rc-body12 flex-column">
          <span class="pr-2">{{ $t('eventSummary.registrationAssessment.description') }}:</span>
          <span :data-test="`event-registrationAssessment-section-description-${index}`">
            {{ registrationAssessment.details ? $m(registrationAssessment.details) : '-' }}
          </span>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script lang='ts'>
import Vue from 'vue';
import { IRegistrationAssessment } from '@libs/entities-lib/event';
import { IAssessmentFormEntity, PublishStatus } from '@libs/entities-lib/assessment-template';
import { Status } from '@libs/entities-lib/base';
import { useEventStore } from '@/pinia/event/event';
import { useAssessmentFormStore } from '@/pinia/assessment-form/assessment-form';
import StatusChip from '@/ui/shared-components/StatusChip.vue';

export default Vue.extend({
  name: 'EventRegistrationAssessmentSection',

  components: {
    StatusChip,
  },

  props: {
    registrationAssessment: {
      type: Object as () => IRegistrationAssessment,
      required: true,
    },
    eventId: {
      type: String,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    /**
     * Whether the user can edit event sections
     */
    canEdit: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      PublishStatus,
      Status,
    };
  },

  computed: {
    assessment(): IAssessmentFormEntity {
      return useAssessmentFormStore().getById(this.registrationAssessment.assessmentId);
    },
  },

  async created() {
    await useAssessmentFormStore().fetch({ id: this.registrationAssessment.assessmentId });
  },

  methods: {
    async deleteRegistrationAssessment() {
      if (await this.$confirm({
        title: this.$t('eventSummary.registrationAssessment.confirmDelete.title'),
        messages: this.$t('eventSummary.registrationAssessment.confirmDelete.message'),
      })) {
        await useEventStore().deleteRegistrationAssessment({ eventId: this.eventId, registrationAssessmentId: this.registrationAssessment.id });
      }
    },
  },

});

</script>

<style scoped lang="scss">
.registration-assessment-title{
  border: 0;
  box-shadow: none;
  background-color: transparent;
  text-transform: none;
  text-align: left;
}

.registration-assessment-details-text {
  overflow: hidden;
  max-height: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 50vw;
}

@media (min-width: $breakpoint-md-min)  {
  .flex-column{
    flex-direction:column ;
  }

   .border-right {
      border-right: 1px solid var(--v-grey-lighten2);
    }
}

@media (min-width: $breakpoint-sm-min)  {
  .registration-assessment-details-text {
    max-width: 30vw;
  }

}

</style>
