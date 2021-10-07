<template>
  <v-row class="no-gutters">
    <v-col cols="12">
      <v-row class="d-flex justify-space-between pr-0">
        <v-col col="12" class="pt-0 pb-1 px-2 d-flex align-center justify-space-between">
          <button
            class="rc-link16 font-weight-bold agreement-title pa-1"
            :data-test="`event-agreement-section-name-${index}`"
            @click="showInfoDialog = true">
            {{ $m(agreement.name) }}
          </button>

          <div class="d-flex justify-end align-center py-0">
            <v-btn
              v-if="$hasLevel('level5')"
              icon
              class="mr-2"
              :data-test="`edit-event-agreement-${index}`"
              @click="$emit('edit', agreement.id)">
              <v-icon size="24" color="grey darken-2">
                mdi-pencil
              </v-icon>
            </v-btn>
            <v-btn
              v-if="$hasLevel('level5')"
              icon
              :data-test="`delete-event-agreement-${index}`"
              @click="showDeleteConfirmationDialog = true">
              <v-icon size="24" color="grey darken-2">
                mdi-delete
              </v-icon>
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <v-row class="no-gutters mt-1">
        <v-col cols="12" xl="2" lg="2" md="3" sm="12" class="d-flex py-0 rc-body12 flex-column">
          <span class="pr-2">{{ $t(infoData.startDate.key) }}:</span>
          <span :data-test="`event-agreement-section-start-date-${index}`">{{ infoData.startDate.value }}</span>
        </v-col>

        <v-col cols="12" xl="2" lg="2" md="3" sm="12" class="d-flex py-0 rc-body12 flex-column border-right">
          <span class="pr-2">{{ $t(infoData.endDate.key) }}:</span>
          <span :data-test="`event-agreement-section-end-date-${index}`">{{ infoData.endDate.value }}</span>
        </v-col>
        <v-col cols="12" xl="2" lg="2" md="3" sm="12" class="d-flex py-0 pl-lg-8 pl-md-3 rc-body12 flex-column border-right">
          <span class="pr-2">{{ $t(infoData.type.key) }}:</span>
          <span :data-test="`event-agreement-section-type-${index}`">{{ infoData.type.value }}</span>
        </v-col>

        <v-col cols="12" xl="6" lg="6" md="3" sm="12" class="py-0 pr-16 pl-lg-8 pl-md-3 rc-body12">
          <div>
            {{ $t(infoData.details.key) }}:
          </div>
          <div class="agreement-details-text" :data-test="`event-agreement-section-details-${index}`">
            {{ infoData.details.value }}
          </div>
        </v-col>
      </v-row>
    </v-col>

    <event-summary-section-info-dialog
      v-if="showInfoDialog"
      :show="showInfoDialog"
      :title="$t('eventSummary.agreement.infoDialog.title')"
      :name="$m(agreement.name)"
      :table-data="infoData"
      data-test="agreement-info-dialog"
      @close="showInfoDialog = false"
      @edit="editFromInfoDialog()" />

    <rc-confirmation-dialog
      v-if="showDeleteConfirmationDialog"
      data-test="agreement-section-delete-confirmation-dialog"
      :show.sync="showDeleteConfirmationDialog"
      :title="$t('eventSummary.agreement.confirmDelete.title')"
      :messages="$t('eventSummary.agreement.confirmDelete.message')"
      @submit="deleteAgreement()"
      @cancel="showDeleteConfirmationDialog = false"
      @close="showDeleteConfirmationDialog = false" />
  </v-row>
</template>

<script lang='ts'>
import Vue from 'vue';
import { RcConfirmationDialog } from '@crctech/component-library';
import helpers from '@/ui/helpers';
import { IEventAgreement } from '@/entities/event';
import { IOptionItemData } from '@/entities/optionItem';
import EventSummarySectionInfoDialog from './EventSummarySectionInfoDialog.vue';

export default Vue.extend({
  name: 'EventAgreementSection',

  components: {
    EventSummarySectionInfoDialog,
    RcConfirmationDialog,
  },

  props: {
    agreement: {
      type: Object as () => IEventAgreement,
      required: true,
    },
    agreementTypes: {
      type: Array as () => IOptionItemData[],
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
  },
  data() {
    return {
      showInfoDialog: false,
      showDeleteConfirmationDialog: false,
      getLocalStringDate: helpers.getLocalStringDate,
    };
  },

  computed: {
    agreementTypeName(): string {
      const type = this.agreementTypes.find((type) => type.id === this.agreement.agreementType.optionItemId);
      if (!type) return '';
      const { isOther } = type;
      if (isOther) {
        return this.agreement.agreementType.specifiedOther;
      }
      return this.$m(type.name);
    },

    infoData(): Record<string, unknown> {
      return {
        startDate: {
          key: 'eventSummary.agreement.startDate',
          value: this.agreement.startDate ? this.getLocalStringDate(this.agreement.startDate, 'EventAgreement.startDate', 'll') : '-',
        },
        endDate: {
          key: 'eventSummary.agreement.endDate',
          value: this.agreement.endDate ? this.getLocalStringDate(this.agreement.endDate, 'EventAgreement.endDate', 'll') : '-',
        },
        type: {
          key: 'eventSummary.agreement.type',
          value: this.agreementTypeName,
        },
        details: {
          key: 'eventSummary.agreement.details',
          value: this.$m(this.agreement.details),
        },
      };
    },
  },

  methods: {
    editFromInfoDialog() {
      this.showInfoDialog = false;
      this.$emit('edit', this.agreement.id);
    },

    deleteAgreement() {
      this.$storage.event.actions.deleteAgreement({ eventId: this.eventId, agreementId: this.agreement.id });
      this.showDeleteConfirmationDialog = false;
    },
  },

});

</script>

<style scoped lang="scss">
.agreement-title{
  border: 0;
  box-shadow: none;
  background-color: transparent;
  text-transform: none;
  text-align: left;
}

.agreement-details-text {
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
  .agreement-details-text {
    max-width: 30vw;
  }

}

</style>
