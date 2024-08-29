import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { EEventStatus } from '@libs/entities-lib/event';
import { useMockEventStore } from '@/pinia/event/event.mock';
import { useMockHouseholdStore } from '@/pinia/household/household.mock';
import { useMockPersonStore } from '@/pinia/person/person.mock';
import { mockCaseFileIndividualEntities } from '@libs/entities-lib/case-file-individual';
import { useMockCaseFileStore } from '@/pinia/case-file/case-file.mock';
import { CaseFileStatus, mockCaseFileEntity } from '@libs/entities-lib/case-file';
import { useMockCaseFileIndividualStore } from '@/pinia/case-file-individual/case-file-individual.mock';
import { mockMember } from '@libs/entities-lib/household-create';
import { Status } from '@libs/shared-lib/types';

import caseFileDetail from '../caseFileDetail';

const Component = {
  render() {},
  mixins: [caseFileDetail],
};

const localVue = createLocalVue();
let wrapper;

const { pinia, eventStore } = useMockEventStore();
const { caseFileStore } = useMockCaseFileStore(pinia);
const { householdStore } = useMockHouseholdStore(pinia);
const { personStore } = useMockPersonStore(pinia);
const { caseFileIndividualStore } = useMockCaseFileIndividualStore(pinia);

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
        expect(caseFileStore.getById).toHaveBeenCalledWith('id');
        expect(JSON.stringify(cf)).toBe(JSON.stringify(mockCaseFileEntity({ id: '1' })));
      });
    });

    describe('event', () => {
      it('returns the event from getter', () => {
        const ev = wrapper.vm.event;
        expect(eventStore.getById).toHaveBeenCalledWith(wrapper.vm.caseFile.eventId);
        expect(JSON.stringify(ev)).toBe(JSON.stringify(eventStore.getById()));
      });
    });

    describe('household', () => {
      it('returns the household from getter', () => {
        const ev = wrapper.vm.household;
        expect(householdStore.getById).toHaveBeenCalledWith(wrapper.vm.caseFile.householdId);
        expect(JSON.stringify(ev)).toBe(JSON.stringify(householdStore.getById()));
      });
    });

    describe('primaryMember', () => {
      it('returns the person from getter', () => {
        const ev = wrapper.vm.primaryMember;
        expect(personStore.getById).toHaveBeenCalledWith(householdStore.getById().primaryBeneficiary);
        expect(JSON.stringify(ev)).toBe(JSON.stringify(personStore.getById()));
      });
    });

    describe('individuals', () => {
      it('returns the right data int the right order (membership status)', () => {
        const cfi = mockCaseFileIndividualEntities();
        expect(wrapper.vm.individuals).toEqual([cfi[0], cfi[2], cfi[1]]);
      });
    });

    describe('activeIndividuals', () => {
      it('returns the individuals that are active and persons arent deleted', async () => {
        const cfi = mockCaseFileIndividualEntities();
        await mountWrapper(false, 5, { computed: { members() {
          return [mockMember({ id: cfi[0].personId }), mockMember({ id: cfi[1].personId }), mockMember({ id: cfi[2].personId, status: Status.Inactive })];
        } } });
        expect(wrapper.vm.activeIndividuals).toEqual([cfi[0]]);

        await mountWrapper(false, 5, { computed: { members() {
          return [mockMember({ id: cfi[0].personId }), mockMember({ id: cfi[1].personId }), mockMember({ id: cfi[2].personId })];
        } } });
        expect(wrapper.vm.activeIndividuals).toEqual([cfi[0], cfi[2]]);
      });
    });

    describe('readonly', () => {
      it('returns false if case file has a status open and event status is active', () => {
        const ev = wrapper.vm.event;
        wrapper.vm.caseFile.caseFileStatus = CaseFileStatus.Open;
        ev.schedule.status = EEventStatus.Open;
        expect(wrapper.vm.readonly).toBeFalsy();
      });
      it('returns true if case file status is different from open', () => {
        const cf = wrapper.vm.caseFile;
        const ev = wrapper.vm.event;
        cf.caseFileStatus = CaseFileStatus.Inactive;
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

  describe('Methods', () => {
    describe('loadMissingCaseFileDetails', () => {
      it('loads details from the store', async () => {
        jest.clearAllMocks();
        await wrapper.vm.loadMissingCaseFileDetails();
        expect(caseFileStore.fetchByIds).toHaveBeenCalledWith([wrapper.vm.caseFileId], true);
        expect(eventStore.fetchByIds).toHaveBeenCalledWith([wrapper.vm.caseFile.eventId], true);
        expect(householdStore.fetchByIds).toHaveBeenCalledWith([wrapper.vm.caseFile.householdId], true);
        expect(caseFileIndividualStore.fetchAll).toHaveBeenCalledWith({ caseFileId: wrapper.vm.caseFileId });
        expect(personStore.fetchByIds)
          .toHaveBeenCalledWith([wrapper.vm.household.primaryBeneficiary, ...caseFileIndividualStore.fetchAll().map((p) => p.personId)], true);
      });
    });
  });
});
