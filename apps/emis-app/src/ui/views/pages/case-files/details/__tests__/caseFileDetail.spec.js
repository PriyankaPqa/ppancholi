import { mockStorage } from '@/store/storage';
import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { EEventStatus } from '@libs/entities-lib/event';
import caseFileDetail from '../caseFileDetail';

const storage = mockStorage();

const Component = {
  render() {},
  mixins: [caseFileDetail],
};

const localVue = createLocalVue();
let wrapper;

describe('caseFileDetail mixin', () => {
  const mountWrapper = async (fullMount = false, level = 5, additionalOverwrites = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      propsData: {
        id: 'id',
      },
      mocks: {
        $hasLevel: (lvl) => lvl <= `level${level}`,
        $storage: storage,
      },
      ...additionalOverwrites,
    });
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    await mountWrapper();
  });

  describe('Computed', () => {
    describe('caseFileId', () => {
      it('returns the id', () => {
        expect(wrapper.vm.caseFileId).toBe('id');
      });
    });

    describe('caseFile', () => {
      it('returns the case file from getter', () => {
        const cf = wrapper.vm.caseFile;
        expect(storage.caseFile.getters.get).toHaveBeenCalledWith('id');
        expect(cf).toBe(storage.caseFile.getters.get());
      });
    });

    describe('event', () => {
      it('returns the event from getter', () => {
        const ev = wrapper.vm.event;
        expect(storage.event.getters.get).toHaveBeenCalledWith(wrapper.vm.caseFile.entity.eventId);
        expect(ev).toBe(storage.event.getters.get());
      });
    });

    describe('readonly', () => {
      it('returns false if case file is not readonly and event status is active', () => {
        const cf = wrapper.vm.caseFile;
        const ev = wrapper.vm.event;
        cf.readonly = false;
        ev.entity.schedule.status = EEventStatus.Open;
        expect(wrapper.vm.readonly).toBeFalsy();
      });
      it('returns true if case file is readonly', () => {
        const cf = wrapper.vm.caseFile;
        const ev = wrapper.vm.event;
        cf.readonly = true;
        ev.entity.schedule.status = EEventStatus.Open;
        expect(wrapper.vm.readonly).toBeTruthy();
      });
      it('returns true if event status is not active', () => {
        const cf = wrapper.vm.caseFile;
        const ev = wrapper.vm.event;
        cf.readonly = false;
        ev.entity.schedule.status = EEventStatus.OnHold;
        expect(wrapper.vm.readonly).toBeTruthy();
      });
      it('returns false if level 6', async () => {
        await mountWrapper(false, 6);
        const cf = wrapper.vm.caseFile;
        const ev = wrapper.vm.event;
        cf.readonly = true;
        ev.entity.schedule.status = EEventStatus.OnHold;
        expect(wrapper.vm.readonly).toBeFalsy();
      });
    });
  });
});
