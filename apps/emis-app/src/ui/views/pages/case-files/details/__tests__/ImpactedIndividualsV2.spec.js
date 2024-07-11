import { CaseFileStatus, mockCaseFileEntity } from '@libs/entities-lib/case-file';
import { shallowMount, mount, createLocalVue } from '@/test/testSetup';
import { mockProvider } from '@/services/provider';
import { useMockPersonStore } from '@/pinia/person/person.mock';
import Component from '../case-file-impacted-individualsV2/ImpactedIndividualsV2.vue';

const localVue = createLocalVue();
const services = mockProvider();
let caseFile = mockCaseFileEntity({ id: 'test-id-01' });

const { pinia } = useMockPersonStore();

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
  });
});
