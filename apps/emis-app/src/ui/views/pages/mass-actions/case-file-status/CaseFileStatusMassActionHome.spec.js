import { createLocalVue, shallowMount } from '@/test/testSetup';

import { MassActionMode, MassActionType, mockCombinedMassAction } from '@libs/entities-lib/mass-action';
import routes from '@/constants/routes';
import { mockProvider } from '@/services/provider';
import { mockEventMainInfo } from '@libs/entities-lib/event';
import Component from './CaseFileStatusMassActionHome.vue';

const localVue = createLocalVue();
const services = mockProvider();

describe('CaseFileStatusMassActionHome.vue', () => {
  let wrapper;

  describe('Data', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        mocks: {
          $services: services,
        },
      });
    });

    it('should have proper mass action type', () => {
      expect(wrapper.vm.massActionTypeData).toEqual(MassActionType.CaseFileStatus);
    });

    it('should have proper detailsRouteName', () => {
      expect(wrapper.vm.detailsRouteNameData).toEqual(routes.massActions.caseFileStatus.details.name);
    });

    it('should have proper table title', () => {
      expect(wrapper.vm.tableTitleData).toEqual('massAction.caseFileStatus.title');
    });

    it('should have proper search end point', () => {
      expect(wrapper.vm.searchEndpointData).toEqual('case-file-status-mass-actions');
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        mocks: {
          $services: services,
        },
      });
    });

    describe('onDeleteMassAction', () => {
      it('calls event search with the event id of the mass action', async () => {
        const massAction = mockCombinedMassAction();
        await wrapper.vm.onDeleteMassAction(massAction);
        expect(wrapper.vm.$services.events.searchMyEventsById).toBeCalledWith([massAction.entity.details.eventId]);
      });

      it('calls onDelete if the service call returns an open event', async () => {
        wrapper.vm.$services.events.searchMyEventsById = jest.fn(() => ({ value: [mockEventMainInfo()] }));
        wrapper.vm.onDelete = jest.fn();
        const massAction = mockCombinedMassAction();
        await wrapper.vm.onDeleteMassAction(massAction);
        expect(wrapper.vm.onDelete).toBeCalledWith(massAction);
      });

      it('calls onDelete if the service call returns a closed event and user is level6', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          mocks: {
            $services: services,
            $hasLevel: () => true,
          },
        });
        wrapper.vm.$services.events.searchMyEventsById = jest.fn(() => ({ value: [mockEventMainInfo({ schedule: { ...mockEventMainInfo().schedule, status: 1 } })] }));
        wrapper.vm.onDelete = jest.fn();
        const massAction = mockCombinedMassAction();
        await wrapper.vm.onDeleteMassAction(massAction);
        expect(wrapper.vm.onDelete).toBeCalledWith(massAction);
      });

      it('shows error message if the service call returns a closed event and user is not level6', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          mocks: {
            $services: services,
            $hasLevel: () => false,
          },
        });

        wrapper.vm.$services.events.searchMyEventsById = jest.fn(() => ({ value: [mockEventMainInfo({ schedule: { ...mockEventMainInfo().schedule, status: 1 } })] }));
        wrapper.vm.onDelete = jest.fn();
        const massAction = mockCombinedMassAction();
        await wrapper.vm.onDeleteMassAction(massAction);
        expect(wrapper.vm.onDelete).not.toBeCalled();
        expect(wrapper.vm.$message).toHaveBeenCalledWith({ title: 'common.error', message: 'massAction.processing.error.noAccessToEvent' });
      });

      it('shows error message if the service call returns a closed event and user is not level6', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          mocks: {
            $services: services,
            $hasLevel: () => false,
          },
        });

        wrapper.vm.$services.events.searchMyEventsById = jest.fn(() => ({ value: [mockEventMainInfo({ schedule: { ...mockEventMainInfo().schedule, status: 1 } })] }));
        wrapper.vm.onDelete = jest.fn();
        const massAction = mockCombinedMassAction();
        await wrapper.vm.onDeleteMassAction(massAction);
        expect(wrapper.vm.onDelete).not.toBeCalled();
        expect(wrapper.vm.$message).toHaveBeenCalledWith({ title: 'common.error', message: 'massAction.processing.error.noAccessToEvent' });
      });

      it('shows error message if the service call returns no event', async () => {
        wrapper.vm.$services.events.searchMyEventsById = jest.fn(() => ({ value: [] }));
        wrapper.vm.onDelete = jest.fn();
        const massAction = mockCombinedMassAction();
        await wrapper.vm.onDeleteMassAction(massAction);
        expect(wrapper.vm.onDelete).not.toBeCalled();
        expect(wrapper.vm.$message).toHaveBeenCalledWith({ title: 'common.error', message: 'massAction.processing.error.noAccessToEvent' });
      });
    });

    describe('goToAdd', () => {
      it('should redirect to correct route if we process via file', () => {
        wrapper.vm.goToAdd({ value: 'file' });
        expect(wrapper.vm.$router.push).toHaveBeenLastCalledWith({
          name: routes.massActions.caseFileStatus.create.name,
          query: { mode: MassActionMode.File },
        });
      });

      it('should show dialog to filter by list', () => {
        wrapper.vm.goToAdd({ value: 'list' });
        expect(wrapper.vm.showProcessByList).toEqual(true);
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,

      });
    });

    describe('customColumns', () => {
      it('should return correct columns', () => {
        expect(wrapper.vm.customColumns)
          .toEqual({
            name: 'Entity/Name',
            dateCreated: 'Entity/Created',
            projected: 'Metadata/LastRun/Results/Total',
            successful: 'Metadata/LastRun/Results/Successes',
            status: 'Metadata/LastRun/RunStatus',
            deleteButton: 'deleteButton',
          });
      });
    });

    describe('headers', () => {
      it('should return correct headers', () => {
        const headers = [
          {
            text: 'massAction.common.name',
            align: 'start',
            sortable: true,
            value: wrapper.vm.customColumns.name,
          },
          {
            text: 'massAction.common.dateCreated',
            value: wrapper.vm.customColumns.dateCreated,
            sortable: true,
          }, {
            text: 'massAction.common.projected',
            value: wrapper.vm.customColumns.projected,
            sortable: true,
          }, {
            text: 'massAction.common.successful',
            value: wrapper.vm.customColumns.successful,
            sortable: true,
          },
          {
            text: 'massAction.common.status',
            value: wrapper.vm.customColumns.status,
            sortable: false,
          }, {
            align: 'end',
            text: '',
            value: 'deleteButton',
            sortable: false,
          }];
        expect(wrapper.vm.headers).toEqual(headers);
      });
    });

    describe('menuItems', () => {
      it('should return proper items to add', () => {
        expect(wrapper.vm.menuItems).toEqual([{
          text: 'massAction.caseFileStatus.table.add.list',
          value: 'list',
          icon: 'mdi-filter-variant',
          dataTest: 'mass-action-case-file-status-add-list',
        }, {
          text: 'massAction.caseFileStatus.table.add.file',
          value: 'file',
          icon: 'mdi-upload',
          dataTest: 'mass-action-case-file-status-add-file',
        }]);
      });
    });
  });
});
