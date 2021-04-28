<template>
  <div class="information-container">
    <div class="column rc-body14">
      <div class="rc-body14 fw-bold">
        {{ $t('registration.menu.personal_info') }}
      </div>
      <div data-test="householdMember__birthdate">
        {{ getBirthDateLine }}
      </div>
      <div>
        {{ $t('registration.personal_info.gender') }}: <span data-test="householdMember__gender">{{ getGender }}</span>
      </div>
      <div v-if="getIndigenousIdentity" style="max-width: 350px;">
        {{ $t('registration.personal_info.selfIdentification') }}:
        <span data-test="householdMember__indigenousIdentity">{{ getIndigenousIdentity }}</span>
      </div>
    </div>
    <div class="column rc-body14 pt-2 pt-sm-0">
      <temporary-address-template :address="person.temporaryAddress" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { EIndigenousTypes, IIndigenousIdentityData, IPerson } from '@crctech/registration-lib/src/entities/value-objects/person';
import helpers from '@crctech/registration-lib/src/ui/helpers';
import { ECanadaProvinces } from '@/types';
import TemporaryAddressTemplate from '@/ui/views/pages/registration/review/addresses/TemporaryAddressTemplate.vue';
import { TranslateResult } from 'vue-i18n';

export default Vue.extend({
  name: 'HouseholdMemberTemplate',

  components: { TemporaryAddressTemplate },

  props: {
    person: {
      type: Object as () => IPerson,
      required: true,
    },
  },
  computed: {
    getIndigenousIdentity(): string {
      const p = this.person;

      const province = p.indigenousProvince ? this.$t(`common.provinces.${ECanadaProvinces[p.indigenousProvince]}`) : '';

      const type = p.indigenousType ? this.$t(`common.indigenous.types.${EIndigenousTypes[p.indigenousType]}`) : '';

      const community = p.indigenousProvince ? this.$store.state.registration.indigenousIdentities[p.indigenousProvince]
        .find((i: IIndigenousIdentityData) => i.id === p.indigenousCommunityId) : null;

      if (p.indigenousType === EIndigenousTypes.Other) {
        return `${province}, ${type}, ${p.indigenousCommunityOther}`;
      }

      if (p.indigenousProvince && p.indigenousType && community) {
        return `${province}, ${type}, ${community?.communityName}`;
      }
      return '';
    },

    getBirthDateLine(): string {
      // eslint-disable-next-line max-len
      return `${this.$t('registration.personal_info.birthdate')}: ${helpers.displayBirthDate(this.person.birthDate)} (${helpers.getAge(this.person.birthDate)} ${this.$t('common.years')})`;
    },

    getGender(): TranslateResult {
      if (this.person.genderOther) return this.person.genderOther;
      return this.$m(this.person.gender.name);
    },
  },

});
</script>

<style lang="scss" scoped>
@media only screen and (min-width: $breakpoint-xs-min) and (max-width: $breakpoint-xs-max) {
  .column {
    border: solid 1px var(--v-grey-lighten2);
    justify-items: center;
    align-items: baseline;
    padding: 16px;
    width: 100%;
    border-top-width: 0px;
    &:first-child {
      border-radius: 0px 0px 0px 0px;
    }
    &:last-child {
      border-radius: 0px 0px 4px 4px;
    }
  }
}
@media only screen and (min-width: $breakpoint-sm-min) {
  .information-container {
    border: solid 1px var(--v-grey-lighten2);
    border-top-width: 0px;
    border-radius: 0 0 4px 4px;
    display: flex;
    justify-items: center;
    align-items: baseline;
    padding: 16px;
    width: 100%;
    & > .column {
      display: flex;
      width: 100%;
      flex-direction: column;
      justify-content: space-evenly;
    }
  }
}
</style>
