<template>
  <div v-if="sortedLocations.length > 0" class="mx-2">
    <table class="full-width border-radius-all">
      <tbody>
        <tr v-for="(location, index) in sortedLocations" :key="location.name.en">
          <td>
            <v-row class="pt-1 pl-4" align="center">
              <v-col class="fw-bold pb-2" :data-test="getDataTest('name', index)">
                {{ $m(location.name) }}
              </v-col>
              <v-col class="text-end pb-2">
                <status-chip status-name="EEventLocationStatus" :status="location.status" :data-test="getDataTest('status', index)" />
                <v-btn icon class="mx-2" :data-test="getDataTest('edit', index)" @click="$emit('edit', location.name.translation.en)">
                  <v-icon size="24" color="grey darken-2">
                    mdi-pencil
                  </v-icon>
                </v-btn>
              </v-col>
            </v-row>

            <div class="pl-4 rc-body12">
              {{ $t('eventSummary.registrationLocation.address') }}:
            </div>

            <div class="pb-3 pl-4 rc-body12" :data-test="getDataTest('address', index)">
              {{ getAddress(location) }}
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import { IEventGenericLocation } from '@/entities/event';
import helpers from '@/ui/helpers';
import { ECanadaProvinces } from '@/types';

export default Vue.extend({
  name: 'EventLocationSection',

  components: {
    StatusChip,
  },

  props: {
    locations: {
      type: Array as () => IEventGenericLocation[],
      required: true,
    },

    dataTestPrefix: {
      type: String,
      required: true,
    },
  },

  computed: {
    sortedLocations(): Array<IEventGenericLocation> {
      return helpers.sortMultilingualArray(this.locations, 'name');
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
