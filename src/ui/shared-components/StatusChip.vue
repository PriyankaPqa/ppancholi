<template>
  <rc-status-chip :color="color" :text-color="textColor">
    <slot name="default">
      {{ text ? text : $t(textFromEnum) }}
      <v-icon v-if="showChevron" right>
        mdi-chevron-down
      </v-icon>
    </slot>
  </rc-status-chip>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcStatusChip } from '@crctech/component-library';
import { EEventCallCentreStatus, EEventStatus } from '@/entities/event';
import { ETeamStatus } from '@/entities/team';
import { EOptionListItemStatus } from '@/entities/optionItem';
import colors from '@/ui/plugins/vuetify/colors';

export default Vue.extend({
  name: 'StatusChip',

  components: {
    RcStatusChip,
  },

  props: {
    statusName: {
      type: String,
      required: true,
      validator: (value: string) => (
        [
          'EEventStatus',
          'EOptionListItemStatus',
          'EEventCallCentreStatus',
          'EEventLocationStatus',
          'ETeamStatus',
        ].indexOf(value) > -1
      ),
    },

    status: {
      type: Number,
      required: true,
    },

    text: {
      type: String,
      default: '',
    },

    showChevron: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    color(): string {
      switch (this.statusName) {
        case 'EEventStatus':
          return this.getEventStatusColor();
        case 'EEventCallCentreStatus':
        case 'EEventLocationStatus':
          return this.getEventCallCentreColor();
        case 'EOptionListItemStatus':
          return this.getOptionListStatusColor();
        case 'ETeamStatus':
          return this.getTeamStatusColor();
        default:
          return colors.chips.green;
      }
    },

    textColor(): string {
      switch (this.color) {
        case colors.chips.orange:
        case colors.chips.light_grey:
        case colors.chips.green_pale:
        case colors.chips.blue_pale:
        case colors.chips.red_pale:
          return colors.grey.darken4;
        default:
          return colors.white;
      }
    },
    // Once all status are translated in the BE we won't need anymore textFromEnum
    textFromEnum(): string {
      switch (this.statusName) {
        case 'EEventStatus':
          return `eventsTable.eventStatus.${EEventStatus[this.status]}`;
        case 'EEventCallCentreStatus':
        case 'EEventLocationStatus':
          return `eventSummary.status.${EEventCallCentreStatus[this.status]}`;
        case 'EOptionListItemStatus':
          return `system_management.lists.status.${EOptionListItemStatus[this.status]}`;
        case 'ETeamStatus':
          return `team.status.${ETeamStatus[this.status]}`;
        default:
          return '';
      }
    },
  },

  methods: {
    getEventStatusColor(): string {
      switch (this.status) {
        case EEventStatus.Open:
          return colors.chips.green;

        case EEventStatus.OnHold:
          return colors.chips.green_pale;

        case EEventStatus.Archived:
          return colors.chips.light_grey;

        case EEventStatus.Closed:
          return colors.chips.red;

        default:
          return colors.chips.green;
      }
    },

    getEventCallCentreColor(): string {
      switch (this.status) {
        case EEventCallCentreStatus.Active:
          return colors.chips.green;

        case EEventCallCentreStatus.Inactive:
          return colors.chips.light_grey;

        default:
          return colors.chips.green;
      }
    },

    getOptionListStatusColor(): string {
      switch (this.status) {
        case EOptionListItemStatus.Active:
          return colors.chips.green;

        case EOptionListItemStatus.Inactive:
          return colors.chips.grey;

        default:
          return colors.chips.green;
      }
    },

    getTeamStatusColor(): string {
      switch (this.status) {
        case ETeamStatus.Active:
          return colors.chips.green;

        case ETeamStatus.Inactive:
          return colors.chips.light_grey;

        default:
          return colors.chips.green;
      }
    },
  },
});
</script>
