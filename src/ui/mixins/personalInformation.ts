// Mixin used for Individual.vue and RegistrationIndividual.vue
import { TranslateResult } from 'vue-i18n';

import Vue from 'vue';
import {
  ECanadaProvinces,
  IOptionItemData,
} from '../../types';
import { IBeneficiary, IContactInformation, IPerson } from '../../entities/beneficiary';

declare module 'vue/types/vue' {
  interface Vue {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $storage: any;
  }
}

export default Vue.extend({
  computed: {
    person(): IPerson {
      return this.beneficiary.person;
    },

    contactInformation(): IContactInformation {
      return this.beneficiary.contactInformation;
    },

    beneficiary(): IBeneficiary {
      return this.$storage.beneficiary.getters.beneficiary();
    },

    preferredLanguagesItems(): IOptionItemData[] {
      return this.$storage.registration.getters.preferredLanguages();
    },

    primarySpokenLanguagesItems(): IOptionItemData[] {
      return this.$storage.registration.getters.primarySpokenLanguages();
    },

    genderItems(): IOptionItemData[] {
      return this.$storage.registration.getters.genders();
    },



    indigenousTypesItems(): Record<string, TranslateResult>[] {
      return this.$storage.registration.getters.indigenousTypesItems(this.person.indigenousProvince);
    },

    indigenousCommunitiesItems(): Record<string, string>[] {
      return this.$storage.registration.getters.indigenousCommunitiesItems(this.person.indigenousProvince, this.person.indigenousType);
    },

    loadingIndigenousIdentities(): boolean {
      return this.$store.state.registration.loadingIndigenousIdentities;
    },

  },

  methods: {
    async onIndigenousProvinceChange(provinceCode: ECanadaProvinces) {
      await this.$storage.registration.actions.fetchIndigenousIdentitiesByProvince(provinceCode);
    },

    setIdentity(form: IPerson) {
      this.$storage.beneficiary.mutations.setIdentity(form);
    },

    setIndigenousIdentity(form: IPerson) {
      this.$storage.beneficiary.mutations.setIndigenousIdentity(form);
    },

    setContactInformation(form: IContactInformation) {
      this.$storage.beneficiary.mutations.setContactInformation(form);
    },
  },
});
