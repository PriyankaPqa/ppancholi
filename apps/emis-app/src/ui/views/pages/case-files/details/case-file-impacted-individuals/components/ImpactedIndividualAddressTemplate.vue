<template>
  <v-row class="px-4 rc-body14 border box">
    <v-col cols="3" class="font-weight-bold" data-test="current_temporary_address_title">
      {{ isPreviousTemporaryAddress ? '' : $t('impactedIndividuals.current_temporary_address') }}
    </v-col>
    <v-col cols="3">
      <current-address-template :current-address="address" hide-title />
    </v-col>
    <v-col cols="5">
      <div class="d-flex">
        <div>
          <span class="font-weight-bold">{{ $t('impactedIndividuals.temporary_address.check_in') + ':' }}</span>
          Aug 2, 2022
        </div>
        <v-divider vertical class="mx-2" />
        <div>
          <span class="font-weight-bold">{{ $t('impactedIndividuals.temporary_address.check_out') + ':' }}</span>
          Aug 9, 2022
        </div>
      </div>
      <div>
        <span class="font-weight-bold">{{ $t('impactedIndividuals.temporary_address.crc_provided') + ':' }}</span>
        Yes
      </div>
    </v-col>
    <v-col cols="1" class="pt-2 pl-10">
      <v-btn v-if="canEdit" icon data-test="edit_button" @click="$emit('open-edit-temporary-address-dialog')">
        <v-icon>
          mdi-pencil
        </v-icon>
      </v-btn>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import { ICurrentAddress } from '@libs/entities-lib/value-objects/current-address';
import CurrentAddressTemplate from '@libs/registration-lib/components/review/addresses/CurrentAddressTemplate.vue';

export default Vue.extend({
  name: 'ImpactedIndividualAddressTemplate',

  components: {
    CurrentAddressTemplate,
  },

  props: {
    address: {
      type: Object as () => ICurrentAddress,
      required: true,
    },

    isPreviousTemporaryAddress: {
      type: Boolean,
      default: false,
    },

    canEdit: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<style scoped lang="scss">
.box {
  box-sizing: border-box;
  width: 100%;
  margin: 0;
}
</style>
