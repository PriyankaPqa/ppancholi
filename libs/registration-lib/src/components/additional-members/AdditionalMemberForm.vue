<template>
  <v-row no-gutters class="d-flex flex-column">
    <identity-form
      :form="member.identitySet"
      prefix-data-test="additionalMember"
      :gender-items="genderItems"
      @change="$emit('identity-change', $event)" />
    <indigenous-identity-form
      :canadian-provinces-items="canadianProvincesItems"
      :indigenous-communities-items="indigenousCommunitiesItems"
      :indigenous-types-items="indigenousTypesItems"
      :loading="loading"
      :form="member.identitySet"
      prefix-data-test="additionalMember"
      @change="$emit('indigenous-identity-change', $event)" />
    <v-row v-if="!hideEditTemporaryAddress" class="grey-container pa-2 pb-0">
      <v-col class="pt-4 px-4">
        <div class="rc-body16 fw-bold">
          {{ $t('registration.household_member.sameAddress') }} *
        </div>
        <validation-provider v-slot="{ errors }" :rules="rules.isSameAddress">
          <v-radio-group
            :value="sameAddress"
            :error-messages="errors"
            @change="$emit('update:sameAddress', $event)">
            <div class="flex-contain">
              <span>
                <v-radio data-test="sameCurrentAddressYes" :label="$t('common.yes')" :value="true" />
              </span>
              <span class="rc-body12 ml-5">
                {{ $t('registration.household_member.sameAddress.yes.detail') }}
              </span>
            </div>
            <div class="flex-contain mt-2">
              <span>
                <v-radio data-test="sameCurrentAddressNo" :label="$t('common.no')" :value="false" />
              </span>
              <span class="rc-body12 ml-5">
                {{ $t('registration.household_member.sameAddress.no.detail') }}
              </span>
            </div>
          </v-radio-group>
        </validation-provider>
        <v-col v-if="sameAddress === false" cols="12" class="pt-4 pb-0 px-4 pr-sm-0 pl-sm-6">
          <current-address-form
            :shelter-locations="shelterLocations"
            :canadian-provinces-items="canadianProvincesItems"
            :current-address-type-items="currentAddressTypeItems"
            :no-fixed-home="false"
            :api-key="apiKey"
            :disable-autocomplete="disableAutocomplete"
            :current-address="member.currentAddress"
            @change="$emit('temporary-address-change', $event)" />
        </v-col>
      </v-col>
    </v-row>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import VueI18n from 'vue-i18n';
import { IOptionItemData } from '@libs/shared-lib/types';
import { IShelterLocationData } from '@libs/entities-lib/src/household-create';
import { IMember } from '@libs/entities-lib//value-objects/member';
import IndigenousIdentityForm from '../forms/IndigenousIdentityForm.vue';
import IdentityForm from '../forms/IdentityForm.vue';
import CurrentAddressForm from '../forms/CurrentAddressForm.vue';
import months from '../../constants/months';

export default Vue.extend({
  name: 'AdditionalMemberForm',

  components: {
    CurrentAddressForm,
    IdentityForm,
    IndigenousIdentityForm,
  },

  props: {
    member: {
      type: Object as () => IMember,
      required: true,
    },

    sameAddress: {
      type: Boolean,
      default: null,
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

    disableAutocomplete: {
      type: Boolean,
      required: true,
    },

    currentAddressTypeItems: {
      type: Array as () => Record<string, unknown>[],
      required: true,
    },

    shelterLocations: {
      type: Array as () => IShelterLocationData[],
      required: true,
    },

    i18n: {
      type: Object as () => VueI18n,
      required: true,
    },

    hideEditTemporaryAddress: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      months,
    };
  },

  computed: {
    rules() {
      return {
        isSameAddress: { requiredCheckbox: true, oneOf: [false, true] },
      };
    },
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
