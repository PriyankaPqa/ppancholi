import { createLocalVue, shallowMount } from '@/test/testSetup';
import {
  mockCombinedCaseFile, mockCaseFileEntity, mockCaseFileMetadata, CaseFileStatus,
} from '@/entities/case-file';
import routes from '@/constants/routes';

import Component from '../HouseholdCaseFileCard.vue';

const localVue = createLocalVue();
const caseFile = mockCombinedCaseFile();

describe('HouseholdCaseFileCard.vue', () => {
  let wrapper;

  const doMount = (isActive = false) => {
    const options = {
      localVue,
      propsData: {
        caseFile,
      },
      computed: {
        isActive() {
          return isActive;
        },
      },
    };
    wrapper = shallowMount(Component, options);
  };

  describe('Template', () => {
    describe('event name', () => {
      it('renders as span element when isActive is true', () => {
        doMount(true);
        const span = wrapper.find("span[data-test='household_profile_case_file_event_name']");

        expect(span.exists()).toBeTruthy();
      });

      it('renders as button element when isActive is true', () => {
        doMount(false);
        const button = wrapper.find("button[data-test='household_profile_case_file_event_name']");
        expect(button.exists()).toBeTruthy();
      });

      it('displays the name of the event', () => {
        doMount(true);
        const span = wrapper.find("span[data-test='household_profile_case_file_event_name']");
        expect(span.text()).toContain(wrapper.vm.caseFile.metadata.event.name.translation.en);
      });
    });

    describe('case file number', () => {
      it('renders as span element when isActive is false', () => {
        doMount(false);
        const span = wrapper.find("span[data-test='household_profile_case_file_number']");

        expect(span.exists()).toBeTruthy();
      });

      it('renders as an anchor element when isActive is true', () => {
        doMount(true);
        const a = wrapper.find("a[data-test='household_profile_case_file_number']");
        expect(a.exists()).toBeTruthy();
      });

      it('displays the number of the case file', () => {
        doMount(false);
        const span = wrapper.find("span[data-test='household_profile_case_file_number']");
        expect(span.text()).toContain(wrapper.vm.caseFile.entity.caseFileNumber);
      });
    });
    describe('registered date', () => {
      let element;
      beforeEach(() => {
        doMount(false);
        element = wrapper.findDataTest('household_profile_case_file_registered_date');
      });
      it('renders', () => {
        expect(element.exists()).toBeTruthy();
      });

      it('displays the creation date of the case file', () => {
        expect(element.text()).toContain('Apr 6, 2021');
      });
    });
  });

  describe('Computed', () => {
    describe('caseFileRoute', () => {
      it('returns the right route', () => {
        doMount();
        expect(wrapper.vm.caseFileRoute).toEqual({
          name: routes.caseFile.activity.name,
          params: {
            id: wrapper.vm.caseFile.entity.id,
          },
        });
      });
    });

    describe('isActive', () => {
      it('returns true if case file is open', () => {
        const altCaseFile = {
          entity: mockCaseFileEntity({ caseFileStatus: CaseFileStatus.Open }),
          metadata: mockCaseFileMetadata(),
        };

        const wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            caseFile: altCaseFile,
          },
        });
        expect(wrapper.vm.isActive).toBeTruthy();
      });

      it('returns false if case file is not open', () => {
        const altCaseFile = {
          entity: mockCaseFileEntity({ caseFileStatus: CaseFileStatus.Closed }),
          metadata: mockCaseFileMetadata(),
        };

        const wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            caseFile: altCaseFile,
          },
        });
        expect(wrapper.vm.isActive).toBeFalsy();
      });
    });
  });
});
