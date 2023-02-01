<template>
  <div>
    <div class="rc-heading-5 fw-bold mb-6">
      {{ $t('massActions.assessment.details.title') }}
    </div>

    <v-row v-for="(row, index) in rows" :key="index" no-gutters :class="[row.customClass, 'row-data']">
      <v-col cols="12" md="5">
        <span class="rc-body14 fw-bold">{{ $t(row.label) }}</span>
      </v-col>
      <v-col md="7">
        <span v-if="!row.loading" :class="[row.customClassValue, 'rc-body14']" :data-test="row.dataTest"> {{ row.value }} </span>
        <v-progress-circular v-else indeterminate color="primary" />
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import { IMassActionAssessmentDetails, IMassActionEntity } from '@libs/entities-lib/mass-action';
import { IEventEntity } from '@libs/entities-lib/event';
import { useEventStore } from '@/pinia/event/event';
import { useAssessmentFormStore } from '@/pinia/assessment-form/assessment-form';
import { IAssessmentFormEntity } from '@libs/entities-lib/assessment-template';

export default Vue.extend({
  name: 'AssessmentDetailsTable',

  props: {
    massAction: {
      type: Object as () => IMassActionEntity,
      required: true,
    },
  },

  data() {
    return {
      event: null as IEventEntity,
      assessment: null as IAssessmentFormEntity,
      eventLoading: false,
      assessmentLoading: false,
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
          label: 'massActions.assessment.create.assessment.label',
          value: this.assessment && this.$m(this.assessment.name),
          dataTest: 'assessment',
          loading: this.assessmentLoading,
        },
        {
          label: 'massActions.assessment.create.emailText.label',
          value: this.$m((this.massAction.details as IMassActionAssessmentDetails).emailText),
          dataTest: 'emailText',
        },
      ];
    },
  },
  async created() {
    this.fetchEvent();
    this.fetchAssessment();
  },

  methods: {
    async fetchEvent() {
      this.eventLoading = true;
      this.event = await useEventStore().fetch(this.massAction.details.eventId) as IEventEntity;
      this.eventLoading = false;
    },

    async fetchAssessment() {
      this.assessmentLoading = true;
      this.assessment = await useAssessmentFormStore().fetch({ id: (this.massAction.details as IMassActionAssessmentDetails).assessmentId });
      this.assessmentLoading = false;
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
