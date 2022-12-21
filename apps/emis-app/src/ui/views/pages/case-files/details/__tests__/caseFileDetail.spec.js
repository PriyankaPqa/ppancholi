import { mockStorage } from '@/storage';
import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { EEventStatus } from '@libs/entities-lib/event';
import { useMockEventStore } from '@/pinia/event/event.mock';
import caseFileDetail from '../caseFileDetail';

const storage = mockStorage();

const Component = {
  render() {},
  mixins: [caseFileDetail],
};

const localVue = createLocalVue();
let wrapper;

const { pinia, eventStore } = useMockEventStore();

describe('caseFileDetail mixin', () => {
  const mountWrapper = async (fullMount = false, level = 5, additionalOverwrites = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      pinia,
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
        expect(eventStore.getById).toHaveBeenCalledWith(wrapper.vm.caseFile.entity.eventId);
        expect(JSON.stringify(ev)).toBe(JSON.stringify(eventStore.getById()));
      });
    });

    describe('readonly', () => {
      it('returns false if case file is not readonly and event status is active', () => {
        const cf = wrapper.vm.caseFile;
        const ev = wrapper.vm.event;
        cf.readonly = false;
        ev.schedule.status = EEventStatus.Open;
        expect(wrapper.vm.readonly).toBeFalsy();
      });
      it('returns true if case file is readonly', () => {
        const cf = wrapper.vm.caseFile;
        const ev = wrapper.vm.event;
        cf.readonly = true;
        ev.schedule.status = EEventStatus.Open;
        expect(wrapper.vm.readonly).toBeTruthy();
      });
      it('returns true if event status is not active', () => {
        const cf = wrapper.vm.caseFile;
        const ev = wrapper.vm.event;
        cf.readonly = false;
        ev.schedule.status = EEventStatus.OnHold;
        expect(wrapper.vm.readonly).toBeTruthy();
      });
      it('returns false if level 6', async () => {
        await mountWrapper(false, 6);
        const cf = wrapper.vm.caseFile;
        const ev = wrapper.vm.event;
        cf.readonly = true;
        ev.schedule.status = EEventStatus.OnHold;
        expect(wrapper.vm.readonly).toBeFalsy();
      });
    });
  });
});
