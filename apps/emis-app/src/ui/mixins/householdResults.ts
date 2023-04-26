// Mixin used for household results in registration (EMIS) and household profile move

import Vue from 'vue';
import _orderBy from 'lodash/orderBy';
import { HouseholdStatus, IHouseholdCombined } from '@libs/entities-lib/household/index';
import { IPhoneNumber } from '@libs/entities-lib/value-objects/contact-information/index';
import moment from 'moment';
import routes from '@/constants/routes';

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
  householdStatus?: HouseholdStatus;
}

export interface IFormattedHousehold {
  id: string;
  primaryBeneficiary: IMember;
  additionalMembers: IMember[];
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
      sortDesc: false,
    };
  },

  computed: {
    formattedItems(): IFormattedHousehold[] {
      const items = this.items.map((household: IHouseholdCombined) => {
        const final = {
          primaryBeneficiary: {},
          additionalMembers: [],
          id: household.entity.id,
        } as IFormattedHousehold;

        household.metadata.memberMetadata.forEach((member) => {
          if (household.entity.primaryBeneficiary === member.id) {
            final.primaryBeneficiary = {
              ...member,
              isPrimary: true,
              registrationNumber: household.entity.registrationNumber,
              householdStatus: household.entity.householdStatus,
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

      const direction = this.sortDesc ? 'desc' : 'asc';

      return _orderBy(items, [(user) => user.primaryBeneficiary.firstName?.toLowerCase()], direction);
    },
  },

  methods: {
    getPhone(household: IFormattedHousehold): string {
      const mPhone = household.primaryBeneficiary.mobilePhoneNumber;
      if (mPhone) {
        return mPhone.number;
      }
      const hPhone = household.primaryBeneficiary.homePhoneNumber;
      if (hPhone) {
        return hPhone.number;
      }
      const oPhone = household.primaryBeneficiary.alternatePhoneNumber;
      if (oPhone) {
        return oPhone.number;
      }
      return '';
    },

    getHouseholdRoute(household: IFormattedHousehold) {
      return {
        name: routes.household.householdProfile.name,
        params: {
          id: household.id,
        },
      };
    },
  },
});
