import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockProvider } from '@/services/provider';
import { useMockCaseFileStore } from '@/pinia/case-file/case-file.mock';
import caseFileActivity from '@/ui/mixins/caseFileActivity';

const Component = {
  render() {},
  mixins: [caseFileActivity],
};

const localVue = createLocalVue();
const services = mockProvider();
const { pinia, caseFileStore } = useMockCaseFileStore();

describe('caseFileActivity', () => {
  let wrapper;
  beforeEach(async () => {
    jest.clearAllMocks();
    wrapper = shallowMount(Component, {
      localVue,
      pinia,
      propsData: {
        id: 'id-1',
      },
      mocks: {
        $services: services,
      },
    });
  });
  describe('methods', () => {
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
