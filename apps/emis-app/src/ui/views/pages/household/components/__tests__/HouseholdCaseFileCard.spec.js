import { mockHouseholdMetadata } from '@libs/entities-lib/household';
import { mockEventMainInfo } from '@libs/entities-lib/event';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import routes from '@/constants/routes';

import Component from '../HouseholdCaseFileCard.vue';

const localVue = createLocalVue();
const caseFile = mockHouseholdMetadata().caseFiles[0];
const events = [
  mockEventMainInfo({
    id: caseFile.eventId,
  }),
  mockEventMainInfo({
    id: '2',
  })];
const allEventNames = { };
allEventNames[events[0].entity.id] = events[0].entity.name;
allEventNames[events[1].entity.id] = events[1].entity.name;

describe('HouseholdCaseFileCard.vue', () => {
  let wrapper;

  const doMount = (isActive = false, hasAccessToEvent = true) => {
    const options = {
      localVue,
      propsData: {
        caseFile,
        isActive,
        eventNames: allEventNames,
      },
      computed: {
        hasAccessToEvent() {
          return hasAccessToEvent;
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

        expect(span.text()).toContain(wrapper.vm.eventName.translation.en);
      });
    });

    describe('case file number', () => {
      it('renders as span element when isActive is false', () => {
        doMount(false);
        const span = wrapper.find("span[data-test='household_profile_case_file_number']");

        expect(span.exists()).toBeTruthy();
      });

      it('renders as an anchor element when isActive is true and hasAccessToEvent is true', () => {
        doMount(true, true);
        const a = wrapper.find("a[data-test='household_profile_case_file_number']");
        expect(a.exists()).toBeTruthy();
      });

      it('renders as a span when isActive is true and hasAccessToEvent is false', () => {
        doMount(true, false);
        const span = wrapper.find("span[data-test='household_profile_case_file_number']");
        expect(span.exists()).toBeTruthy();
      });

      it('displays the number of the case file', () => {
        doMount(false);
        const span = wrapper.find("span[data-test='household_profile_case_file_number']");
        expect(span.text()).toContain(wrapper.vm.caseFile.caseFileNumber);
      });

      it('displays a cancel icon when isActive is true and hasAccessToEvent is false ', () => {
        doMount(true, false);
        const icon = wrapper.findDataTest('household-profile-no-access-icon');
        expect(icon.exists()).toBeTruthy();
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
        expect(element.text()).toContain('Feb 2, 2021');
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
            id: wrapper.vm.caseFile.caseFileId,
          },
        });
      });
    });

    describe('hasAccessToEvent', () => {
      it('returns true if the event of the case file is among the events in myEvents', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            isActive: true,
            caseFile: { eventId: 'id-1' },
            myEvents: [{ entity: { id: 'id-1' } }, { entity: { id: 'id-2' } }],
          },
        });

        expect(wrapper.vm.hasAccessToEvent).toBeTruthy();
      });

      it('returns false if the event of the case file is not among the events in myEvents', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            isActive: true,
            caseFile: { eventId: 'foo' },
            myEvents: [{ entity: { id: 'id-1' } }, { entity: { id: 'id-2' } }],
          },
        });

        expect(wrapper.vm.hasAccessToEvent).toBeFalsy();
      });
    });

    describe('eventName', () => {
      it('returns the event name for the case file', () => {
        doMount();
        expect(wrapper.vm.eventName).toEqual(events[0].entity.name);
      });
    });
  });
});
