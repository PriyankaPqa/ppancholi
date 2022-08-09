import flushPromises from 'flush-promises';
import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { MAX_LENGTH_MD } from '@libs/shared-lib/constants/validations';
import {
  EEventStatus,
} from '@libs/entities-lib/event';
import routes from '@/constants/routes';
import { mockAppUsers } from '@/test/helpers';
import {
  TeamType, mockTeamEvents, mockTeamEntity, mockTeamsDataAddHoc,
} from '@libs/entities-lib/team';
import { mockStorage } from '@/storage';

import { mockCombinedUserAccount } from '@libs/entities-lib/user-account';
import { Status } from '@libs/entities-lib/base';
import Component from './CreateEditTeam.vue';

const localVue = createLocalVue();
const storage = mockStorage();

describe('CreateEditTeam.vue', () => {
  let wrapper;

  const mountWrapper = async (fullMount = true, level = 5, additionalOverwrites = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      propsData: {
        id: 'abc',
        teamType: 'standard',
      },
      mocks: {
        $hasLevel: (lvl) => lvl <= `level${level}`,
        $storage: storage,
      },
      ...additionalOverwrites,
    });
    await wrapper.vm.$nextTick();
    await flushPromises();
  };

  const teamEventsMock = mockTeamEvents();
  const inactiveEvent = { entity: { id: 'foo', name: { translation: { en: 'mock-name' } } } };
  const inactiveEvent2 = { entity: { id: 'foo2', name: { translation: { en: 'mock-name2' } } } };
  storage.event.getters.eventsByStatus = jest.fn(() => teamEventsMock);
  const allEvents = storage.event.getters.getAll();
  storage.event.getters.getAll = jest.fn(() => [...allEvents, inactiveEvent, inactiveEvent2]);

  describe('Template', () => {
    beforeEach(async () => {
      await mountWrapper(true);
    });

    describe('Rendered elements', () => {
      describe('back button', () => {
        let element;
        beforeEach(() => {
          element = wrapper.findDataTest('pageContent_backButton');
        });
        it('renders', () => {
          expect(element.exists()).toBeTruthy();
        });
        it('calls onCancel when it is clicked', () => {
          jest.spyOn(wrapper.vm, 'onCancel').mockImplementation(() => {});
          element.vm.$emit('click');
          expect(wrapper.vm.onCancel).toHaveBeenCalledTimes(1);
        });
      });

      describe('Status', () => {
        it('should render', () => {
          const element = wrapper.find('[data-test="team-status"]');
          expect(element.exists()).toBeTruthy();
        });

        it('should be disabled in create mode', async () => {
          await mountWrapper(true, 5, {
            computed: {
              isEditMode() {
                return false;
              },
            },
          });

          const element = wrapper.find('[data-test="team-status"]');
          expect(element.props('disabled')).toBeTruthy();
        });
      });

      describe('Name field', () => {
        let element;
        beforeEach(() => {
          element = wrapper.find('[data-test="team-name"]');
        });

        it('should render', () => {
          expect(element.exists()).toBeTruthy();
        });

        it('should display the correct label', () => {
          const label = element.find('label');
          expect(label.text()).toEqual('teams.form.team_name*');
        });

        it('is linked to the right rule attribute', () => {
          expect(element.props('rules')).toEqual(wrapper.vm.rules.name);
        });

        it('should update the right property when it is modified', async () => {
          const input = element.find('input');
          await input.setValue('foo');
          expect(wrapper.vm.team.name).toBe('foo');
        });

        it('calls resetAsUnique on input', () => {
          jest.spyOn(wrapper.vm, 'resetAsUnique').mockImplementation(() => {});
          element.vm.$emit('input', 'foo');
          expect(wrapper.vm.resetAsUnique).toHaveBeenCalledTimes(1);
        });
      });

      describe('Primary contact field', () => {
        let element;
        beforeEach(() => {
          element = wrapper.find('[data-test="team-contact"]');
        });

        it('should render', () => {
          expect(element.exists()).toBeTruthy();
        });

        it('should display the right label', () => {
          const label = element.find('label');
          expect(label.text()).toEqual('teams.form.primary_contact*');
        });

        it('is linked to the right rule attribute', () => {
          expect(element.props('rules')).toEqual(wrapper.vm.rules.primaryContact);
        });

        it('should call the right method when it is updated', async () => {
          jest.spyOn(wrapper.vm, 'setPrimaryContact').mockImplementation(() => {});
          element.vm.$emit('change', 'bar');
          expect(wrapper.vm.setPrimaryContact).toHaveBeenCalledWith('bar');
        });

        it('should call resetPrimaryContact on keydown.delete', async () => {
          jest.spyOn(wrapper.vm, 'resetPrimaryContact').mockImplementation(() => {});
          element.vm.$emit('keydown', new KeyboardEvent('keydown', {
            keyCode: 8, // delete key
          }));
          expect(wrapper.vm.resetPrimaryContact).toHaveBeenCalledTimes(1);
        });
      });

      describe('Events field', () => {
        let element;
        beforeEach(async () => {
          element = wrapper.find('[data-test="events"]');
        });

        it('should render', () => {
          expect(element.exists()).toBeTruthy();
        });

        it('should display the correct label if team type is standard', async () => {
          wrapper.setProps({ teamType: 'standard' });
          await wrapper.vm.$nextTick();
          const label = element.find('label');
          expect(label.text()).toEqual('teams.form.event');
        });

        it('should display the correct label if team type is adhoc', async () => {
          wrapper.setProps({ teamType: 'adhoc' });
          await wrapper.vm.$nextTick();
          const label = element.find('label');
          expect(label.text()).toEqual('teams.form.event*');
        });

        it('calls setEvents when it is changed', () => {
          jest.spyOn(wrapper.vm, 'setEvents').mockImplementation(() => {});
          element.vm.$emit('change', 'foo');
          expect(wrapper.vm.setEvents).toHaveBeenCalledTimes(1);
        });

        it('calls handleRemoveEvent when an element is deleted', () => {
          jest.spyOn(wrapper.vm, 'handleRemoveEvent').mockImplementation(() => {});
          element.vm.$emit('delete');
          expect(wrapper.vm.handleRemoveEvent).toHaveBeenCalledTimes(1);
        });
      });

      describe('cancel Confirmation Dialog', () => {
        let element;
        beforeEach(async () => {
          wrapper.vm.showCancelConfirmationDialog = true;
          await wrapper.vm.$nextTick();
          element = wrapper.find('[data-test="createEditTeam__confirmCancelDialog"]');
        });

        it('displays the cancel confirmation dialog when showCancelConfirmationDialog is true', () => {
          expect(element.exists()).toBeTruthy();
        });

        it('calls goBack when submit is called', () => {
          jest.spyOn(wrapper.vm, 'goBack').mockImplementation(() => {});
          element.vm.$emit('submit');
          expect(wrapper.vm.goBack).toHaveBeenCalledTimes(1);
        });

        it('sets showCancelConfirmationDialog to false when cancel is called', () => {
          element.vm.$emit('cancel');
          expect(wrapper.vm.showCancelConfirmationDialog).toBeFalsy();
        });

        it('sets showCancelConfirmationDialog to false when close  is called', () => {
          element.vm.$emit('close');
          expect(wrapper.vm.showCancelConfirmationDialog).toBeFalsy();
        });
      });

      describe('Remove Event Confirmation Dialog', () => {
        let element;
        beforeEach(async () => {
          wrapper.vm.showEventDeleteConfirmationDialog = true;
          await wrapper.vm.$nextTick();
          element = wrapper.find('[data-test="createEditTeam__confirmEventDeleteDialog"]');
        });

        it('displays the cancel confirmation dialog when showEventDeleteConfirmationDialog is true', () => {
          expect(element.exists()).toBeTruthy();
        });

        it('calls handleRemoveEventConfirmation with true when submit is called', () => {
          jest.spyOn(wrapper.vm, 'handleRemoveEventConfirmation').mockImplementation(() => {});
          element.vm.$emit('submit');
          expect(wrapper.vm.handleRemoveEventConfirmation).toHaveBeenCalledWith(true);
        });

        it('calls handleRemoveEventConfirmation with false when cancel is called', () => {
          jest.spyOn(wrapper.vm, 'handleRemoveEventConfirmation').mockImplementation(() => {});
          element.vm.$emit('cancel');
          expect(wrapper.vm.handleRemoveEventConfirmation).toHaveBeenCalledWith(false);
        });

        it('calls handleRemoveEventConfirmation with false when close is called', () => {
          jest.spyOn(wrapper.vm, 'handleRemoveEventConfirmation').mockImplementation(() => {});
          element.vm.$emit('close');
          expect(wrapper.vm.handleRemoveEventConfirmation).toHaveBeenCalledWith(false);
        });
      });
    });
  });

  describe('Template continued... shallowMount', () => {
    describe('Action buttons', () => {
      describe('submit button', () => {
        let element;
        beforeEach(async () => {
          await mountWrapper(false, 5, {
            computed: {
              submitLabel() {
                return 'mockSubmitLabel';
              },
            },
          });
          element = wrapper.findDataTest('createEditTeam__submit');
        });

        it('is rendered', () => {
          expect(element.exists()).toBeTruthy();
        });

        it('has the correct label', () => {
          expect(element.text()).toEqual('mockSubmitLabel');
        });

        it('calls submit when it is clicked', () => {
          jest.spyOn(wrapper.vm, 'submit').mockImplementation(() => {});
          element.vm.$emit('click');
          expect(wrapper.vm.submit).toHaveBeenCalledTimes(1);
        });

        describe('test disabled state', () => {
          let mockFn;
          beforeEach(async () => {
            await mountWrapper(false);
            mockFn = jest.spyOn(wrapper.vm, 'isSubmitDisabled');
            mockFn.mockImplementation(() => true);
            // trigger a rebinding
            await wrapper.setData({ isLoading: true });
            await wrapper.setData({ isLoading: false });
          });

          it('is disabled when isSubmitDisabled is true', () => {
            element = wrapper.findDataTest('createEditTeam__submit');
            expect(element.attributes('disabled')).toBeTruthy();
          });
        });
        describe('test disabled state on data manipulation', () => {
          beforeEach(async () => {
            await mountWrapper(false, 5, {
              computed: {
                isEditMode() {
                  return true;
                },
              },
            });
            jest.spyOn(wrapper.vm, 'isSubmitDisabled').mockImplementation((isFailed, isChanged) => !isChanged);
            // trigger a rebinding
            await wrapper.setData({ isLoading: true });
            await wrapper.setData({ isLoading: false });
          });
          it('is enabled when data is changed', async () => {
            await wrapper.setData({ team: { name: 'new name' } });
            element = wrapper.findDataTest('createEditTeam__submit');
            expect(element.attributes('disabled')).toBe(undefined);
          });

          it('is disabled when data is changed to original', async () => {
            await wrapper.setData({ team: mockTeamsDataAddHoc() });
            element = wrapper.findDataTest('createEditTeam__submit');
            const isEnabledAfterChanged = element.attributes('disabled') === undefined;
            await wrapper.setData({ team: mockTeamEntity() });
            element = wrapper.findDataTest('createEditTeam__submit');
            expect(element.attributes('disabled') && isEnabledAfterChanged).toBeTruthy();
          });
        });
      });

      describe('cancel button', () => {
        let element;
        beforeEach(async () => {
          await mountWrapper(false);

          element = wrapper.findDataTest('createEditTeam__cancel');
        });

        it('is rendered', () => {
          expect(element.exists()).toBeTruthy();
        });

        it('has the correct label', () => {
          expect(element.text()).toEqual('common.buttons.cancel');
        });

        it('calls onCancel when it is clicked', () => {
          jest.spyOn(wrapper.vm, 'onCancel').mockImplementation(() => {});
          element.vm.$emit('click');
          expect(wrapper.vm.onCancel).toHaveBeenCalledTimes(1);
        });
      });
    });

    describe('Authorization', () => {
      beforeEach(async () => {
        await mountWrapper(true, 4, {
          computed: {
            isEditMode() {
              return true;
            },
          },
        });
      });

      test('Status selection is disabled for L4 or less', async () => {
        let element = wrapper.findDataTest('team-status');
        expect(element.props('disabled')).toBeTruthy();

        await mountWrapper(true, 5, {
          computed: {
            isEditMode() {
              return true;
            },
          },
        });
        element = wrapper.findDataTest('team-status');
        expect(element.props('disabled')).toBeFalsy();
      });

      test('Team name input is disabled for L4 or less', async () => {
        let element = wrapper.findSelectWithValidation('team-name');
        expect(element.props('disabled')).toBeTruthy();

        await mountWrapper(true, 5, {
          computed: {
            isEditMode() {
              return true;
            },
          },
        });
        element = wrapper.findSelectWithValidation('team-name');
        expect(element.props('disabled')).toBeFalsy();
      });

      test('Primary contact input is disabled for L4 or less', async () => {
        let element = wrapper.findSelectWithValidation('team-contact');
        expect(element.props('disabled')).toBeTruthy();

        await mountWrapper(true, 5, {
          computed: {
            isEditMode() {
              return true;
            },
          },
        });
        element = wrapper.findSelectWithValidation('team-contact');
        expect(element.props('disabled')).toBeFalsy();
      });

      test('Event selection is disabled for L4 or less', async () => {
        let element = wrapper.findSelectWithValidation('events');
        expect(element.props('disabled')).toBeTruthy();

        await mountWrapper(true, 5, {
          computed: {
            isEditMode() {
              return true;
            },
          },
        });
        element = wrapper.findSelectWithValidation('events');
        expect(element.props('disabled')).toBeFalsy();
      });

      test('Cancel button is disabled for L4 or less', () => {
        const element = wrapper.findDataTest('createEditTeam__cancel');
        expect(element.props('disabled')).toBeTruthy();
      });
    });
  });

  describe('beforeRouteEnter', () => {
    beforeEach(async () => {
      await mountWrapper(false);
    });
    test('If "standard" is in the route params we go to next', async () => {
      const mockParam = { params: 'standard' };
      const next = jest.fn(() => {});
      wrapper.vm.$options.beforeRouteEnter(mockParam, {}, next);
      expect(next).toBeCalled();
    });

    test('If "adhoc" is in the route params we go to next', async () => {
      const mockTo = { params: 'adhoc' };
      const next = jest.fn(() => {});
      wrapper.vm.$options.beforeRouteEnter(mockTo, {}, next);
      expect(next).toBeCalled();
    });

    test('If a valid team type is not in the route params, we are redirected to the page where we came from', async () => {
      const mockTo = { params: 'foo' };
      const mockFrom = { name: 'bar' };
      const next = jest.fn(() => {});
      wrapper.vm.$options.beforeRouteEnter(mockTo, mockFrom, next);
      expect(next).toHaveBeenCalledWith(mockFrom);
    });
  });

  describe('Computed', () => {
    beforeEach(async () => {
      await mountWrapper(false);
    });

    describe('deleteEventConfirmationMessage', () => {
      it('displays the correct message ', async () => {
        await wrapper.setData({ eventsAfterRemoval: ['zzzz'] });
        expect(wrapper.vm.deleteEventConfirmationMessage).toEqual('team.event.confirmDeleteDialog.message');
      });
    });

    describe('isEditMode', () => {
      it('should return true when we are on the edit page', () => {
        wrapper.vm.$route.name = routes.teams.edit.name;
        expect(wrapper.vm.isEditMode).toBeTruthy();
      });
      it('should return false when we are on the create page', () => {
        wrapper.vm.$route.name = routes.teams.create.name;
        expect(wrapper.vm.isEditMode).toBeFalsy();
      });
    });

    describe('headerTitle', () => {
      it('should render the correct title if we are in edit mode', () => {
        wrapper.vm.$route.name = routes.teams.edit.name;
        expect(wrapper.vm.headerTitle).toBe('teams.edit_team');
      });
      it('should render the correct title if we are in create mode', () => {
        wrapper.vm.$route.name = routes.teams.create.name;
        expect(wrapper.vm.headerTitle).toBe('teams.create_new_team');
      });
    });

    describe('rules', () => {
      it('should have the correct name rule', () => {
        wrapper.vm.isNameUnique = true;
        expect(wrapper.vm.rules.name).toEqual({
          required: true,
          max: MAX_LENGTH_MD,
          customValidator: { isValid: wrapper.vm.isNameUnique, messageKey: 'validations.alreadyExists' },
        });
      });

      it('should have the correct primaryContact rule', () => {
        expect(wrapper.vm.rules.primaryContact).toEqual({
          required: true,
        });
      });

      it('should have the required true event rule if team type is adhoc', async () => {
        wrapper.setProps({ teamType: 'adhoc' });
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.rules.event).toEqual({
          required: true,
        });
      });

      it('should have the required false event rule if team type is standard', async () => {
        wrapper.setProps({ teamType: 'standard' });
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.rules.event).toEqual({
          required: false,
        });
      });
    });

    describe('teamTitle', () => {
      it('should display the right title if team type is standard', () => {
        wrapper.setProps({ teamType: 'standard' });
        expect(wrapper.vm.teamTitle).toBe('teams.types.standard');
      });

      it('should display the right title if team type is adhoc', async () => {
        wrapper.setProps({ teamType: 'adhoc' });
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.teamTitle).toBe('teams.types.adhoc');
      });
    });

    describe('changed', () => {
      beforeEach(async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            teamType: 'standard',
            id: '123',
          },
          computed: {
            isEditMode() {
              return true;
            },
          },
          mocks: {
            $storage: storage,
          },
        });
        await wrapper.setData({
          team: mockTeamEntity(),
          isLoading: false,
        });
        wrapper.vm.setOriginalData();
      });
      it('check if changed value changes on changing team values', async () => {
        await wrapper.setData({ team: mockTeamsDataAddHoc() });
        const isEnabledAfterChanged = wrapper.vm.changed;
        await wrapper.setData({ team: mockTeamEntity() });
        expect(!wrapper.vm.changed && isEnabledAfterChanged).toBeTruthy();
      });

      it('check if the value is unchanged', () => {
        expect(wrapper.vm.changed).toBeFalsy();
      });
    });

    describe('submitLabel', () => {
      it('should return the right label when we are in create mode', () => {
        wrapper.vm.$route.name = routes.teams.create.name;
        expect(wrapper.vm.submitLabel).toBe('common.buttons.create');
      });
      it('should return the right label when we are in edit mode', () => {
        wrapper.vm.$route.name = routes.teams.edit.name;
        expect(wrapper.vm.submitLabel).toBe('common.save');
      });
    });
  });

  describe('Lifecycle', () => {
    beforeEach(async () => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          teamType: 'standard',
        },
        mocks: {
          $storage: storage,
        },
        data() {
          return {
            team: mockTeamEntity(),
          };
        },
      });
      wrapper.vm.fetchEvents = jest.fn();
      wrapper.vm.getAvailableEvents = jest.fn();
      wrapper.vm.fetchUserAccounts = jest.fn();
    });

    it('calls getAvailableEvents', async () => {
      await wrapper.vm.$options.mounted.forEach((hook) => {
        hook.call(wrapper.vm);
      });
      expect(wrapper.vm.getAvailableEvents).toHaveBeenCalledTimes(1);
    });

    it('should calls fetchUserAccounts', async () => {
      jest.clearAllMocks();
      await wrapper.vm.$options.mounted.forEach((hook) => {
        hook.call(wrapper.vm);
      });
      expect(wrapper.vm.fetchUserAccounts).toHaveBeenCalledTimes(1);
    });
  });

  describe('Methods', () => {
    beforeEach(async () => {
      await mountWrapper(false);
    });

    describe('getAvailableEvents', () => {
      it('calls the storage getter to get the events with on hold and active status', async () => {
        expect(wrapper.vm.$storage.event.getters.eventsByStatus).toHaveBeenCalledWith([EEventStatus.Open, EEventStatus.OnHold]);
      });

      it('sets into availableEvents the events returned by the storage in the right form', async () => {
        expect(wrapper.vm.availableEvents).toEqual(teamEventsMock);
      });

      it('adds into availableEvents the events that are existing in the team but are not currently active/on hold, only for edit mode', async () => {
        const myTeam = mockTeamEntity();
        myTeam.eventIds = [inactiveEvent.entity.id];
        await mountWrapper(false, 5, {
          computed: {
            isEditMode() {
              return true;
            },
          },
        });
        await wrapper.setData({ team: myTeam });

        wrapper.vm.getAvailableEvents();

        expect(wrapper.vm.availableEvents).toEqual([
          inactiveEvent.entity,
          ...teamEventsMock,
        ]);
      });
    });

    describe('handleRemoveEvent', () => {
      it('sets the eventsIdsAfterRemoval to its argument', () => {
        wrapper.vm.handleRemoveEvent(['a', 'b']);
        expect(wrapper.vm.eventsAfterRemoval).toEqual(['a', 'b']);
      });
      it('sets showEventDeleteConfirmationDialog  to true', () => {
        wrapper.vm.handleRemoveEvent(['a', 'b']);
        expect(wrapper.vm.showEventDeleteConfirmationDialog).toBeTruthy();
      });
    });

    describe('handleRemoveEventConfirmation', () => {
      it('sets team events with the eventsAfterRemoval if argument is true', async () => {
        wrapper.vm.eventsAfterRemoval = ['a', 'b'];
        wrapper.vm.handleRemoveEventConfirmation(true);
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.team.eventIds).toEqual(['a', 'b']);
      });

      it('set team events with a clone of team.events if argument is false', async () => {
        wrapper.vm.team.events = teamEventsMock;
        wrapper.vm.handleRemoveEventConfirmation(false);
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.team.eventIds).not.toEqual(teamEventsMock);
      });

      it('sets showEventDeleteConfirmationDialog to false', () => {
        wrapper.vm.handleRemoveEventConfirmation(false);
        expect(wrapper.vm.showEventDeleteConfirmationDialog).toBeFalsy();
      });
    });

    describe('isSubmitDisabled', () => {
      it('returns true when isFailed is true', () => {
        expect(wrapper.vm.isSubmitDisabled(true, true)).toBeTruthy();
        expect(wrapper.vm.isSubmitDisabled(true, false)).toBeTruthy();
      });

      it('returns true when in edit mode and isDirty is false', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            teamType: 'standard',
          },
          computed: {
            isEditMode() {
              return true;
            },
          },
          mocks: {
            $storage: storage,
          },
          data() {
            return {
              team: mockTeamEntity(),
              isLoading: false,
            };
          },
        });
        expect(wrapper.vm.isSubmitDisabled(false, false)).toBeTruthy();
        expect(wrapper.vm.isSubmitDisabled(true, false)).toBeTruthy();
      });

      it('return false when isFailed is false in create mode', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            teamType: 'standard',
          },
          mocks: {
            $storage: storage,
          },
          computed: {
            isEditMode() {
              return false;
            },

          },
          data() {
            return {
              team: mockTeamEntity(),
              isLoading: false,
            };
          },
        });

        expect(wrapper.vm.isSubmitDisabled(false, false)).toBeFalsy();
        expect(wrapper.vm.isSubmitDisabled(false, true)).toBeFalsy();
      });

      it('return false when in edit mode isFailed is false and isDirty is true', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            teamType: 'standard',
          },
          computed: {
            isEditMode() {
              return true;
            },
          },
          mocks: {
            $storage: storage,
          },
          data() {
            return {
              team: mockTeamEntity(),
              isLoading: false,
            };
          },
        });

        expect(wrapper.vm.isSubmitDisabled(false, true)).toBeFalsy();
      });
    });

    describe('loadTeam', (() => {
      it('calls the action getTeam', async () => {
        await wrapper.vm.loadTeam();
        expect(wrapper.vm.$storage.team.actions.fetch).toHaveBeenCalledWith('abc');
      });

      it('sets the right primaryContactQuery', async () => {
        await wrapper.vm.loadTeam();

        expect(wrapper.vm.primaryContactQuery).toEqual('Jane Smith');
      });

      it('should set the team with a cloneDeep of team from storage', async () => {
        await wrapper.vm.loadTeam();
        expect(wrapper.vm.team).toEqual(mockTeamEntity());
      });

      it('should call loadTeamFromState', async () => {
        jest.spyOn(wrapper.vm, 'loadTeamFromState');
        await wrapper.vm.loadTeam();
        expect(wrapper.vm.loadTeamFromState).toBeCalled();
      });
    }));

    describe('loadTeamFromState', (() => {
      beforeEach(async () => {
        wrapper.vm.$route.params = { id: 'foo' };
      });

      it('sets the right primary contact user', async () => {
        await wrapper.vm.loadTeamFromState();
        expect(wrapper.vm.currentPrimaryContact).toEqual({
          displayName: 'Jane Smith',
          email: 'Jane.Smith@example.com',
          id: '1',
          isPrimaryContact: true,
        });
      });

      it('should do nothing if it receives an error of existing name as argument ', async () => {
        wrapper.setData({ team: mockTeamEntity({ id: 'my-mock-id' }) });
        await wrapper.vm.loadTeamFromState([{ code: 'errors.an-entity-with-this-name-already-exists' }]);
        expect(wrapper.vm.team).toEqual(mockTeamEntity({ id: 'my-mock-id' }));
      });

      it('should set the team with a cloneDeep of team from storage', async () => {
        await wrapper.vm.loadTeamFromState();
        expect(wrapper.vm.team).toEqual(mockTeamEntity());
      });
    }));

    describe('goBack', () => {
      it('redirects to home if from param is not there', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            teamType: 'standard',
          },
          mocks: {
            $storage: storage,
          },
          data() {
            return {
              team: mockTeamEntity(),
              isLoading: false,
            };
          },
        });
        jest.spyOn(wrapper.vm.$router, 'push');
        wrapper.vm.goBack();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: routes.teams.home.name });
      });

      it('redirects to from if from param is there', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            teamType: 'standard',
          },
          mocks: {
            $storage: storage,
          },
          data() {
            return {
              team: mockTeamEntity(),
              isLoading: false,
            };
          },
        });
        wrapper.vm.$route.params.from = 'from';
        jest.spyOn(wrapper.vm.$router, 'push');
        wrapper.vm.goBack();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: 'from' });
      });
    });

    describe('onCancel', () => {
      it('sets showCancelConfirmationDialog to true if the passed argument is true', () => {
        wrapper.vm.showCancelConfirmationDialog = false;
        wrapper.vm.onCancel(true);
        expect(wrapper.vm.showCancelConfirmationDialog).toBeTruthy();
      });

      it('calls g if the passed argument is false', () => {
        jest.spyOn(wrapper.vm, 'goBack').mockImplementation(() => {});
        wrapper.vm.onCancel(false);
        expect(wrapper.vm.goBack).toHaveBeenCalledTimes(1);
      });
    });

    describe('onStatusChange', () => {
      it('sets the team status to the received argument', async () => {
        await wrapper.vm.onStatusChange(Status.Inactive);
        expect(wrapper.vm.team.status).toEqual(Status.Inactive);
      });
    });

    describe('searchPrimaryContacts', () => {
      it('calls the searchAppUsers action when the query is long enough and assigns the result to primaryContactUsers', async () => {
        jest.spyOn(wrapper.vm.$storage.userAccount.getters, 'getByCriteria').mockImplementation(() => [mockCombinedUserAccount()]);
        wrapper.vm.primaryContactQuery = 'ab';
        wrapper.vm.minimumContactQueryLength = 2;
        await wrapper.vm.searchPrimaryContacts();
        expect(wrapper.vm.$storage.userAccount.getters.getByCriteria)
          .toHaveBeenCalledWith(wrapper.vm.primaryContactQuery, false, ['displayName']);
        const flattenedCombinedUserAccount = wrapper.vm.mapToTeamMember(mockCombinedUserAccount(), false);
        expect(wrapper.vm.primaryContactUsers).toEqual([flattenedCombinedUserAccount]);
      });

      it('does not call the searchAppUsers action when the query is not long enough long enough and empties the list of users', async () => {
        jest.clearAllMocks();
        jest.spyOn(wrapper.vm.$storage.userAccount.getters, 'getByCriteria').mockImplementation(() => []);
        wrapper.vm.primaryContactQuery = 'a';
        wrapper.vm.minimumContactQueryLength = 2;
        await wrapper.vm.searchPrimaryContacts();

        expect(wrapper.vm.$storage.userAccount.getters.getByCriteria).not.toHaveBeenCalled();
        expect(wrapper.vm.primaryContactUsers.length).toEqual(0);
      });
    });

    describe('setEvents', () => {
      it('should set the team events to the argument passed to the method, if the argument is an array', async () => {
        await wrapper.vm.setEvents([{ id: 'foo' }, { id: 'bar' }]);
        expect(wrapper.vm.team.eventIds).toEqual(['foo', 'bar']);
      });

      it('should set the team events to an array containing the argument passed to the method, otherwise', async () => {
        await wrapper.vm.setEvents({ id: 'foo' });
        expect(wrapper.vm.team.eventIds).toEqual(['foo']);
      });
    });

    describe('setPrimaryContact', () => {
      it('assigns the primary user to currentPrimaryContact ', async () => {
        await wrapper.vm.setPrimaryContact(mockAppUsers[0]);
        expect(wrapper.vm.currentPrimaryContact).toEqual(mockAppUsers[0]);
      });
    });

    describe('submit', () => {
      beforeEach(() => {
        jest.clearAllMocks();

        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            teamType: 'standard',
            id: '123',
          },
          computed: {
            isEditMode() {
              return true;
            },
          },
          data() {
            return {
              team: mockTeamEntity(),
              isLoading: false,
            };
          },
          mocks: {
            $storage: storage,
          },
        });

        wrapper.vm.setPrimaryContactTeam = jest.fn();
      });

      it('calls the validation method', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            teamType: 'standard',
            id: '123',
          },
          mocks: {
            $storage: storage,
          },
          computed: {
            isEditMode() {
              return true;
            },
          },
          data() {
            return {
              team: mockTeamEntity(),
              isLoading: false,
              currentPrimaryContact: { id: 'id' },
            };
          },

        });

        wrapper.vm.setPrimaryContactTeam = jest.fn();

        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.$refs.form.reset = jest.fn(() => true);
        await wrapper.vm.submit();
        expect(wrapper.vm.$refs.form.validate).toHaveBeenCalledTimes(1);
      });

      it('calls the method setPrimaryContact of team with currentPrimaryContact', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.submitCreateTeam = jest.fn();
        wrapper.vm.$reportToasted = jest.fn();
        await wrapper.vm.submit();
        expect(wrapper.vm.setPrimaryContactTeam).toHaveBeenCalledTimes(1);
      });

      describe('in create mode', () => {
        jest.clearAllMocks();

        beforeEach(async () => {
          wrapper = shallowMount(Component, {
            localVue,
            propsData: {
              teamType: 'standard',
            },
            computed: {
              isEditMode() {
                return false;
              },
            },
            mocks: {
              $storage: storage,
            },
            data() {
              return {
                currentPrimaryContact: {
                  id: 'id',
                },
                // team: mockTeamEntity(),
              };
            },
          });

          await wrapper.setData({
            team: mockTeamEntity(),
            isLoading: false,
          });
          wrapper.vm.$refs.form.validate = jest.fn(() => true);
          wrapper.vm.$refs.form.reset = jest.fn(() => true);
          wrapper.vm.setPrimaryContactTeam = jest.fn();
        });

        it('does not call submitCreateTeam unless form validation succeeds', async () => {
          jest.spyOn(wrapper.vm, 'submitCreateTeam');
          wrapper.vm.$refs.form.validate = jest.fn(() => false);
          expect(wrapper.vm.submitCreateTeam).toHaveBeenCalledTimes(0);

          wrapper.vm.$refs.form.validate = jest.fn(() => true);

          await wrapper.vm.submit();
          expect(wrapper.vm.submitCreateTeam).toHaveBeenCalledTimes(1);
        });
      });

      describe('edit mode', () => {
        jest.clearAllMocks();

        beforeEach(() => {
          wrapper = shallowMount(Component, {
            localVue,
            propsData: {
              teamType: 'standard',
            },
            computed: {
              isEditMode() {
                return true;
              },
            },
            mocks: {
              $storage: storage,
            },
            data() {
              return {
                currentPrimaryContact: {
                  id: 'id',
                },
                team: mockTeamEntity(),
              };
            },
          });
          wrapper.vm.$refs.form.validate = jest.fn(() => true);
          wrapper.vm.$refs.form.reset = jest.fn(() => true);
          wrapper.vm.setPrimaryContactTeam = jest.fn();
        });

        it('does not call submitEditTeam unless form validation succeeds', async () => {
          jest.spyOn(wrapper.vm, 'submitEditTeam');
          wrapper.vm.$refs.form.validate = jest.fn(() => false);

          await wrapper.vm.submit();
          expect(wrapper.vm.submitEditTeam).toHaveBeenCalledTimes(0);

          wrapper.vm.$refs.form.validate = jest.fn(() => true);

          await wrapper.vm.submit();
          expect(wrapper.vm.submitEditTeam).toHaveBeenCalledTimes(1);
        });
      });
    });

    describe('submitCreateTeam', () => {
      beforeEach(async () => {
        jest.clearAllMocks();

        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            teamType: 'standard',
            id: '123',
          },
          computed: {
            isEditMode() {
              return false;
            },
          },
          mocks: {
            $storage: storage,
          },
        });

        await wrapper.setData({
          team: mockTeamEntity(),
          isLoading: false,
        });

        jest.spyOn(wrapper.vm, 'resetFormValidation').mockImplementation(() => {});
      });

      it('calls createTeam action', async () => {
        await wrapper.vm.submitCreateTeam();
        expect(wrapper.vm.$storage.team.actions.createTeam).toHaveBeenCalledTimes(1);
      });

      it('calls setOriginalData action', async () => {
        jest.spyOn(wrapper.vm, 'setOriginalData');
        await wrapper.vm.submitCreateTeam();
        expect(wrapper.vm.setOriginalData).toHaveBeenCalledTimes(1);
      });

      it('opens a toast with a success message for standard team', async () => {
        await wrapper.vm.submitCreateTeam();

        expect(wrapper.vm.$toasted.global.success).toHaveBeenLastCalledWith('teams.standard_team_created');
      });

      it('sets the value of the team in data', async () => {
        await wrapper.vm.submitCreateTeam();
        expect(wrapper.vm.team).toEqual(mockTeamEntity());
      });

      it('opens a toast with a success message for adhoc team', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            teamType: 'adhoc',
            id: '123',
          },
          computed: {
            isEditMode() {
              return false;
            },
          },
          mocks: {
            $storage: storage,
          },

        });

        await wrapper.setData({
          team: mockTeamEntity(),
          isLoading: false,
        });

        jest.spyOn(wrapper.vm, 'resetFormValidation').mockImplementation(() => {});

        wrapper.vm.team.teamType = TeamType.AdHoc;
        wrapper.vm.$refs.form.validate = jest.fn(() => true);

        await wrapper.vm.submitCreateTeam();

        expect(wrapper.vm.$toasted.global.success).toHaveBeenLastCalledWith('teams.standard_team_created');
      });

      it('redirects to the edit page with the id of the newly created team', async () => {
        wrapper.vm.team.id = 'guid-team-1';
        await wrapper.vm.submitCreateTeam();

        expect(wrapper.vm.$router.replace).toHaveBeenCalledWith(
          { name: routes.teams.edit.name, params: { id: mockTeamEntity().id, teamType: 'standard' } },
        );
      });

      it('resets the form validation', async () => {
        await wrapper.vm.submitCreateTeam();
        expect(wrapper.vm.resetFormValidation).toHaveBeenCalledTimes(1);
      });
    });

    describe('submitEditTeam', () => {
      beforeEach(async () => {
        jest.clearAllMocks();

        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            teamType: 'standard',
            id: '123',
          },
          computed: {
            isEditMode() {
              return true;
            },
          },
          mocks: {
            $storage: storage,
          },
        });

        await wrapper.setData({
          team: mockTeamEntity(),
          isLoading: false,
        });

        jest.spyOn(wrapper.vm, 'resetFormValidation').mockImplementation(() => {});
      });

      it('calls editTeam action', async () => {
        await wrapper.vm.submitEditTeam();
        expect(wrapper.vm.$storage.team.actions.editTeam).toHaveBeenCalledTimes(1);
      });

      it('calls setOriginalData action', async () => {
        jest.spyOn(wrapper.vm, 'setOriginalData');
        await wrapper.vm.submitEditTeam();
        expect(wrapper.vm.setOriginalData).toHaveBeenCalledTimes(1);
      });

      it('opens a toast with a success message', async () => {
        await wrapper.vm.submitEditTeam();
        expect(wrapper.vm.$toasted.global.success).toHaveBeenLastCalledWith('teams.team_updated');
      });

      it('resets the form validation', async () => {
        await wrapper.vm.submitCreateTeam();
        expect(wrapper.vm.resetFormValidation).toHaveBeenCalledTimes(1);
      });

      it('calls loadTeamFromState on error', async () => {
        jest.spyOn(wrapper.vm, 'loadTeamFromState');
        jest.spyOn(wrapper.vm.$storage.team.actions, 'editTeam').mockImplementation(() => {
          throw new Error([]);
        });
        wrapper.vm.$reportToasted = jest.fn();
        await wrapper.vm.submitEditTeam();
        expect(wrapper.vm.loadTeamFromState).toBeCalled();
      });
    });

    describe('Error Dialog', () => {
      let element;
      beforeEach(async () => {
        wrapper.vm.showErrorDialog = true;
        await wrapper.vm.$nextTick();
        element = wrapper.find('[data-test="createEditTeam__ErrorDialog"]');
      });

      it('displays the dialog when showErrorDialog is true', async () => {
        expect(element.exists()).toBeTruthy();
      });

      it('should not display the dialog when showErrorDialog is false', async () => {
        wrapper.vm.showErrorDialog = false;
        await wrapper.vm.$nextTick();
        expect(element.exists()).toBeFalsy();
      });
    });

    describe('prepareCreateTeam', () => {
      it('sets the right team type for standard team type in create mode', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            teamType: 'standard',
          },
          mocks: {
            $storage: storage,
          },
          computed: {
            isEditMode() {
              return false;
            },
          },
        });
        await wrapper.vm.prepareCreateTeam();
        expect(wrapper.vm.team.teamType).toEqual(TeamType.Standard);
      });

      it('sets the right team type for adhoc team type in create mode', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            teamType: 'adhoc',
          },
          mocks: {
            $storage: storage,
          },
          computed: {
            isEditMode() {
              return false;
            },
          },
        });
        await wrapper.vm.prepareCreateTeam();
        expect(wrapper.vm.team.teamType).toEqual(TeamType.AdHoc);
      });
    });

    describe('fetchUserAccounts', () => {
      it('should call fetchAll actions', async () => {
        await wrapper.vm.fetchUserAccounts();
        expect(wrapper.vm.$storage.userAccount.actions.fetchAll).toBeCalled();
      });
    });

    describe('setPrimaryContactTeam', () => {
      it('should set the primary contact of the team', async () => {
        await wrapper.setData({ currentPrimaryContact: { id: 'abcde' } });
        wrapper.vm.team.setPrimaryContact = jest.fn();
        wrapper.vm.setPrimaryContactTeam();
        expect(wrapper.vm.team.setPrimaryContact).toHaveBeenCalledWith({
          id: 'abcde',
          isPrimaryContact: true,
        });
      });
    });
  });
});
