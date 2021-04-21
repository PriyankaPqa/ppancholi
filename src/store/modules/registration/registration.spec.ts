import { Store } from 'vuex';
import { mockStore, IRootState } from '@/store';
import { ECanadaProvinces, ILeftMenuItem } from '@/types';
import { Event, mockEventsData } from '../../../entities/event';
import {
  EIndigenousTypes,
  mockGenders,
  mockIndigenousCommunitiesItems,
  mockIndigenousIdentitiesSearchData,
  mockIndigenousTypesItems,
  mockPreferredLanguages,
  mockPrimarySpokenLanguages,
  mockBeneficiary,
  Beneficiary
} from '../../../entities/beneficiary';
import { tabs } from './tabs';

describe('>>> Registration Module', () => {
  let store: Store<IRootState>;
  const mockEventData = mockEventsData().value[0];

  beforeEach(() => {
    store = mockStore();
  });

  describe('>> Getters', () => {
    describe('event', () => {
      it('returns a default event', () => {
        expect(store.getters['registration/event']).toEqual(new Event());
      });
    });

    describe('isLeftMenuOpen', () => {
      it('returns left menu status', () => {
        expect(store.getters['registration/isLeftMenuOpen']).toBeTruthy();
      });
    });

    describe('tabs', () => {
      it('returns tabs', () => {
        expect(store.getters['registration/tabs']).toEqual(tabs);
      });
    });

    describe('currentTabIndex', () => {
      it('returns current tab index', () => {
        expect(store.getters['registration/currentTabIndex']).toEqual(0);
      });
    });

    describe('currentTab', () => {
      it('returns current tab', () => {
        expect(store.getters['registration/currentTab']).toEqual(tabs[0]);
      });
    });

    describe('previousTabName', () => {
      it('returns previousTabName', () => {
        expect(store.getters['registration/previousTabName']).toEqual('registration.privacy_statement.start_registration');
      });
    });

    describe('nextTabName', () => {
      it('returns nextTabName', () => {
        expect(store.getters['registration/nextTabName']).toEqual(tabs[1].titleKey);
      });
    });

    describe('genders', () => {
      it('returns genders', () => {
        expect(store.getters['registration/genders']).toEqual([]);

        store.state.registration.genders = mockGenders();
        expect(store.getters['registration/genders']).toEqual(mockGenders());
      });
    });

    describe('preferredLanguages', () => {
      it('returns preferredLanguages', () => {
        expect(store.getters['registration/preferredLanguages']).toEqual([]);

        store.state.registration.preferredLanguages = mockPreferredLanguages();
        expect(store.getters['registration/preferredLanguages']).toEqual(mockPreferredLanguages());
      });
    });

    describe('primarySpokenLanguages', () => {
      it('returns primarySpokenLanguages', () => {
        expect(store.getters['registration/primarySpokenLanguages']).toEqual([]);

        store.state.registration.primarySpokenLanguages = mockPrimarySpokenLanguages();
        expect(store.getters['registration/primarySpokenLanguages']).toEqual(mockPrimarySpokenLanguages());
      });
    });

    describe('indigenousTypesItems', () => {
      it('returns indigenousTypesItems', () => {
        store.state.registration.indigenousIdentities[ECanadaProvinces.AB] = mockIndigenousIdentitiesSearchData().value;
        expect(store.getters['registration/indigenousTypesItems'](ECanadaProvinces.AB))
          .toEqual(mockIndigenousTypesItems());
      });
    });

    describe('indigenousCommunitiesItems', () => {
      it('returns indigenousCommunitiesItems', () => {
        store.state.registration.indigenousIdentities[ECanadaProvinces.AB] = mockIndigenousIdentitiesSearchData().value;
        expect(store.getters['registration/indigenousCommunitiesItems'](ECanadaProvinces.AB, EIndigenousTypes.FirstNations))
          .toEqual(mockIndigenousCommunitiesItems());
      });
    });

    describe('findEffectiveJumpIndex', () => {
      beforeEach(() => {
        store.getters.beneficiary = mockBeneficiary();
        store.getters['registration/beneficiary'].booleanContactInformationAndIdentityIsValid = jest.fn(() => false);
        store.getters['registration/beneficiary'].booleanAddressesIsValid = jest.fn(() => false);
        store.getters['registration/beneficiary'].booleanHouseholdMembersIsValid = jest.fn(() => false);
      });

      it('returns the target index when moving backwards', async () => {
        store.state.registration.currentTabIndex = 2;
        store.getters.beneficiary.noFixedHome = false;
        expect(store.getters['registration/findEffectiveJumpIndex'](1)).toEqual(1);
        expect(store.getters['registration/findEffectiveJumpIndex'](0)).toEqual(0);
      });

      it('returns the current index when no change', async () => {
        store.getters.beneficiary.noFixedHome = false;
        expect(store.getters['registration/findEffectiveJumpIndex'](0)).toEqual(0);
      });

      it('stops on the invalid PrivacyStatement form', async () => {
        store.getters.beneficiary.noFixedHome = false;
        expect(store.getters['registration/findEffectiveJumpIndex'](6)).toEqual(0);
      });

      it('stops on the invalid PersonalInformation form', async () => {
        store.state.registration.isPrivacyAgreed = true;
        store.getters.beneficiary.noFixedHome = false;

        expect(store.getters['registration/findEffectiveJumpIndex'](6)).toEqual(1);
      });

      it('stops on the invalid Addresses form', async () => {
        store.state.registration.isPrivacyAgreed = true;
        store.getters.beneficiary.noFixedHome = false;

        store.getters['registration/beneficiary'].booleanContactInformationAndIdentityIsValid = jest.fn(() => true);

        expect(store.getters['registration/findEffectiveJumpIndex'](6)).toEqual(2);
      });

      it('stops on the invalid Household Members form', async () => {
        store.state.registration.isPrivacyAgreed = true;
        store.getters.beneficiary.noFixedHome = false;

        store.getters['registration/beneficiary'].booleanContactInformationAndIdentityIsValid = jest.fn(() => true);
        store.getters['registration/beneficiary'].booleanAddressesIsValid = jest.fn(() => true);

        expect(store.getters['registration/findEffectiveJumpIndex'](6)).toEqual(3);
      });

      it('returns target index when all forms valid', async () => {
        store.state.registration.isPrivacyAgreed = true;
        store.getters.beneficiary.noFixedHome = false;

        store.getters['registration/beneficiary'].booleanContactInformationAndIdentityIsValid = jest.fn(() => true);
        store.getters['registration/beneficiary'].booleanAddressesIsValid = jest.fn(() => true);
        store.getters['registration/beneficiary'].booleanHouseholdMembersIsValid = jest.fn(() => true);

        expect(store.getters['registration/findEffectiveJumpIndex'](6)).toEqual(6);
      });
    });
  });

  describe('>> Mutations', () => {
    describe('setEvent', () => {
      it('sets the event', () => {
        expect(store.getters['registration/event']).toEqual(new Event());

        store.commit('registration/setEvent', mockEventData);

        expect(store.state.registration.event).toEqual(mockEventData);
      });
    });

    describe('toggleLeftMenu', () => {
      it('updates left menu status', () => {
        expect(store.getters['registration/isLeftMenuOpen']).toBeTruthy();

        store.commit('registration/toggleLeftMenu', false);

        expect(store.getters['registration/isLeftMenuOpen']).toBeFalsy();
      });
    });

    describe('setCurrentTabIndex', () => {
      it('updates the index of current tab', () => {
        expect(store.getters['registration/currentTabIndex']).toBe(0);

        const toIndex = 2;

        store.commit('registration/setCurrentTabIndex', toIndex);

        expect(store.getters['registration/currentTabIndex']).toBe(toIndex);
      });
    });

    describe('mutateCurrentTab', () => {
      it('mutates current tab', () => {
        expect(store.getters['registration/currentTab'].isValid).toBeTruthy();

        store.commit('registration/mutateCurrentTab', (tab: ILeftMenuItem) => {
          tab.isValid = false;
        });

        expect(store.getters['registration/currentTab'].isValid).toBeFalsy();
      });
    });

    describe('jump', () => {
      it('set current tab to be touched', async () => {
        const currentIndex = 0;
        const toIndex = 2;

        expect(store.getters['registration/tabs'][currentIndex].isTouched).toBeFalsy();

        await store.commit('registration/jump', toIndex);

        expect(store.getters['registration/tabs'][currentIndex].isTouched).toBeTruthy();
      });

      it('update the index of current tab', async () => {
        expect(store.getters['registration/currentTabIndex']).toEqual(0);

        const toIndex = 2;

        await store.commit('registration/jump', toIndex);

        expect(store.getters['registration/currentTabIndex']).toEqual(toIndex);
      });

      it('if target index is out of array bounds, stay at current tab', async () => {
        expect(store.getters['registration/currentTabIndex']).toEqual(0);

        let toIndex = -1;
        await store.commit('registration/jump', toIndex);
        expect(store.getters['registration/currentTabIndex']).toEqual(0);

        toIndex = 10;
        await store.commit('registration/jump', toIndex);
        expect(store.getters['registration/currentTabIndex']).toEqual(0);

        toIndex = tabs.length;
        await store.commit('registration/jump', toIndex);
        expect(store.getters['registration/currentTabIndex']).toEqual(0);
      });
    });
  });

  describe('>> Actions', () => {
    describe('fetchEvent', () => {
      it('calls the getEvent service', async () => {
        expect(store.$services.events.searchEvents).toHaveBeenCalledTimes(0);

        await store.dispatch('registration/fetchEvent', { lang: 'en', registrationLink: 'link' });

        expect(store.$services.events.searchEvents).toHaveBeenCalledTimes(1);
      });

      it('maps IEventData to IEvent, and sets the event', async () => {
        expect(store.getters['registration/event']).toEqual(new Event());

        await store.dispatch('registration/fetchEvent', {});

        expect(store.getters['registration/event']).toEqual(new Event(mockEventData));
      });
    });

    describe('fetchGenders', () => {
      it('call the getGenders service', async () => {
        await store.dispatch('registration/fetchGenders');

        expect(store.$services.beneficiaries.getGenders).toHaveBeenCalledTimes(1);
      });

      it('sets the genders', async () => {
        expect(store.getters['registration/genders']).toEqual([]);

        await store.dispatch('registration/fetchGenders');

        expect(store.state.registration.genders).toEqual(mockGenders());
      });
    });

    describe('fetchPreferredLanguages', () => {
      it('call the getPreferredLanguages service', async () => {
        await store.dispatch('registration/fetchPreferredLanguages');

        expect(store.$services.beneficiaries.getPreferredLanguages).toHaveBeenCalledTimes(1);
      });

      it('sets the preferredLanguages', async () => {
        expect(store.getters['registration/preferredLanguages']).toEqual([]);

        await store.dispatch('registration/fetchPreferredLanguages');

        expect(store.state.registration.preferredLanguages).toEqual(mockPreferredLanguages());
      });
    });

    describe('fetchPrimarySpokenLanguages', () => {
      it('call the getPrimaryLanguages service', async () => {
        await store.dispatch('registration/fetchPrimarySpokenLanguages');

        expect(store.$services.beneficiaries.getPrimarySpokenLanguages).toHaveBeenCalledTimes(1);
      });

      it('sets the primarySpokenLanguages', async () => {
        expect(store.getters['registration/primarySpokenLanguages']).toEqual([]);

        await store.dispatch('registration/fetchPrimarySpokenLanguages');

        expect(store.state.registration.primarySpokenLanguages).toEqual(mockPrimarySpokenLanguages());
      });
    });

    describe('fetchIndigenousIdentitiesByProvince', () => {
      it('call the searchIndigenousIdentities service with proper params', async () => {
        const provinceCode = ECanadaProvinces.BC;
        await store.commit('registration/setEvent', mockEventData);
        await store.dispatch('registration/fetchIndigenousIdentitiesByProvince', provinceCode);

        expect(store.$services.beneficiaries.searchIndigenousIdentities).toHaveBeenCalledWith({
          filter: {
            Province: provinceCode,
            TenantId: 'tenant-guid',
          },
          top: 1000,
        });
      });

      it('sets the indigenousIdentities', async () => {
        await store.commit('registration/setEvent', mockEventData);

        await store.dispatch('registration/fetchIndigenousIdentitiesByProvince', ECanadaProvinces.AB);

        expect(store.state.registration.indigenousIdentities[ECanadaProvinces.AB])
          .toEqual(mockIndigenousIdentitiesSearchData().value);
      });
    });
  });
});
