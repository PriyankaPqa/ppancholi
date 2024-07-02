<template>
  <div class="information-container">
    <div class="column rc-body14">
      <div class="rc-body14 fw-bold">
        {{ $t('registration.menu.personal_info') }}
      </div>
      <div data-test="additionalMember__birthdate">
        {{ getBirthDateLine }}
      </div>
      <div>
        {{ $t('registration.personal_info.gender') }}: <span data-test="additionalMember__gender">{{ getGender }}</span>
      </div>
      <div v-if="getIndigenousIdentity" style="max-width: 350px;">
        {{ $t('registration.personal_info.selfIdentification') }}:
        <span data-test="additionalMember__indigenousIdentity">{{ getIndigenousIdentity }}</span>
      </div>
    </div>
    <div class="column rc-body14">
      <current-address-template :current-address="member.currentAddress" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import helpers from '@libs/entities-lib/helpers';
import { EIndigenousTypes, IIndigenousCommunityData, IMember } from '@libs/entities-lib/household-create';
import CurrentAddressTemplate from '../addresses/CurrentAddressTemplate.vue';

export default Vue.extend({
  name: 'AdditionalMemberTemplate',

  components: { CurrentAddressTemplate },

  props: {
    member: {
      type: Object as () => IMember,
      required: true,
    },
  },
  computed: {
    getIndigenousIdentity(): string {
      const m = this.member;

      const type = m.identitySet.indigenousType ? this.$t(`common.indigenous.types.${EIndigenousTypes[m.identitySet.indigenousType]}`) : '';

      const community = this.$registrationStore.indigenousCommunities
        .find((i: IIndigenousCommunityData) => i.id === m.identitySet.indigenousCommunityId);

      if (m.identitySet.indigenousType === EIndigenousTypes.Other) {
        // return `${type}, ${m.identitySet.indigenousCommunityOther}`;
        return `${type}`;
      }

      if (m.identitySet.indigenousType && community) {
        // return `${type}, ${community?.communityName}`;
        return `${type}`;
      }
      return '';
    },

    getBirthDateLine(): string {
      // eslint-disable-next-line vue/max-len
      return `${this.$t('registration.personal_info.birthdate')} : ${helpers.displayBirthDate(this.member.identitySet.birthDate)} (${helpers.getAge(this.member.identitySet.birthDate)} ${this.$t('common.years')})`;
    },

    getGender(): TranslateResult {
      if (this.member.identitySet.genderOther) {
        return this.member.identitySet.genderOther;
      }
      return this.$m(this.member.identitySet.gender.name);
    },
  },

});
</script>

<style lang="scss" scoped>
@import "@libs/shared-lib/assets/styles/breakpoints";

@media only screen and (min-width: $breakpoint-xs-min) and (max-width: $breakpoint-xs-max) {
  .column {
    border: solid 1px var(--v-grey-lighten2);
    justify-items: center;
    align-items: baseline;
    padding: 16px;
    width: 100%;
    border-top-width: 0px;
    &:first-child {
      border-radius: 0px 2px 0px 0px;
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
    display:flex;
  }

  .column {
    padding: 16px;
    width: 100%;
  }

  :not(:first-child).column  {
    border-left: 1px solid var(--v-grey-lighten2);
  }

}
</style>
