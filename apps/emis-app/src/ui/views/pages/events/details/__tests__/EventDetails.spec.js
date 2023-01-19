import _cloneDeep from 'lodash/cloneDeep';
import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { mockEventEntity, mockEventMetadata } from '@libs/entities-lib/event';
import routes from '@/constants/routes';
import helpers from '@/ui/helpers/helpers';
import { mockOptionItemData } from '@libs/entities-lib/optionItem';
import { mockStorage } from '@/storage';
import { ECanadaProvinces } from '@libs/shared-lib/types';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import flushPromises from 'flush-promises';
import { useMockEventStore } from '@/pinia/event/event.mock';
import Component from '../EventDetails.vue';

const localVue = createLocalVue();
const storage = mockStorage();
const mockEvent = mockEventEntity();

const { pinia, eventStore, eventMetadataStore } = useMockEventStore();

eventStore.getById = jest.fn(() => mockEvent);
eventMetadataStore.getById = jest.fn(() => mockEventMetadata()[0]);
describe('EventDetails.vue', () => {
  let wrapper;
  describe('Template', () => {
    const doMount = async () => {
      wrapper = mount(Component, {
        localVue,
        pinia,
        propsData: {
          id: '1dea3c36-d6a5-4e6c-ac36-078677b7da5f0',
        },
        computed: {
          eventId() {
            return '000001';
          },
          provinceName() {
            return 'Alberta';
          },
          eventTypeName() {
            return { translation: { en: 'Flood' } };
          },
          showRightMenu() {
            return true;
          },
        },
        mocks: {
          $route: {
            name: routes.events.edit.name,
            params: {
              id: '1dea3c36-d6a5-4e6c-ac36-078677b7da5f0',
            },
          },
          $storage: storage,
        },
      });
      await flushPromises();
    };
    beforeEach(async () => {
      await doMount();
    });

    describe('Rendered elements', () => {
      describe('event typename', () => {
        let element;
        beforeEach(() => {
          element = wrapper.findDataTest('event-typeName');
        });
        it('is rendered', () => {
          expect(element.exists()).toBeTruthy();
        });

        it('displays the correct data', () => {
          expect(element.text()).toEqual(wrapper.vm.eventTypeName.translation.en);
        });
      });

      describe('evenId', () => {
        let element;
        beforeEach(() => {
          element = wrapper.findDataTest('event-id');
        });
        it('is rendered', () => {
          expect(element.exists()).toBeTruthy();
        });

        it('displays the correct data', () => {
          expect(element.text()).toEqual('000001');
        });
      });

      describe('event location province', () => {
        let element;
        beforeEach(() => {
          element = wrapper.findDataTest('event-location-province');
        });
        it('is rendered', () => {
          expect(element.exists()).toBeTruthy();
        });

        it('displays the correct data', () => {
          expect(element.text()).toEqual(wrapper.vm.provinceName);
        });
      });

      describe('event location region', () => {
        let element;

        describe('if the event has a region', () => {
          const event = _cloneDeep(mockEvent);
          event.location.region = { translation: { en: 'mock region', fr: 'mock region-fr' } };
          eventStore.getById = jest.fn(() => event);

          beforeEach(async () => {
            await doMount();
          });

          it('is rendered', async () => {
            element = wrapper.findDataTest('event-location-region');
            expect(element.exists()).toBeTruthy();
          });

          it('displays the correct data when the event has a region', async () => {
            element = wrapper.findDataTest('event-location-region');
            expect(element.text()).toEqual('mock region');
          });
        });

        describe('if the event has no region', () => {
          it('does not render', () => {
            const event = mockEvent;
            event.location.region = {};
            eventStore.getById = jest.fn(() => event);
            doMount();
            element = wrapper.findDataTest('event-location-region');
            expect(element.exists()).toBeFalsy();
          });
        });
      });

      describe('expanded left menu', () => {
        it('is displayed if showExpandedLeftMenu is true', async () => {
          wrapper.vm.showExpandedLeftMenu = true;
          await wrapper.vm.$nextTick();
          const element = wrapper.findDataTest('expanded-left-menu');
          expect(element.exists()).toBeTruthy();
        });

        it('is not displayed if showExpandedLeftMenu is false', async () => {
          wrapper.vm.showExpandedLeftMenu = false;
          await wrapper.vm.$nextTick();
          const element = wrapper.findDataTest('expanded-left-menu');
          expect(element.exists()).toBeFalsy();
        });
      });

      describe('event-phone', () => {
        let element;
        beforeEach(async () => {
          wrapper.vm.showExpandedLeftMenu = true;
          await wrapper.vm.$nextTick();
          element = wrapper.findDataTest('event-phone');
        });
        it('renders', () => {
          expect(element.exists()).toBeTruthy();
        });
        it('displays the right number', () => {
          expect(element.props().value).toEqual(mockEvent.responseDetails.assistanceNumber);
        });
      });

      describe('related events', () => {
        beforeEach(async () => {
          wrapper.vm.showExpandedLeftMenu = true;
          await wrapper.vm.$nextTick();
        });

        it('renders', () => {
          const element = wrapper.findDataTest('related-event-0');
          expect(element.exists()).toBeTruthy();
        });
        it('displays the related event name', () => {
          const relatedEvent = wrapper.vm.eventMetadata.relatedEventsInfos[0];
          const element = wrapper.findDataTest('related-event-0');
          expect(element.text()).toEqual(relatedEvent.eventName.translation.en);
        });
      });

      describe('date created', () => {
        it('renders', () => {
          const element = wrapper.findDataTest('event-created-date');
          expect(element.exists()).toBeTruthy();
        });
        it('contains the correct date', () => {
          const element = wrapper.findDataTest('event-created-date');
          expect(element.text()).toEqual('2021-04-06');
        });
      });

      describe('date reported', () => {
        it('renders', () => {
          const element = wrapper.findDataTest('event-reported-date');
          expect(element.exists()).toBeTruthy();
        });
        it('contains the correct date', () => {
          const element = wrapper.findDataTest('event-reported-date');
          expect(element.text()).toEqual(helpers.getLocalStringDate(mockEvent.responseDetails.dateReported, 'EventResponseDetails.dateReported'));
        });
      });

      // TO add open, close and reopen dates tests when the business rules and dates history are done
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      eventStore.getById = jest.fn(() => mockEvent);
      eventStore.getEventTypes = jest.fn(() => mockOptionItemData());

      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        propsData: {
          id: '1dea3c36-d6a5-4e6c-ac36-078677b7da5f0',
        },
        mocks: {
          $storage: storage,
        },
      });
    });
    describe('event', () => {
      it('return the event by id from the storage', () => {
        expect(wrapper.vm.event).toEqual(mockEvent);
      });
    });

    describe('eventId', () => {
      it('return the right format for eventID', () => {
        expect(wrapper.vm.eventId).toEqual(`000${wrapper.vm.event.number}`);
      });
    });

    describe('eventTypeName', () => {
      it('returns the right event type name', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            id: '1dea3c36-d6a5-4e6c-ac36-078677b7da5f0',
          },
          computed: {
            event() {
              return { ...mockEvent, responseDetails: { eventType: { optionItemId: mockOptionItemData()[0].id } } };
            },
          },
          mocks: {
            $storage: storage,
          },
        });

        expect(wrapper.vm.eventTypeName).toEqual(mockOptionItemData()[0].name);
      });
    });

    describe('provinceName', () => {
      it('returns the right province name when province is not other', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            id: '1dea3c36-d6a5-4e6c-ac36-078677b7da5f0',
          },
          computed: {
            event() {
              return { ...mockEvent, location: { province: ECanadaProvinces.QC } };
            },
          },
          mocks: {
            $storage: storage,
          },
        });
        expect(wrapper.vm.provinceName).toEqual('common.provinces.QC');
      });

      it('returns the right province name when province is not other', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            id: '1dea3c36-d6a5-4e6c-ac36-078677b7da5f0',
          },
          computed: {
            event() {
              return {
                ...mockEvent,
                location: {
                  province: ECanadaProvinces.OT,
                  provinceOther: {
                    translation: { en: 'other-province' },
                  },
                },
              };
            },
          },
          mocks: {
            $storage: storage,
          },
        });
        expect(wrapper.vm.provinceName).toEqual('other-province');
      });
    });

    describe('tabs', () => {
      it('returns the right array', () => {
        expect(wrapper.vm.tabs).toEqual(
          [{
            text: 'eventDetail.menu_summary',
            test: 'event-summary',
            icon: '',
            disabled: false,
            to: routes.events.summary.name,
            level: 'level4',
          }, {
            text: 'eventDetail.menu_programs',
            test: 'event-programs',
            icon: '',
            disabled: false,
            to: routes.programs.home.name,
            level: 'level6',
            exact: false,
          }, {
            text: 'eventDetail.menu_financial',
            test: 'event-financial-assistance',
            icon: '',
            disabled: false,
            to: routes.events.financialAssistance.home.name,
            level: 'level6',
            exact: false,
          },
          {
            text: 'eventDetail.menu_approvals',
            test: 'event-approvals',
            icon: '',
            exact: false,
            disabled: false,
            feature: FeatureKeys.ApprovalsWithinEvent,
            to: routes.events.approvals.home.name,
            level: 'level6',
          }, {
            text: 'eventDetail.menu_assessments',
            test: 'event-assessments',
            icon: '',
            disabled: false,
            to: routes.events.assessments.home.name,
            level: 'level6',
            feature: FeatureKeys.Assessments,
            exact: false,
          }],
        );
      });
    });

    describe('statusHistory', () => {
      it('returns an array of objects representing status change history', () => {
        expect(wrapper.vm.statusHistory).toEqual([{
          title: 'eventDetail.open',
          date: '2021-03-31T15:23:00.755Z',
          reason: null,
        }, {
          title: 'eventDetail.closed',
          date: '2021-03-31T15:23:09.367Z',
          reason: 'Close Reason',
        }, {
          title: 'eventDetail.archived',
          date: '2021-03-31T15:23:13.508Z',
          reason: null,
        }, {
          title: 'event.status.onHold',
          date: '2021-03-31T15:23:16.069Z',
          reason: null,
        }]);
      });
    });
  });

  describe('lifecycle', () => {
    beforeEach(() => {
      eventStore.fetchEventTypes = jest.fn(() => {});
      eventStore.fetchAll = jest.fn(() => {});
      eventStore.fetch = jest.fn();

      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        propsData: {
          id: '1dea3c36-d6a5-4e6c-ac36-078677b7da5f0',
        },
        mocks: {
          $route: {
            name: routes.events.edit.name,
            params: {
              id: '1dea3c36-d6a5-4e6c-ac36-078677b7da5f0',
            },
          },
          $storage: storage,
        },
      });
    });

    it('should fetch event entity', () => {
      expect(eventStore.fetch).toHaveBeenCalledWith(wrapper.vm.id);
    });

    it('should fetch event metadata', () => {
      expect(eventMetadataStore.fetch).toHaveBeenCalledWith(wrapper.vm.id, false);
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      eventStore.fetchEventTypes = jest.fn(() => {});
      eventStore.fetchAll = jest.fn(() => {});
      eventStore.fetch = jest.fn(() => {});

      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        propsData: {
          id: '1dea3c36-d6a5-4e6c-ac36-078677b7da5f0',
        },
        mocks: {
          $route: {
            name: routes.events.edit.name,
            params: {
              id: '1dea3c36-d6a5-4e6c-ac36-078677b7da5f0',
            },
          },
          $storage: storage,
        },
      });
    });

    describe('toggleExpandLeftMenu', () => {
      it('changes the state of showExpandedLeftMenu', async () => {
        wrapper.vm.showExpandedLeftMenu = true;
        await wrapper.vm.toggleExpandLeftMenu();
        expect(wrapper.vm.showExpandedLeftMenu).toBeFalsy();
      });
    });
  });
});
