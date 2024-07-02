import { CaseFileStatus, mockCaseFileEntity } from '@libs/entities-lib/case-file';
import { shallowMount, mount, createLocalVue } from '@/test/testSetup';
import { mockProvider } from '@/services/provider';
import { useMockCaseFileIndividualStore } from '@/pinia/case-file-individual/case-file-individual.mock';
import { useMockPersonStore } from '@/pinia/person/person.mock';
import { mockCaseFileIndividualEntities } from '@libs/entities-lib/case-file-individual';
import Component from '../case-file-impacted-individualsV2/ImpactedIndividualsV2.vue';

const localVue = createLocalVue();
const services = mockProvider();
let caseFile = mockCaseFileEntity({ id: 'test-id-01' });

const { personStore, pinia } = useMockPersonStore();
const { caseFileIndividualStore } = useMockCaseFileIndividualStore(pinia);

describe('ImpactedIndividualsV2.vue', () => {
  let wrapper;
  const doMount = async (fullMount = false, level = 5, additionalOverwrites = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      pinia,
      propsData: {
        id: 'cf-id',
      },
      computed: {
        caseFile() {
          return caseFile;
        },
      },
      mocks: {
        $services: services,
        $hasLevel: (lvl) => lvl <= `level${level}`,
      },
      ...additionalOverwrites,
    });

    await wrapper.vm.$nextTick();
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    await doMount();
  });

  describe('lifecycle', () => {
    describe('created', () => {
      it('should fetch and load data', async () => {
        expect(caseFileIndividualStore.fetchAll).toHaveBeenCalledWith({ caseFileId: 'cf-id' });
        expect(personStore.fetchByIds).toHaveBeenCalledWith(['pid-1', 'pid-2', 'pid-3'], true);
      });
    });
  });

  describe('computed', () => {
    describe('disableEditingByStatus', () => {
      it('should be true when case file status is closed or archived or inactive', async () => {
        caseFile = mockCaseFileEntity({ caseFileStatus: CaseFileStatus.Closed });
        await doMount();
        expect(wrapper.vm.disableEditingByStatus).toEqual(true);

        caseFile = mockCaseFileEntity({ caseFileStatus: CaseFileStatus.Archived });
        await doMount();
        expect(wrapper.vm.disableEditingByStatus).toEqual(true);

        caseFile = mockCaseFileEntity({ caseFileStatus: CaseFileStatus.Inactive });
        await doMount();
        expect(wrapper.vm.disableEditingByStatus).toEqual(true);

        caseFile = mockCaseFileEntity({ caseFileStatus: CaseFileStatus.Open });
        await doMount();
        expect(wrapper.vm.disableEditingByStatus).toEqual(false);
      });
    });

    describe('individuals', () => {
      it('returns the right data int the right order (membership status)', () => {
        const cfi = mockCaseFileIndividualEntities();
        expect(wrapper.vm.individuals).toEqual([cfi[0], cfi[2], cfi[1]]);
      });
    });
  });
});
