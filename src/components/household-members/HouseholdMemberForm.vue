<template>
  <v-row no-gutters>
    <identity-form
      :form="person"
      prefix-data-test="houseHoldMember"
      :gender-items="genderItems"
      @change="$emit('identity-change', $event)" />
    <indigenous-identity-form
      :canadian-provinces-items="canadianProvincesItems"
      :indigenous-communities-items="indigenousCommunitiesItems"
      :indigenous-types-items="indigenousTypesItems"
      :loading="loading"
      :form="person"
      prefix-data-test="houseHoldMember"
      @change="$emit('indigenous-identity-change', $event)"
      @province-change="$emit('province-change', $event)" />
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
          <temp-address-form
            :shelter-locations="shelterLocations"
            :canadian-provinces-items="canadianProvincesItems"
            :temporary-address-type-items="temporaryAddressTypeItems"
            :api-key="apiKey"
            :temporary-address="person.temporaryAddress"
            @change="$emit('temporary-address-change', $event)" />
        </v-col>
      </v-col>
    </v-row>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import VueI18n from 'vue-i18n';
import { IShelterLocation } from '../../entities/beneficiary';
import { IOptionItemData } from '../../types';
import IndigenousIdentityForm from '../forms/IndigenousIdentityForm.vue';
import IdentityForm from '../forms/IdentityForm.vue';
import TempAddressForm from '../forms/TempAddressForm.vue';
import months from '../../constants/months';
import { IPerson } from '../../entities/value-objects/person';

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

    genderItems: {
      type: Array as () => IOptionItemData[],
      required: true,
    },

    canadianProvincesItems: {
      type: Array as () => IOptionItemData[],
      required: true,
    },

    indigenousCommunitiesItems: {
      type: Array as () => IOptionItemData[],
      required: true,
    },

    indigenousTypesItems: {
      type: Array as () => IOptionItemData[],
      required: true,
    },

    loading: {
      type: Boolean,
      required: true,
    },

    apiKey: {
      type: String,
      required: true,
    },

    temporaryAddressTypeItems: {
      type: Array as () => Record<string, unknown>[],
      required: true,
    },

    shelterLocations: {
      type: Array as () => IShelterLocation[],
      required: true,
    },

    i18n: {
      type: Object as () => VueI18n,
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
