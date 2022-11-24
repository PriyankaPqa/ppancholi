<template>
  <div class="info-container mb-8">
    <div v-for="(d, index) in displayData" :key="index" :data-test="d.test" class="row-data">
      <div class="flex-sm-grow-1 rc-body14 column fw-bold">
        {{ d.text }}
      </div>
      <div class="flex-sm-grow-1 rc-body14 column">
        {{ d.value }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import helpers from '@libs/entities-lib/helpers';
import {
  EIndigenousTypes, IContactInformation, IIdentitySet, IIndigenousCommunityData, IPhoneNumber,
} from '@libs/entities-lib/household-create';

export default Vue.extend({
  name: 'PersonalInformationTemplate',

  props: {
    personalInformation: {
      type: Object as () => IIdentitySet & IContactInformation,
      required: true,
    },

    showAgeInReview: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    displayData(): Array<Record<string, unknown>> {
      return [
        {
          text: this.$t('registration.personal_info.firstName'),
          value: this.personalInformation.firstName,
          test: 'firstName',
        },
        {
          text: this.$t('registration.personal_info.middleName'),
          value: this.personalInformation.middleName || '-',
          test: 'middleName',
        },
        {
          text: this.$t('registration.personal_info.lastName'),
          value: this.personalInformation.lastName,
          test: 'lastName',
        },
        {
          text: this.$t('registration.personal_info.preferredName'),
          value: this.personalInformation.preferredName || '-',
          test: 'preferredName',
        },
        {
          text: this.$t('registration.personal_info.birthdate'),
          value: this.getBirthDate,
          test: 'birthDate',
        },
        {
          text: this.$t('registration.personal_info.gender'),
          value: this.getGender,
          test: 'gender',
        },
        {
          text: this.$t('registration.personal_info.preferredLanguage'),
          value: this.getPreferredLanguage,
          test: 'preferredLanguage',
        },
        {
          text: this.$t('registration.personal_info.primarySpokenLanguage'),
          value: this.getPrimarySpokenLanguage,
          test: 'primarySpokenLanguage',
        },
        {
          text: this.$t('registration.personal_info.mobilePhoneNumber'),
          value: this.getMobilePhoneNumber,
          test: 'mobilePhoneNumber',
        },
        {
          text: this.$t('registration.personal_info.homePhoneNumber'),
          value: this.getHomePhoneNumber,
          test: 'homePhoneNumber',
        },
        {
          text: this.$t('registration.personal_info.alternatePhoneNumber'),
          value: this.getAlternatePhoneNumber,
          test: 'alternatePhoneNumber',
        },
        {
          text: this.$t('registration.personal_info.alternatePhoneNumberExtension'),
          value: this.personalInformation.alternatePhoneNumber?.extension || '-',
          test: 'alternatePhoneNumberExtension',
        },
        {
          text: this.$t('registration.personal_info.emailAddress'),
          value: this.personalInformation.email || '-',
          test: 'email',
        },
        {
          text: this.$t('registration.personal_info.selfIdentification'),
          value: this.getIndigenousIdentity,
          test: 'indigenousIdentity',
        },
      ];
    },

    getBirthDate(): string {
      const { birthDate } = this.personalInformation;

      let result = helpers.displayBirthDate(birthDate);

      if (this.showAgeInReview) {
        result += ` (${helpers.getAge(birthDate)} ${this.$t('common.years')})`;
      }

      return result;
    },

    getPrimarySpokenLanguage(): TranslateResult {
      if (!this.personalInformation.primarySpokenLanguage) {
        return null;
      }
      if (this.personalInformation.primarySpokenLanguage.isOther) {
        return this.personalInformation.primarySpokenLanguageOther;
      }
      return this.$m(this.personalInformation.primarySpokenLanguage.name);
    },

    getPreferredLanguage(): TranslateResult {
      if (this.personalInformation.preferredLanguageOther) {
        return this.personalInformation.preferredLanguageOther;
      }
      return this.$m(this.personalInformation.preferredLanguage.name);
    },

    getGender(): TranslateResult {
      if (this.personalInformation.gender.isOther) {
        return this.personalInformation.genderOther;
      }
      return this.$m(this.personalInformation.gender.name);
    },

    getMobilePhoneNumber(): string {
      return this.phoneNumberDisplay(this.personalInformation?.mobilePhoneNumber) || '-';
    },

    getHomePhoneNumber(): string {
      return this.phoneNumberDisplay(this.personalInformation?.homePhoneNumber) || '-';
    },

    getAlternatePhoneNumber(): string {
      return this.phoneNumberDisplay(this.personalInformation?.alternatePhoneNumber) || '-';
    },

    otherIndigenousType(): boolean {
      return this.personalInformation?.indigenousType === EIndigenousTypes.Other;
    },

    getIndigenousIdentity(): string {
      const p = this.personalInformation;

      const type = p.indigenousType ? this.$t(`common.indigenous.types.${EIndigenousTypes[p.indigenousType]}`) : '';
      const community = this.$store.state.registration.indigenousCommunities
        .find((i: IIndigenousCommunityData) => i.id === p.indigenousCommunityId);

      if (this.otherIndigenousType) {
        // return `${type}, ${p.indigenousCommunityOther}`;
        return `${type}`;
      }

      if (p.indigenousType && community) {
        // return `${type}, ${community?.communityName}`;
        return `${type}`;
      }
      return '';
    },
  },

  methods: {
    phoneNumberDisplay(phone: IPhoneNumber): string {
      if (!phone) {
        return null;
      }
      return (phone.e164Number || phone.e164number) && phone.countryCode && phone.countryCode !== 'CA'
        && phone.countryCode !== 'US' ? (phone.e164Number || phone.e164number) : phone.number;
    },
  },
});
</script>

<style scoped lang="scss">
@import "@libs/shared-lib/assets/styles/breakpoints";

@media only screen and (min-width: $breakpoint-xs-min) and (max-width: $breakpoint-xs-max) {
  .row-data {
    border: solid var(--v-grey-lighten2);
    border-width:1px 1px 0 1px;
    justify-items: center;
    align-items: baseline;
    padding: 8px 16px;
  }
}
@media only screen and (min-width: $breakpoint-sm-min) {
  .row-data {
    border: solid var(--v-grey-lighten2);
    border-width:1px 1px 0 1px;
    display: flex;
    justify-items: center;
    align-items: center;
    padding: 8px 0px;
  }
  .column {
    max-width: 50%;
    padding: 0 16px;
  }
}

.row-data:last-child {
  border-bottom-right-radius: 4px;
  border-bottom-left-radius: 4px;
  border-bottom: solid 1px var(--v-grey-lighten2);
}
.row-data:first-child {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}
</style>
