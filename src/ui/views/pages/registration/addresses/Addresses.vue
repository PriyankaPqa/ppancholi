<template>
  <v-row no-gutters>
    <v-col cols="12" class="pb-0">
      <h5 class="rc-heading-5">
        {{ $t('registration.addresses.homeAddress') }}
        <v-tooltip bottom>
          <template #activator="{ on }">
            <v-btn small class="ml-1" icon data-test="pageContent__opeHelp" v-on="on">
              <v-icon small>
                mdi-help-circle-outline
              </v-icon>
            </v-btn>
          </template>
          <span>{{ $t('common.help') }}</span>
        </v-tooltip>
      </h5>
    </v-col>
    <v-col cols="12" class="pb-6">
      <v-row no-gutters>
        <v-checkbox-with-validation
          v-model="noFixedHome"
          data-test="address__noFixedHomeAddress"
          :label="`${$t('registration.addresses.noFixedHomeAddress')}`" />
      </v-row>
    </v-col>

    <template v-if="!noFixedHome">
      <address-form prefix-data-test="address" />
    </template>

    <temp-address-form
      :temporary-address="temporaryAddress"
      :no-fixed-home="noFixedHome"
      prefix-data-test="tempAddress"
      @update="setTemporaryAddress($event)" />
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import { VCheckboxWithValidation } from '@crctech/component-library';

import AddressForm from '@/ui/views/components/shared/form/AddressForm.vue';
import TempAddressForm from '@/ui/views/components/shared/form/TempAddressForm.vue';
import { ITemporaryAddress } from '@/entities/value-objects/temporary-address';

export default Vue.extend({
  name: 'Addresses',

  components: {
    VCheckboxWithValidation,
    AddressForm,
    TempAddressForm,
  },

  computed: {
    temporaryAddress(): ITemporaryAddress {
      return this.$storage.beneficiary.getters.beneficiary().person.temporaryAddress;
    },

    noFixedHome: {
      get(): boolean {
        return this.$store.state.beneficiary.noFixedHome;
      },
      set(checked: boolean) {
        this.$storage.beneficiary.mutations.setNoFixedHome(checked);
      },
    },
  },

  methods: {
    setTemporaryAddress(tmpAddress: ITemporaryAddress) {
      this.$storage.beneficiary.mutations.setTemporaryAddress(tmpAddress);
    },
  },

});
</script>
