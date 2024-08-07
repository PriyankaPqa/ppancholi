<template>
  <v-row class="px-4 rc-body14 border box">
    <v-col lg="4" cols="6">
      <div class="font-weight-bold" data-test="current_temporary_address_title">
        {{ isPreviousTemporaryAddress ? '' : $t('impactedIndividuals.current_temporary_address') }}
      </div>
      <div data-test="current_temporary_address">
        <current-address-template :current-address="currentAddress" hide-title />
      </div>
    </v-col>
    <v-col lg="4" cols="6">
      <div class="d-flex">
        <div>
          <span class="font-weight-bold">{{ $t('impactedIndividuals.temporary_address.check_in') + ':' }}</span>
          <span data-test="impacted_individuals_card_template_check_in">
            {{ address.checkIn ? helpers.getLocalStringDate(address.checkIn, 'ImpactedIndividuals.checkIn', 'PP') : '-' }}
          </span>
        </div>
        <v-divider vertical class="mx-4" />
        <div>
          <span class="font-weight-bold">{{ $t('impactedIndividuals.temporary_address.check_out') + ':' }}</span>
          <span data-test="impacted_individuals_card_template_check_out">
            {{ address.checkOut ? helpers.getLocalStringDate(address.checkOut, 'ImpactedIndividuals.checkOut', 'PP') : '-' }}
          </span>
        </div>
      </div>
      <div>
        <span class="font-weight-bold">{{ $t('impactedIndividuals.temporary_address.crc_provided') + ':' }}</span>
        <span data-test="impacted_individuals_card_template_is_crc_provided">{{ address.crcProvided ? $t('common.yes') : $t('common.no') }}</span>
      </div>
      <div v-if="!address.takeover">
        <v-chip label color="green" text-color="white">
          <v-icon class="mr-2" small>
            mdi-check-circle-outline
          </v-icon>
          {{ $t('impactedIndividuals.takeoverCompleted') }}
        </v-chip>
      </div>
    </v-col>
    <v-col lg="4" cols="12" class="pt-2 d-flex justify-end">
      <template v-if="!$hasFeature($featureKeys.Lodging)">
        <v-btn v-if="showEditButton" icon :disabled="disableEditing" :aria-label="$t('common.edit')" data-test="edit_button" @click="$emit('open-edit-address', true)">
          <v-icon>
            mdi-pencil
          </v-icon>
        </v-btn>
      </template>
      <template v-else>
        <v-btn v-if="showEditButton && !disableEditing" color="secondary" :aria-label="$t('common.edit')" data-test="edit_button" @click="$emit('open-edit-address', false)">
          {{ $t('impactedIndividuals.updateExistingAddress') }}
        </v-btn>
      </template>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import CurrentAddressTemplate from '@libs/registration-lib/components/review/addresses/CurrentAddressTemplate.vue';
import { UserRoles } from '@libs/entities-lib/user';
import helpers from '@/ui/helpers/helpers';
import { TemporaryAddress } from '@libs/entities-lib/case-file-individual';
import { CurrentAddress } from '@libs/entities-lib/value-objects/current-address';
import { IEventGenericLocation } from '@libs/entities-lib/event';

export default Vue.extend({
  name: 'ImpactedIndividualAddressTemplate',

  components: {
    CurrentAddressTemplate,
  },

  props: {
    address: {
      type: Object as () => TemporaryAddress,
      required: true,
    },

    isPreviousTemporaryAddress: {
      type: Boolean,
      default: false,
    },

    showEditButton: {
      type: Boolean,
      default: false,
    },

    disableEditing: {
      type: Boolean,
      default: false,
    },

    shelterLocationsList: {
      type: Array as () => IEventGenericLocation[],
      default: null,
    },
  },

  data() {
    return {
      UserRoles,
      helpers,
    };
  },

  computed: {
    currentAddress(): CurrentAddress {
      const address = new CurrentAddress(this.address);
      address.shelterLocation = this.shelterLocationsList.find((s) => s.id === this.address.shelterLocationId);
      return address;
    },
  },
});
</script>

<style scoped lang="scss">
.box {
  box-sizing: border-box;
  margin: 0;
}
</style>
