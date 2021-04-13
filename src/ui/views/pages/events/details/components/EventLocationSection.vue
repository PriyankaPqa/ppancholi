<template>
  <v-row class="no-gutters">
    <v-col cols="12">
      <v-row align="center">
        <v-col class="fw-bold py-2 pl-3" :data-test="getDataTest('name', index)">
          {{ $m(location.name) }}
        </v-col>
        <v-col class="text-end py-0 pr-2">
          <status-chip
            class="mr-2"
            status-name="EEventLocationStatus"
            :status="location.status"
            :data-test="getDataTest('status', index)" />
          <v-btn
            v-if="$hasLevel('level5')"
            icon
            :data-test="getDataTest('edit', index)"
            @click="$emit('edit', location.name.translation.en)">
            <v-icon size="24" color="grey darken-2">
              mdi-pencil
            </v-icon>
          </v-btn>
        </v-col>
      </v-row>

      <div class="rc-body12 mt-1">
        {{ $t('eventSummary.registrationLocation.address') }}
      </div>

      <div class="rc-body12" :data-test="getDataTest('address', index)">
        {{ getAddress(location) }}
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import { IEventGenericLocation } from '@/entities/event';
import { ECanadaProvinces } from '@/types';

export default Vue.extend({
  name: 'EventLocationSection',

  components: {
    StatusChip,
  },

  props: {
    location: {
      type: Object as () => IEventGenericLocation,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },

    dataTestPrefix: {
      type: String,
      required: true,
    },
  },

  methods: {
    getAddress(location: IEventGenericLocation): string {
      const { address } = location;

      let result = `${address.streetAddress} ${address.city}, `;

      const province = ECanadaProvinces[address.province];
      const isOtherProvince = province === ECanadaProvinces[ECanadaProvinces.OT];
      result += isOtherProvince ? '' : `${province}, `;

      result += address.postalCode ? `${address.postalCode}, ` : '';
      result += address.country;

      return result;
    },

    getDataTest(field: string, index: number): string {
      return `event-${this.dataTestPrefix}-location-section-${field}-${index}`;
    },
  },
});
</script>

<style scoped lang="scss">
table {
  border-collapse: separate;
  border: solid var(--v-grey-lighten2) 1px;
}

td {
  border-top: solid var(--v-grey-lighten2) 1px;
}

tr:first-child td {
  border-top: none;
}
</style>
