// Mixin used for household results in registration (EMIS) and household profile move

import Vue from 'vue';
import { IHouseholdCombined } from '@crctech/registration-lib/src/entities/household/index';
import { IPhoneNumber } from '@crctech/registration-lib/src/entities/value-objects/contact-information/index';
import moment from 'moment';

export interface IMember {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email?: string;
  homePhoneNumber?: IPhoneNumber;
  mobilePhoneNumber?: IPhoneNumber;
  alternatePhoneNumber?: IPhoneNumber;
  isPrimary: boolean;
  registrationNumber: string;
}

export interface IFormattedHousehold {
  id: string;
  primaryBeneficiary: IMember;
  additionalMembers: IMember[];
  eventIds: string[];
}

export default Vue.extend({

  props: {
    items: {
      type: Array as () => IHouseholdCombined[],
      required: true,
    },
  },

  data() {
    return {
      moment,
    };
  },

  computed: {
    formattedItems(): IFormattedHousehold[] {
      return this.items.map((household: IHouseholdCombined) => {
        const final = {
          primaryBeneficiary: {},
          additionalMembers: [],
          id: household.entity.id,
          eventIds: household.metadata.eventIds,
        } as IFormattedHousehold;

        household.metadata.memberMetadata.forEach((member) => {
          if (household.entity.primaryBeneficiary === member.id) {
            final.primaryBeneficiary = {
              ...member,
              isPrimary: true,
              registrationNumber: household.entity.registrationNumber,
            };
          } else {
            final.additionalMembers.push({
              ...member,
              isPrimary: false,
              registrationNumber: household.entity.registrationNumber,
            });
          }
        });
        return final;
      });
    },
  },

  methods: {
    getPhone(household: IFormattedHousehold): string {
      const mPhone = household.primaryBeneficiary.mobilePhoneNumber;
      if (mPhone) return mPhone.number;
      const hPhone = household.primaryBeneficiary.homePhoneNumber;
      if (hPhone) return hPhone.number;
      const oPhone = household.primaryBeneficiary.alternatePhoneNumber;
      if (oPhone) return oPhone.number;
      return '';
    },
  },
});
