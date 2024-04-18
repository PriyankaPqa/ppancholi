// Mixin used for household results in registration (EMIS) and household profile move

import Vue from 'vue';
import _orderBy from 'lodash/orderBy';
import { HouseholdStatus, IHouseholdEntity } from '@libs/entities-lib/household/index';
import routes from '@/constants/routes';
import { usePersonStore } from '@/pinia/person/person';
import { IMemberEntity } from '@libs/entities-lib/household-create';

export interface IFormattedHousehold {
  id: string;
  registrationNumber: string;
  primaryBeneficiary: IMemberEntity;
  additionalMembers: IMemberEntity[];
  householdStatus: HouseholdStatus;
}

export default Vue.extend({

  props: {
    items: {
      type: Array as () => IHouseholdEntity[],
      required: true,
    },
  },

  data() {
    return {
      sortDesc: false,
    };
  },

  computed: {
    formattedItems(): IFormattedHousehold[] {
      const items = this.items.map((household) => {
        const final = {
          primaryBeneficiary: {},
          additionalMembers: [],
          id: household.id,
          registrationNumber: household.registrationNumber,
          householdStatus: household.householdStatus,
        } as IFormattedHousehold;

        household.members.forEach((memberId) => {
          let member = usePersonStore().getById(memberId);
          if (!member.id) {
            member = { identitySet: {}, contactInformation: {} } as IMemberEntity;
          }
          if (household.primaryBeneficiary === memberId) {
            final.primaryBeneficiary = member;
          } else {
            final.additionalMembers.push(member);
          }
        });
        return final;
      });

      const direction = this.sortDesc ? 'desc' : 'asc';

      return _orderBy(items, [(user) => user.primaryBeneficiary.identitySet.firstName?.toLowerCase()], direction);
    },
  },

  watch: {
    async items() {
      // in case someone added a new person since the search to a household
      await usePersonStore().fetchByIds(this.items.flatMap((x) => x.members), true);
    },
  },

  methods: {
    getPhone(household: IFormattedHousehold): string {
      const mPhone = household.primaryBeneficiary.contactInformation.mobilePhoneNumber;
      if (mPhone) {
        return mPhone.number;
      }
      const hPhone = household.primaryBeneficiary.contactInformation.homePhoneNumber;
      if (hPhone) {
        return hPhone.number;
      }
      const oPhone = household.primaryBeneficiary.contactInformation.alternatePhoneNumber;
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
