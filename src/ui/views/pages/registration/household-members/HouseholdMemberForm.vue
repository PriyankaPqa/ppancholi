<template>
  <v-row no-gutters>
    <identity-form :form="person" prefix-data-test="houseHoldMember" />
    <indigenous-identity-form :form="person" prefix-data-test="houseHoldMember" />
    <v-row class="grey-container pa-2 pb-0">
      <v-col class="pt-4 px-4">
        <div class="rc-body16 fw-bold">
          {{ $t('registration.household_member.sameAddress') }}
        </div>

        <v-radio-group :value="sameAddress" @change="$emit('update:sameAddress', $event)">
          <div class="flex-contain">
            <span>
              <v-radio data-test="sameTemporaryAddressYes" :label="$t('common.yes')" :value="true" />
            </span>
            <span class="rc-body12 ml-5">
              {{ $t('registration.household_member.sameAddress.yes.detail') }}
            </span>
          </div>
          <div class="flex-contain mt-2">
            <span>
              <v-radio data-test="sameTemporaryAddressNo" :label="$t('common.no')" :value="false" />
            </span>
            <span class="rc-body12 ml-5">
              {{ $t('registration.household_member.sameAddress.no.detail') }}
            </span>
          </div>
        </v-radio-group>
        <v-col v-if="!sameAddress" cols="12" class="pt-4 pb-0 px-4 pr-sm-0 pl-sm-6">
          <temp-address-form :temporary-address="person.temporaryAddress" hide-remaining-home />
        </v-col>
      </v-col>
    </v-row>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import IdentityForm from '@/ui/views/components/shared/form/IdentityForm.vue';
import IndigenousIdentityForm from '@/ui/views/components/shared/form/IndigenousIdentityForm.vue';
import months from '@/constants/months';
import { IPerson } from '@/entities/value-objects/person';
import TempAddressForm from '@/ui/views/components/shared/form/TempAddressForm.vue';

export default Vue.extend({
  name: 'HouseholdMemberForm',

  components: {
    TempAddressForm,
    IdentityForm,
    IndigenousIdentityForm,
  },

  props: {
    person: {
      type: Object as () => IPerson,
      required: true,
    },
    sameAddress: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      months,
    };
  },
});
</script>

<style scoped lang="scss">
.grey-container {
  background-clip: content-box;
}

.flex-contain {
  display: flex;
  align-items: center;
}

</style>
