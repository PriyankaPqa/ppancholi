<template>
  <v-row class="no-gutters">
    <v-col cols="12">
      <v-row class="d-flex justify-space-between">
        <v-col col="12" class="pt-0 pb-1 px-2 d-flex align-center justify-space-between">
          <button
            class="rc-link16 font-weight-bold call-centre-title pa-1"
            :data-test="`event-call-centre-section-name-${index}`"
            @click="showInfoDialog = true">
            {{ $m(callCentre.name) }}
          </button>

          <div class="d-flex justify-end align-center py-0">
            <status-chip
              class="mr-2"
              status-name="EEventCallCentreStatus"
              :data-test="`event-call-centre-section-status-${index}`"
              :status="callCentre.status" />
            <v-btn
              v-if="$hasLevel('level5')"
              icon
              :data-test="`edit-event-call-centre-${index}`"
              @click="$emit('edit', callCentre.name.translation.en)">
              <v-icon size="24" color="grey darken-2">
                mdi-pencil
              </v-icon>
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <v-row class="no-gutters mt-1">
        <v-col cols="12" xl="1" lg="2" md="3" sm="12" class="d-flex py-0 rc-body12 flex-column">
          <span class="pr-2">{{ $t(infoData.startDate.key) }}:</span>
          <span :data-test="`event-call-centre-section-start-date-${index}`">{{ infoData.startDate.value }}</span>
        </v-col>
        <v-col cols="12" xl="2" lg="2" md="3" sm="12" class="d-flex py-0 rc-body12 flex-column border-right">
          <span class="pr-2">{{ $t(infoData.endDate.key) }}:</span>
          <span :data-test="`event-call-centre-section-end-date-${index}`">{{ infoData.endDate.value }}</span>
        </v-col>

        <v-col cols="12" xl="8" lg="8" md="6" sm="12" class="py-0 pr-16 pl-lg-8 pl-md-3 rc-body12">
          <div>
            {{ $t(infoData.details.key) }}:
          </div>
          <div class="call-centre-details-text" :data-test="`event-call-centre-section-details-${index}`">
            {{ infoData.details.value }}
          </div>
        </v-col>
      </v-row>
    </v-col>

    <event-summary-section-info-dialog
      v-if="showInfoDialog"
      :show="showInfoDialog"
      :title="$t('eventSummary.callCentre.infoDialog.title')"
      :name="$m(callCentre.name)"
      :status="callCentre.status"
      :table-data="infoData"
      data-test="call-centre-info-dialog"
      @close="showInfoDialog = false"
      @edit="editFromInfoDialog()" />
  </v-row>
</template>

<script lang='ts'>
import Vue from 'vue';
import helpers from '@/ui/helpers';
import { IEventCallCentre, EEventCallCentreStatus } from '@/entities/event';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import EventSummarySectionInfoDialog from './EventSummarySectionInfoDialog.vue';

export default Vue.extend({
  name: 'EventCallCentreSection',

  components: {
    StatusChip,
    EventSummarySectionInfoDialog,
  },

  props: {
    callCentre: {
      type: Object as () => IEventCallCentre,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      showInfoDialog: false,
      EEventCallCentreStatus,
      getStringDate: helpers.getStringDate,
    };
  },

  computed: {
    infoData(): Record<string, unknown> {
      return {
        startDate: {
          key: 'eventSummary.callCentre.startDate',
          value: this.callCentre.startDate ? this.getStringDate(this.callCentre.startDate, 'll') : '-',
        },
        endDate: {
          key: 'eventSummary.callCentre.endDate',
          value: this.callCentre.endDate ? this.getStringDate(this.callCentre.endDate, 'll') : '-',
        },
        details: {
          key: 'eventSummary.callCentre.details',
          value: this.$m(this.callCentre.details),
        },
      };
    },
  },

  methods: {
    editFromInfoDialog() {
      this.showInfoDialog = false;
      this.$emit('edit', this.callCentre.name.translation.en);
    },
  },

});

</script>

<style scoped lang="scss">
.call-centre-title{
  border: 0;
  box-shadow: none;
  background-color: transparent;
  text-transform: none;
  text-align: left;
}

.call-centre-details-text {
  overflow: hidden;
  max-height: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 70vw;
}

@media (min-width: $breakpoint-md-min)  {
   .border-right {
      border-right: 1px solid var(--v-grey-lighten2);
    }
}

@media (min-width: $breakpoint-sm-min)  {
  .call-centre-details-text {
    max-width: 40vw;
  }

}

</style>
