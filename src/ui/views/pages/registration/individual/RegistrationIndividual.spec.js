import { mockHouseholdCreateData } from '@crctech/registration-lib/src/entities/household-create';
import { createLocalVue, shallowMount } from '@/test/testSetup';

import { mockStorage } from '@/store/storage';
import routes from '@/constants/routes';
import { tabs } from '@/store/modules/registration/tabs';
import Component from './RegistrationIndividual.vue';

const localVue = createLocalVue();
const storage = mockStorage();

describe('Individual.vue', () => {
  let wrapper;
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        computed: {
          currentTab: () => ({ id: '', titleKey: '', nextButtonTextKey: '' }),
        },
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('back', () => {
      it('should return to search household page if user is seeing results', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            currentTab: () => ({ id: 'isRegistered' }),
          },
          store: {
            modules: {
              registration: {
                state: {
                  householdResultsShown: true,
                },
              },
            },
          },
          mocks: {
            $storage: storage,
          },
        });
        await wrapper.vm.back();
        expect(wrapper.vm.$storage.registration.mutations.setHouseholdResultsShown).toHaveBeenCalledWith(false);
      });

      it('should return to household results if user is seeing review of the registration in association mode', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            currentTab: () => ({ id: 'review' }),
            associationMode: () => true,
          },
        });
        wrapper.vm.backToHouseholdResults = jest.fn();
        await wrapper.vm.back();
        expect(wrapper.vm.backToHouseholdResults).toHaveBeenCalled();
      });

      it('should return to registration home page if user is at the first page of registration', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            currentTabIndex: () => 0,
          },
        });
        await wrapper.vm.back();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: routes.registration.home.name });
      });

      test('back calls jump', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            currentTabIndex: () => 1,
          },
        });
        wrapper.vm.jump = jest.fn();

        await wrapper.vm.back();

        expect(wrapper.vm.jump).toHaveBeenCalledWith(0);
      });
    });

    describe('backToHouseholdResults', () => {
      it('should call setHouseholdAssociationMode with false', () => {
        wrapper.vm.backToHouseholdResults();
        expect(wrapper.vm.$storage.registration.mutations.setHouseholdAssociationMode).toHaveBeenCalledWith(false);
      });

      it('should set current tab to isRegistered', () => {
        wrapper.vm.backToHouseholdResults();
        expect(wrapper.vm.$storage.registration.mutations.setCurrentTabIndex).toHaveBeenCalledWith(tabs().findIndex((t) => t.id === 'isRegistered'));
      });

      it('should call resetHouseholdCreate', () => {
        wrapper.vm.backToHouseholdResults();
        expect(wrapper.vm.$storage.registration.mutations.resetHouseholdCreate).toHaveBeenCalledTimes(1);
      });
    });

    describe('next', () => {
      it('calls jump', async () => {
        wrapper.vm.$storage.registration.getters.currentTab = jest.fn(() => ({ id: 'personalInfo' }));
        wrapper.vm.$storage.registration.getters.currentTabIndex = jest.fn(() => 2);
        wrapper.vm.jump = jest.fn();
        wrapper.vm.goToHouseholdProfile = jest.fn();

        await wrapper.vm.next();

        expect(wrapper.vm.jump)
          .toHaveBeenCalledWith(3);
      });

      it('calls closeRegistration if it is confirmation', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            currentTab: () => ({ id: 'confirmation', titleKey: '', nextButtonTextKey: '' }),
          },
          mocks: {
            $storage: storage,
          },
        });
        wrapper.vm.closeRegistration = jest.fn();
        wrapper.vm.jump = jest.fn();

        await wrapper.vm.next();

        expect(wrapper.vm.closeRegistration).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.jump).toHaveBeenCalledTimes(0);
      });

      describe('Review', () => {
        it('should call goToHouseholdProfile if household is already registered', async () => {
          wrapper = shallowMount(Component, {
            localVue,
            computed: {
              householdAlreadyRegistered: () => true,
              associationMode: () => true,
              currentTab: () => ({ id: 'review', titleKey: '', nextButtonTextKey: '' }),
            },
            mocks: {
              $storage: storage,
            },
          });
          wrapper.vm.$storage.registration.getters.currentTab = jest.fn(() => ({ id: 'review' }));
          wrapper.vm.goToHouseholdProfile = jest.fn();

          await wrapper.vm.next();

          expect(wrapper.vm.goToHouseholdProfile).toHaveBeenCalledTimes(1);
        });

        describe('Association mode', () => {
          it('should validate the form', async () => {
            wrapper = shallowMount(Component, {
              localVue,
              computed: {
                householdAlreadyRegistered: () => false,
                associationMode: () => true,
                currentTab: () => ({ id: 'review', titleKey: '', nextButtonTextKey: '' }),
              },
              mocks: {
                $storage: storage,
              },
            });
            wrapper.vm.$refs.form.validate = jest.fn(() => true);
            wrapper.vm.jump = jest.fn();
            wrapper.vm.associateHousehold = jest.fn();

            await wrapper.vm.next();

            expect(wrapper.vm.$refs.form.validate).toBeCalled();
          });

          it('should call associateHousehold with proper param', async () => {
            wrapper = shallowMount(Component, {
              localVue,
              computed: {
                householdAlreadyRegistered: () => false,
                associationMode: () => true,
                currentTab: () => ({ id: 'review', titleKey: '', nextButtonTextKey: '' }),
              },
              mocks: {
                $storage: storage,
              },
            });
            wrapper.vm.$refs.form.validate = jest.fn(() => true);
            wrapper.vm.jump = jest.fn();
            wrapper.vm.associateHousehold = jest.fn();

            await wrapper.vm.next();

            expect(wrapper.vm.associateHousehold).toHaveBeenCalledWith(wrapper.vm.household, wrapper.vm.event);
          });

          it('should call jump if we associated', async () => {
            wrapper = shallowMount(Component, {
              localVue,
              computed: {
                householdAlreadyRegistered: () => false,
                associationMode: () => true,
                currentTab: () => ({ id: 'review', titleKey: '', nextButtonTextKey: '' }),
              },
              mocks: {
                $storage: storage,
              },
            });
            wrapper.vm.$refs.form.validate = jest.fn(() => true);
            wrapper.vm.jump = jest.fn();
            wrapper.vm.associateHousehold = jest.fn(() => true);

            await wrapper.vm.next();

            expect(wrapper.vm.jump).toHaveBeenCalledWith(wrapper.vm.currentTabIndex + 1);
          });
        });

        it('should call submit registration otherwise', async () => {
          wrapper = shallowMount(Component, {
            localVue,
            computed: {
              householdAlreadyRegistered: () => false,
              associationMode: () => false,
              currentTab: () => ({ id: 'review', titleKey: '', nextButtonTextKey: '' }),
            },
            mocks: {
              $storage: storage,
            },
          });
          wrapper.vm.jump = jest.fn();

          await wrapper.vm.next();

          expect(wrapper.vm.$storage.registration.actions.submitRegistration).toHaveBeenCalledTimes(1);
        });
      });
    });

    describe('goToHouseholdProfile', () => {
      it('should redirect to household profile page', async () => {
        const id = '1';
        await wrapper.vm.goToHouseholdProfile(id);
        expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({
          name: routes.household.householdProfile.name,
          params: {
            id,
          },
        });
      });
    });

    describe('associateHousehold', () => {
      it('should display confirmation dialog ', async () => {
        const household = mockHouseholdCreateData();
        const event = { id: '1' };
        wrapper.vm.$confirm = jest.fn(() => false);

        await wrapper.vm.associateHousehold(household, event);

        expect(wrapper.vm.$confirm).toHaveBeenCalledWith({ title: wrapper.vm.titleLeave, messages: wrapper.vm.messagesLeave });
      });
      it('should call create case file action if user confirmed', async () => {
        const household = mockHouseholdCreateData();
        const event = { id: '1' };

        await wrapper.vm.associateHousehold(household, event);

        expect(wrapper.vm.$storage.caseFile.actions.createCaseFile).toHaveBeenCalledWith({
          householdId: household.id,
          eventId: event.id,
          consentInformation: household.consentInformation,
        });
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        computed: {
          currentTab: () => ({ id: 'review', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }),
          associationMode: () => true,
        },
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('showBackButton', () => {
      it('should return the proper value', () => {
        expect(wrapper.vm.showBackButton).toEqual(true);

        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            currentTab: () => ({ id: 'confirmation', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }),
            associationMode: () => true,
          },
          mocks: {
            $storage: storage,
          },
        });

        expect(wrapper.vm.showBackButton).toEqual(false);
      });
    });

    describe('eventName', () => {
      it('should return the even name', () => {
        const event = wrapper.vm.$storage.registration.getters.event();
        expect(wrapper.vm.eventName).toEqual(wrapper.vm.$m(event.name));
      });
    });

    describe('titleLeave', () => {
      it('should return proper text for association household', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            associationMode: () => true,
            currentTab: () => ({ id: 'review', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }),
          },
          mocks: {
            $storage: storage,
          },
        });
        expect(wrapper.vm.titleLeave).toEqual('registration.associate.confirmation.title');
      });

      it('should return proper text otherwise', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            associationMode: () => false,
            currentTab: () => ({ id: 'review', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }),
          },
          mocks: {
            $storage: storage,
          },
        });
        expect(wrapper.vm.titleLeave).toEqual('confirmLeaveDialog.title');
      });
    });

    describe('messagesLeave', () => {
      it('should return proper text for association household', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            associationMode: () => true,
            currentTab: () => ({ id: 'review', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }),
          },
          mocks: {
            $storage: storage,
          },
        });
        expect(wrapper.vm.messagesLeave).toEqual([
          'registration.associate.confirmation.message1',
          'registration.associate.confirmation.message2',
        ]);
      });
      it('should return proper text otherwise', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            associationMode: () => false,
            currentTab: () => ({ id: 'review', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }),
          },
          mocks: {
            $storage: storage,
          },
        });
        expect(wrapper.vm.messagesLeave).toEqual([
          'confirmLeaveDialog.message_1',
          'confirmLeaveDialog.message_2',
        ]);
      });
    });

    describe('getTitle', () => {
      it('should return proper text if reviewing an association', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            currentTab: () => ({ id: 'review', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }),
            associationMode: () => true,
          },
        });
        expect(wrapper.vm.getTitle).toEqual('registration.details.associateBeneficiaryButton.label');
      });

      it('should return proper text otherwise', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            currentTab: () => ({ id: 'review', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }),
            associationMode: () => false,
          },
        });
        expect(wrapper.vm.getTitle).toEqual(wrapper.vm.currentTab.titleKey);
      });
    });

    describe('getNextButtonLabel', () => {
      it('should return proper text if reviewing an association', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            currentTab: () => ({ id: 'review', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }),
            associationMode: () => true,
          },
        });
        expect(wrapper.vm.getNextButtonLabel).toEqual('registration.details.associateBeneficiaryButton.label');
      });

      it('should return proper text if household is already registered', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            currentTab: () => ({ id: 'review', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }),
            associationMode: () => true,
            householdAlreadyRegistered: () => true,
          },
        });
        expect(wrapper.vm.getNextButtonLabel).toEqual('registration.associate.confirmation.next.label');
      });

      it('should return proper text otherwise', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            currentTab: () => ({ id: 'review', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }),
            associationMode: () => false,
          },
        });
        expect(wrapper.vm.getNextButtonLabel).toEqual(wrapper.vm.currentTab.nextButtonTextKey);
      });
    });
  });
});
