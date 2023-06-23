import caseFileActivity from '@/ui/mixins/caseFileActivity';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockCaseFileActivities } from '@libs/entities-lib/case-file';
import { useMockCaseFileStore } from '@/pinia/case-file/case-file.mock';
import { mockProvider } from '@/services/provider';

const Component = {
  render() {},
  mixins: [caseFileActivity],
};

const { pinia, caseFileStore } = useMockCaseFileStore();
const localVue = createLocalVue();
const services = mockProvider();
let wrapper;

describe('caseFileActivity', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    wrapper = shallowMount(Component, {
      pinia,
      localVue,
      propsData: {
        id: 'id-1',
      },
      mocks: {
        $services: services,
      },
    });
  });

  describe('Methods', () => {
    describe('fetchCaseFileActivities', () => {
      it('calls fetchCaseFileActivities action from storage', async () => {
        jest.clearAllMocks();
        expect(caseFileStore.fetchCaseFileActivities).toHaveBeenCalledTimes(0);

        await wrapper.vm.fetchCaseFileActivities(0);

        expect(caseFileStore.fetchCaseFileActivities).toHaveBeenCalled();
      });

      it('sets the response from the storage action into caseFileActivities', async () => {
        await wrapper.vm.fetchCaseFileActivities();
        expect(wrapper.vm.caseFileActivities).toEqual(mockCaseFileActivities());
      });
    });
    describe('attachToChanges', () => {
      it('should connect on to signalr updates when true', () => {
        wrapper.vm.attachToChanges(true);
        expect(wrapper.vm.$signalR.connection.on).toHaveBeenCalledWith('case-file.CaseFileActivityCreated', wrapper.vm.activityChanged);
        expect(wrapper.vm.$signalR.connection.on).toHaveBeenCalledWith('case-file.CaseFileActivityUpdated', wrapper.vm.activityChanged);
      });
      it('should connect of to signalr updates when false', () => {
        wrapper.vm.attachToChanges(false);
        expect(wrapper.vm.$signalR.connection.off).toHaveBeenCalledWith('case-file.CaseFileActivityCreated', wrapper.vm.activityChanged);
        expect(wrapper.vm.$signalR.connection.off).toHaveBeenCalledWith('case-file.CaseFileActivityUpdated', wrapper.vm.activityChanged);
      });
    });

    describe('activityChanged', () => {
      it('calls fetchCaseFileActivities when the activity has the same case file id after debounce', async () => {
        jest.clearAllMocks();
        wrapper.vm.activityChanged({ caseFileId: 'nope' });
        // eslint-disable-next-line no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, 1500));
        expect(caseFileStore.fetchCaseFileActivities).toHaveBeenCalledTimes(0);
        wrapper.vm.activityChanged({ caseFileId: wrapper.vm.id });
        // eslint-disable-next-line no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, 1500));
        expect(caseFileStore.fetchCaseFileActivities).toHaveBeenCalled();
      });
    });
  });
});
