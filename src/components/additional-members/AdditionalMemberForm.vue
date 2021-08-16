<template>
  <v-row no-gutters>
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
    <v-row class="grey-container pa-2 pb-0">
      <v-col class="pt-4 px-4">
        <div class="rc-body16 fw-bold">
          {{ $t('registration.household_member.sameAddress') }}
        </div>

        <v-radio-group :value="sameAddress" @change="$emit('update:sameAddress', $event)">
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
        <v-col v-if="!sameAddress" cols="12" class="pt-4 pb-0 px-4 pr-sm-0 pl-sm-6">
          <current-address-form
            :shelter-locations="shelterLocations"
            :canadian-provinces-items="canadianProvincesItems"
            :current-address-type-items="currentAddressTypeItems"
            :no-fixed-home="false"
            :api-key="apiKey"
            :current-address="member.currentAddress"
            in-household-profile
            @change="$emit('temporary-address-change', $event)" />
        </v-col>

        <v-col v-if="inHouseholdProfile" cols="12" sm="6" md="4" class="px-6">
          <v-date-field-with-validation
            :value="movedDate"
            data-test="household_address_from"
            prepend-inner-icon="mdi-calendar"
            :label="`${$t('household.addresses.from')}`"
            :placeholder="$t('event.select_date')"
            :min="today"
            @change="changeMovedDate($event)" />
        </v-col>
      </v-col>
    </v-row>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import VueI18n from 'vue-i18n';
import moment from 'moment';
import { VDateFieldWithValidation } from '@crctech/component-library';
import { CurrentAddress, IShelterLocationData } from '../../entities/household-create';
import { IOptionItemData } from '../../types';
import IndigenousIdentityForm from '../forms/IndigenousIdentityForm.vue';
import IdentityForm from '../forms/IdentityForm.vue';
import CurrentAddressForm from '../forms/CurrentAddressForm.vue';
import months from '../../constants/months';
import { IMember } from '../../entities/value-objects/member';

export default Vue.extend({
  name: 'AdditionalMemberForm',

  components: {
    CurrentAddressForm,
    IdentityForm,
    IndigenousIdentityForm,
    VDateFieldWithValidation,
  },

  props: {
    member: {
      type: Object as () => IMember,
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

    inHouseholdProfile: {
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
    movedDate() {
      return moment(this.member.currentAddress.from).utc().format('YYYY-MM-DD');
    },

    today(): string { return moment(new Date()).utc().format('YYYY-MM-DD'); },
  },

  methods: {
    changeMovedDate(movedDate: string) {
      const address = new CurrentAddress({ ...this.member.currentAddress, from: movedDate });
      this.$emit('temporary-address-change', address);
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
