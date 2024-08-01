<template>
  <div class="full-width">
    <v-sheet v-for="(grp, ix) in requestData" :key="ix" rounded outlined class="my-3">
      <v-simple-table>
        <tbody>
          <tr v-for="item in grp" :key="item.label" :data-test="`details_${item.label}`">
            <td class="label fw-bold">
              {{ $t(item.label) }}
            </td>
            <td class="data">
              {{ item.data }}
            </td>
          </tr>
        </tbody>
      </v-simple-table>
    </v-sheet>
  </div>
</template>

<script lang='ts'>
import { ECurrentAddressTypes } from '@libs/entities-lib/value-objects/current-address';
import helpers from '@/ui/helpers/helpers';
import libHelpers from '@libs/entities-lib/helpers';
import { IBookingRequest, RoomOption, RoomType } from '@libs/entities-lib/booking-request';
import mixins from 'vue-typed-mixins';
import caseFileDetail from '../case-files/details/caseFileDetail';

export default mixins(caseFileDetail).extend({
  name: 'ReviewBookingRequest',

  props: {
    bookingRequest: {
      type: Object as () => IBookingRequest,
      required: true,
    },
  },

  computed: {
    requestData(): { label: string, data: any }[][] {
      const addressLines = this.bookingRequest.shelterLocationId
        ? this.$m(this.event.shelterLocations.find((s) => s.id === this.bookingRequest.shelterLocationId)?.name)
        : libHelpers.getAddressLines(this.bookingRequest.address, this.$i18n).filter((x) => x).join(', ');
      const options = helpers.enumToTranslatedCollection(RoomOption, 'enums.RoomOption');
      const roomTypes = helpers.enumToTranslatedCollection(RoomType, 'enums.RoomType');

      return [
        [
          { label: 'bookingRequest.isProvidedByCrc', data: this.$t('common.yes') },
          { label: 'bookingRequest.addressType', data: this.$t(`registration.addresses.temporaryAddressTypes.${ECurrentAddressTypes[this.bookingRequest.addressType]}`) },
          { label: 'bookingRequest.checkIn', data: helpers.getLocalStringDate(this.bookingRequest.checkIn, 'BookingRequest.checkIn', 'PP') },
          { label: 'bookingRequest.checkOut', data: helpers.getLocalStringDate(this.bookingRequest.checkOut, 'BookingRequest.checkOut', 'PP') },
          { label: 'bookingRequest.address', data: addressLines },
        ],
        [
          { label: 'bookingRequest.numberOfAdults', data: this.bookingRequest.numberOfAdults },
          { label: 'bookingRequest.numberOfChildren', data: this.bookingRequest.numberOfChildren },
          { label: 'bookingRequest.numberOfRooms', data: this.bookingRequest.numberOfRooms },
          { label: 'bookingRequest.roomType', data: (this.bookingRequest.roomTypes || []).map((o) => roomTypes.find((o2) => o2.value === o)?.text).join(', ') },
          { label: 'bookingRequest.roomOptions', data: (this.bookingRequest.roomOptions || []).map((o) => options.find((o2) => o2.value === o)?.text).join(', ') },
        ],
        [
          { label: 'bookingRequest.notes', data: this.bookingRequest.notes },
        ],
      ];
    },
  },

});

</script>
