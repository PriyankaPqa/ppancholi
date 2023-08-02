import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockCaseFileActivities, CaseFileActivityType } from '@libs/entities-lib/case-file';
import { DuplicateStatus } from '@libs/entities-lib/potential-duplicate';
import routes from '@/constants/routes';
import Component from '../case-file-activity/components/CaseFileActivityDuplicateUpdated.vue';

const localVue = createLocalVue();
const item = mockCaseFileActivities(CaseFileActivityType.HouseholdPotentialDuplicateUpdated)[0];

const itemData = (duplicateStatus = DuplicateStatus.Potential) => ({ duplicateStatus,
  duplicateHouseholdRegistrationNumber: '123456',
  rationale: 'rationale',
});

describe('CaseFileActivityDuplicateUpdated.vue', () => {
  let wrapper;

  const doMount = async (otherOptions = {}) => {
    jest.clearAllMocks();
    wrapper = await shallowMount(Component, {
      localVue,
      propsData: {
        item,
      },
      ...otherOptions,
    });
  };

  describe('Template', () => {
    describe('title', () => {
      it('renders', async () => {
        await doMount({ computed: {
          itemData() {
            return itemData();
          },
        } });

        const element = wrapper.findDataTest('caseFileActivity-listItem-content-title');
        expect(element.exists()).toBe(true);
      });

      it('displays the right title if the status is Potential', async () => {
        await doMount({ computed: {
          itemData() {
            return itemData();
          },
        } });

        const element = wrapper.findDataTest('caseFileActivity-listItem-content-title');
        expect(element.text()).toContain('caseFileActivity.duplicateUpdated.title.potentialDuplicate');
      });

      it('displays the right title if the status is Resolved', async () => {
        await doMount({ computed: {
          itemData() {
            return itemData(DuplicateStatus.Resolved);
          },
        } });

        const element = wrapper.findDataTest('caseFileActivity-listItem-content-title');
        expect(element.text()).toContain('caseFileActivity.duplicateUpdated.title.resolvedDuplicate');
      });
    });

    describe('body', () => {
      it('renders', async () => {
        await doMount({ computed: {
          itemData() {
            return itemData();
          },
        } });

        const element = wrapper.findDataTest('caseFileActivity-listItem-content-body');
        expect(element.exists()).toBe(true);
      });

      it('renders the right body start when status is potential', async () => {
        await doMount({ computed: {
          itemData() {
            return itemData();
          },
        } });

        const element = wrapper.findDataTest('caseFileActivity-listItem-content-body-start');
        expect(element.text()).toContain('caseFileActivity.duplicateUpdated.bodyStart.1');
      });

      it('renders the right body start when status is resolved', async () => {
        await doMount({ computed: {
          itemData() {
            return itemData(DuplicateStatus.Resolved);
          },
        } });

        const element = wrapper.findDataTest('caseFileActivity-listItem-content-body-start');
        expect(element.text()).toContain('caseFileActivity.duplicateUpdated.bodyStart.2');
      });

      it('contains the registration number', async () => {
        await doMount({ computed: {
          itemData() {
            return itemData();
          },
        } });

        const element = wrapper.findDataTest('caseFileActivity-listItem-content-body-registration-number');
        expect(element.text()).toContain(itemData().duplicateHouseholdRegistrationNumber);
      });

      it('renders the right body end when status is potential', async () => {
        await doMount({ computed: {
          itemData() {
            return itemData();
          },
        } });

        const element = wrapper.findDataTest('caseFileActivity-listItem-content-body-end');
        expect(element.text()).toContain('caseFileActivity.duplicateUpdated.bodyEnd.1');
      });

      it('renders the right body start when status is resolved', async () => {
        await doMount({ computed: {
          itemData() {
            return itemData(DuplicateStatus.Resolved);
          },
        } });

        const element = wrapper.findDataTest('caseFileActivity-listItem-content-body-end');
        expect(element.text()).toContain('caseFileActivity.duplicateUpdated.bodyEnd.2');
      });

      it('renders the right rationale label when status is potential', async () => {
        await doMount({ computed: {
          itemData() {
            return itemData();
          },
        } });

        const element = wrapper.findDataTest('caseFileActivity-listItem-content-body-rationale');
        expect(element.text()).toContain('householdDetails.manageDuplicates.rationale');
      });

      it('renders the right rationale label when status is resolved', async () => {
        await doMount({ computed: {
          itemData() {
            return itemData(DuplicateStatus.Resolved);
          },
        } });

        const element = wrapper.findDataTest('caseFileActivity-listItem-content-body-rationale');
        expect(element.text()).toContain('householdDetails.manageDuplicates.actionTakenToResolve');
      });

      it('contains the rationale', async () => {
        await doMount({ computed: {
          itemData() {
            return itemData();
          },
        } });

        const element = wrapper.findDataTest('caseFileActivity-listItem-content-body-rationale');
        expect(element.text()).toContain(itemData().rationale);
      });
    });
  });

  describe('Computed', () => {
    describe('itemData', () => {
      it('returns the item details', async () => {
        await doMount();
        expect(wrapper.vm.itemData).toEqual(wrapper.vm.item.details);
      });
    });
  });

  describe('Methods', () => {
    describe('getHouseholdRoute', () => {
      it('should return the right route data', async () => {
        await doMount();
        const household = { id: wrapper.vm.item.details.duplicateHouseholdId };
        expect(wrapper.vm.getHouseholdRoute(household)).toEqual({
          name: routes.household.householdProfile.name,
          params: { id: household.id },
        });
      });
    });
  });
});
