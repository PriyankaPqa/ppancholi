import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockCaseFileActivities, CaseFileActivityType } from '@libs/entities-lib/case-file';
import routes from '@/constants/routes';
import Component from '../case-file-activity/components/CaseFileActivityPaymentMoved.vue';

const localVue = createLocalVue();
const item = mockCaseFileActivities(CaseFileActivityType.PaymentMoved)[0];
const itemAllLines = mockCaseFileActivities(CaseFileActivityType.PaymentMoved)[1];

describe('CaseFileActivityPaymentMoved.vue', () => {
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
            return item.details;
          },
        } });

        const element = wrapper.findDataTest('caseFileActivity-listItem-content-title');
        expect(element.exists()).toBe(true);
      });
    });

    describe('body', () => {
      it('renders', async () => {
        await doMount({ computed: {
          itemData() {
            return item.details;
          },
        } });

        const element = wrapper.findDataTest('caseFileActivity-listItem-content-body');
        expect(element.exists()).toBe(true);
      });

      it('renders the right body start when some lines are moved', async () => {
        await doMount({ computed: {
          itemData() {
            return item.details;
          },
        } });

        const element = wrapper.findDataTest('caseFileActivity-listItem-content-body-start');
        expect(element.text()).toContain('caseFileActivity.activityList.body.PaymentMoved.SomeLines');
      });

      it('renders the right body start when all lines are moved', async () => {
        jest.clearAllMocks();
        wrapper = await shallowMount(Component, {
          localVue,
          propsData: {
            item: itemAllLines,
          },
          computed: {
            itemData() {
              return itemAllLines.details;
            },
          },
        });

        const element = wrapper.findDataTest('caseFileActivity-listItem-content-body-start');
        expect(element.text()).toContain('caseFileActivity.activityList.body.PaymentMoved.AllLines');
      });

      it('contains the previous case file number', async () => {
        await doMount({ computed: {
          itemData() {
            return item.details;
          },
        } });

        const element = wrapper.findDataTest(`caseFileActivity-listItem-content-body-previous-case-file-number-${item.details.previousCaseFileNumber}`);
        expect(element.text()).toContain(item.details.previousCaseFileNumber);
      });

      it('contains the new case file number', async () => {
        await doMount({ computed: {
          itemData() {
            return item.details;
          },
        } });

        const element = wrapper.findDataTest(`caseFileActivity-listItem-content-body-new-case-file-number-${item.details.newCaseFileNumber}`);
        expect(element.text()).toContain(item.details.newCaseFileNumber);
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

    describe('bodyText', () => {
      it('returns the correct data when some lines are moved', async () => {
        await doMount();

        const body = wrapper.vm.$t('caseFileActivity.activityList.body.PaymentMoved.SomeLines', { x: 2, y: 'moved payment' });

        expect(wrapper.vm.bodyText).toEqual(body);
      });

      it('returns the correct data when all lines are moved', async () => {
        jest.clearAllMocks();
        wrapper = await shallowMount(Component, {
          localVue,
          propsData: {
            item: itemAllLines,
          },
          computed: {
            itemData() {
              return itemAllLines.details;
            },
          },
        });

        const body = wrapper.vm.$t('caseFileActivity.activityList.body.PaymentMoved.AllLines', { x: -1, y: 'moved payment' });

        expect(wrapper.vm.bodyText).toEqual(body);
      });
    });
  });

  describe('Methods', () => {
    describe('getCaseFileRoutePreviousCaseFile', () => {
      it('should return the right route data', async () => {
        await doMount();

        expect(wrapper.vm.getCaseFileRoutePreviousCaseFile()).toEqual({
          name: routes.caseFile.details.name,
          params: { id: item.details.previousCaseFileId },
        });
      });
    });

    describe('getCaseFileRouteNewCaseFile', () => {
      it('should return the right route data', async () => {
        await doMount();

        expect(wrapper.vm.getCaseFileRouteNewCaseFile()).toEqual({
          name: routes.caseFile.details.name,
          params: { id: item.details.newCaseFileId },
        });
      });
    });
  });
});
