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
import {
  EIndigenousTypes, IContactInformation, IIndigenousIdentityData, IPerson,
} from '@crctech/registration-lib/src/entities/beneficiary';
import helpers from '@crctech/registration-lib/src/ui/helpers';
import { TranslateResult } from 'vue-i18n';
import { ECanadaProvinces } from '@/types';

export default Vue.extend({
  name: 'PersonalInformationTemplate',

  props: {
    personalInformation: {
      type: Object as () => IPerson & IContactInformation,
      required: true,
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
          test: 'mobilePhone',
        },
        {
          text: this.$t('registration.personal_info.homePhoneNumber'),
          value: this.getHomePhoneNumber,
          test: 'homePhone',
        },
        {
          text: this.$t('registration.personal_info.alternatePhoneNumber'),
          value: this.getOtherPhoneNumber,
          test: 'otherPhone',
        },
        {
          text: this.$t('registration.personal_info.otherPhoneExtension'),
          value: this.personalInformation.otherPhoneExtension || '-',
          test: 'otherPhoneExtension',
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
      return helpers.displayBirthDate(this.personalInformation.birthDate);
    },

    getPrimarySpokenLanguage(): TranslateResult {
      if (this.personalInformation.primarySpokenLanguage.isOther) return this.personalInformation.primarySpokenLanguageOther;
      return this.$m(this.personalInformation.primarySpokenLanguage.name);
    },

    getPreferredLanguage(): TranslateResult {
      if (this.personalInformation.preferredLanguageOther) return this.personalInformation.preferredLanguageOther;
      return this.$m(this.personalInformation.preferredLanguage.name);
    },

    getGender(): TranslateResult {
      if (this.personalInformation.gender.isOther) return this.personalInformation.genderOther;
      return this.$m(this.personalInformation.gender.name);
    },

    getMobilePhoneNumber(): string {
      if (this.personalInformation?.mobilePhone?.number) {
        return this.personalInformation.mobilePhone.number;
      }
      return '-';
    },

    getHomePhoneNumber(): string {
      if (this.personalInformation?.homePhone?.number) {
        return this.personalInformation.homePhone.number;
      }
      return '-';
    },

    getOtherPhoneNumber(): string {
      if (this.personalInformation?.otherPhone?.number) {
        return this.personalInformation.otherPhone.number;
      }
      return '-';
    },

    otherIndigenousType(): boolean {
      return this.personalInformation?.indigenousType === EIndigenousTypes.Other;
    },

    getIndigenousIdentity(): string {
      const p = this.personalInformation;

      const province = p.indigenousProvince ? this.$t(`common.provinces.${ECanadaProvinces[p.indigenousProvince]}`) : '';

      const type = p.indigenousType ? this.$t(`common.indigenous.types.${EIndigenousTypes[p.indigenousType]}`) : '';
      const community = p.indigenousProvince ? this.$store.state.registration.indigenousIdentities[p.indigenousProvince]
        .find((i: IIndigenousIdentityData) => i.id === p.indigenousCommunityId) : null;

      if (this.otherIndigenousType) {
        return `${province}, ${type}, ${p.indigenousCommunityOther}`;
      }

      if (p.indigenousProvince && p.indigenousType && community) {
        return `${province}, ${type}, ${community?.communityName}`;
      }
      return '';
    },
  },
});
</script>

<style scoped lang="scss">
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
