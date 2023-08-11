/* eslint-disable no-unused-vars */
import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockOptionItemData } from '@libs/entities-lib/optionItem';
import { IdentityAuthenticationMethod, IdentityAuthenticationStatus } from '@libs/entities-lib/case-file';
import { useMockCaseFileStore } from '@/pinia/case-file/case-file.mock';

import flushPromises from 'flush-promises';
import { useMockEventStore } from '@/pinia/event/event.mock';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import Component from '../components/CaseFileVerifyIdentityDialog.vue';

const localVue = createLocalVue();
const { pinia, caseFileStore } = useMockCaseFileStore();
const eventStore = useMockEventStore(pinia).eventStore;

describe('CaseFileVerifyIdentityDialog.vue', () => {
  let wrapper;

  beforeEach(async () => {
    wrapper = await mount(Component, {
      localVue,
      featureList: [FeatureKeys.AuthenticationPhaseII],
      pinia,
      propsData: {
        show: true,
        caseFile: {
          id: 'a612c472-95b7-4983-99c0-3ee9c4946b45',
          identityAuthentication: {
            method: IdentityAuthenticationMethod.NotApplicable,
            status: IdentityAuthenticationStatus.NotVerified,
            identificationIds: [],
          },
        },
      },

    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Template', () => {
    describe('Information are correctly loaded', () => {
      it('preselects status correctly', () => {
        const inputSelect = wrapper.find('[data-test="status-notVerified"]');
        expect(inputSelect.element.checked).toBe(true);
      });
      it('when status is not verified other values are not applicable and fields are disabled', () => {
        let inputSelect = wrapper.find('[data-test="verifyIdentity_method"]');
        expect(inputSelect.text()).toBe('​common.notApplicable');
        expect(inputSelect.attributes('disabled')).toBe('disabled');
        inputSelect = wrapper.find('[data-test="verifyIdentity_options"]');
        expect(inputSelect.text()).toBe('​common.notApplicable');
        expect(inputSelect.attributes('disabled')).toBe('disabled');
      });
      it('when status is verified other values are applicable and fields are not disabled', async () => {
        await wrapper.setData({ form: { status: IdentityAuthenticationStatus.Passed } });
        let inputSelect = wrapper.find('[data-test="verifyIdentity_method"]');
        expect(inputSelect.text()).not.toBe('​common.notApplicable');
        expect(inputSelect.attributes('disabled')).not.toBe('disabled');
        inputSelect = wrapper.find('[data-test="verifyIdentity_options"]');
        expect(inputSelect.text()).not.toBe('​common.notApplicable');
        expect(inputSelect.attributes('disabled')).not.toBe('disabled');
      });
    });
    it('should be hidden for now (help button exists and has the correct link)', () => {
      const helpButton = wrapper.find('[data-test="showHelp"]');
      expect(helpButton.exists()).toBe(false);
      expect(wrapper.vm.helpLink).toBe('zendesk.authentication_identity');
    });

    test('Cancel button is linked to proper translation', () => {
      const cancel = wrapper.find('[data-test="dialog-cancel-action"]');
      expect(cancel.text()).toBe('common.cancel');
    });

    describe('Created', () => {
      it('sets default when no identityAuthentication is passed', async () => {
        wrapper = await shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            show: true,
            caseFile: {
              id: 'a612c472-95b7-4983-99c0-3ee9c4946b45',
              identityAuthentication: null,
            },
          },

        });

        await flushPromises();
        expect(wrapper.vm.form.method).toEqual(IdentityAuthenticationMethod.NotApplicable);
        expect(wrapper.vm.form.status).toEqual(IdentityAuthenticationStatus.NotVerified);
        expect(wrapper.vm.form.identificationIds).toEqual([]);
        expect(wrapper.vm.form.specifiedOther).toEqual(null);
        expect(wrapper.vm.form.exceptionalTypeId).toEqual('defaultOption');
        expect(wrapper.vm.form.exceptionalTypeOther).toBeFalsy();
      });

      it('sets form when identityAuthentication is passed', async () => {
        wrapper = await shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            show: true,
            caseFile: {
              id: 'a612c472-95b7-4983-99c0-3ee9c4946b45',
              identityAuthentication: {
                method: IdentityAuthenticationMethod.Exceptional,
                status: IdentityAuthenticationStatus.Passed,
                identificationIds: [{ optionItemId: 'abc', specifiedOther: 'def' }],
                exceptionalAuthenticationTypeId: { optionItemId: 'abc123', specifiedOther: 'def123' },
              },
            },
          },

        });
        await flushPromises();

        expect(wrapper.vm.form.method).toEqual(IdentityAuthenticationMethod.Exceptional);
        expect(wrapper.vm.form.status).toEqual(IdentityAuthenticationStatus.Passed);
        expect(wrapper.vm.form.identificationIds).toEqual(['abc']);
        expect(wrapper.vm.form.specifiedOther).toEqual('def');
        expect(wrapper.vm.form.exceptionalTypeId).toEqual('abc123');
        expect(wrapper.vm.form.exceptionalTypeOther).toEqual('def123');
      });

      it('calls stores', async () => {
        expect(caseFileStore.fetchScreeningIds).toHaveBeenCalled();
        expect(eventStore.fetchExceptionalAuthenticationTypes).toHaveBeenCalled();
      });

      it('should display the status and method from with the data from BE during the initial loading', async () => {
        await wrapper.setProps({
          show: true,
          caseFile: {
            id: 'a612c472-95b7-4983-99c0-3ee9c4946b45',
            identityAuthentication: {
              method: IdentityAuthenticationMethod.System,
              status: IdentityAuthenticationStatus.Failed,
              identificationIds: [],
            },
          },
        });
        await flushPromises();
        wrapper.vm.form.method = wrapper.vm.caseFile.identityAuthentication.method;
        wrapper.vm.form.status = wrapper.vm.caseFile.identityAuthentication.status;
        expect(wrapper.vm.form.status).toEqual(IdentityAuthenticationStatus.Failed);
        expect(wrapper.vm.form.method).toEqual(IdentityAuthenticationMethod.System);
      });
    });

    describe('verifyIdentity_status radio', () => {
      it('should call onStatusChange when emitted change event', async () => {
        wrapper.vm.onStatusChange = jest.fn();
        await wrapper.setData({ form: { status: IdentityAuthenticationStatus.Passed, method: IdentityAuthenticationMethod.System } });
        const element = wrapper.findDataTest('verifyIdentity_status');
        await element.vm.$emit('change');
        expect(wrapper.vm.onStatusChange).toHaveBeenCalled();
      });
    });
  });

  describe('Computed', () => {
    describe('verificationMethods', () => {
      it('Returns the list of verification methods, with system disabled, no N/A', () => {
        const verifs = wrapper.vm.verificationMethods;
        expect(verifs.length).toBe(3);
        expect(verifs.filter((x) => x.value === IdentityAuthenticationMethod.NotApplicable).length).toBe(0);
        expect(verifs.filter((x) => x.value === IdentityAuthenticationMethod.System && x.disabled).length).toBe(1);
        expect(verifs.filter((x) => x.disabled).length).toBe(1);
      });
    });

    describe('verificationOptions', () => {
      it('calls the store for screeningIds and passes current value', async () => {
        await wrapper.setData({ form: { identificationIds: ['abc'] } });
        expect(caseFileStore.getScreeningIds).toHaveBeenCalledWith(true, ['abc']);
        await wrapper.setData({ form: { identificationIds: [] } });
        expect(caseFileStore.getScreeningIds).toHaveBeenCalledWith(true, []);
      });
    });

    describe('exceptionalTypes', () => {
      it('calls the store for exceptionalTypes and passes current value', async () => {
        await wrapper.setData({ form: { exceptionalTypeId: 'abc' } });
        expect(eventStore.getExceptionalAuthenticationTypes).toHaveBeenCalledWith(true, 'abc', eventStore.getById());
        expect(eventStore.getById).toHaveBeenCalledWith(wrapper.vm.caseFile.eventId);
        await wrapper.setData({ form: { exceptionalTypeId: null } });
        expect(eventStore.getExceptionalAuthenticationTypes).toHaveBeenCalledWith(true, null, eventStore.getById());
      });
    });

    describe('isValidAuthStatus', () => {
      it('is valid when status === IdentityAuthenticationStatus.Passed', async () => {
        await wrapper.setData({ form: { status: IdentityAuthenticationStatus.Passed } });
        expect(wrapper.vm.isValidAuthStatus).toBeTruthy();
        await wrapper.setData({ form: { status: IdentityAuthenticationStatus.Failed } });
        expect(wrapper.vm.isValidAuthStatus).toBeFalsy();
        await wrapper.setData({ form: { status: IdentityAuthenticationStatus.NotVerified } });
        expect(wrapper.vm.isValidAuthStatus).toBeFalsy();
      });
    });

    describe('canSelectIds', () => {
      it('returns true when status === IdentityAuthenticationStatus.Passed and not System', async () => {
        await wrapper.setData({ form: { status: IdentityAuthenticationStatus.Passed, method: IdentityAuthenticationMethod.InPerson } });
        expect(wrapper.vm.canSelectIds).toBeTruthy();
        await wrapper.setData({ form: { status: IdentityAuthenticationStatus.Passed, method: IdentityAuthenticationMethod.System } });
        expect(wrapper.vm.canSelectIds).toBeFalsy();
        await wrapper.setData({ form: { status: IdentityAuthenticationStatus.Failed, method: IdentityAuthenticationMethod.InPerson } });
        expect(wrapper.vm.canSelectIds).toBeFalsy();
        await wrapper.setData({ form: { status: IdentityAuthenticationStatus.NotVerified, method: IdentityAuthenticationMethod.InPerson } });
        expect(wrapper.vm.canSelectIds).toBeFalsy();
      });
    });

    describe('mustSpecifyOther', () => {
      it('returns true selected ids contains one option with isOther = true', async () => {
        const withOther = mockOptionItemData().filter((m) => m.isOther)[0].id;
        const notOther = mockOptionItemData().filter((m) => !m.isOther)[0].id;
        await wrapper.setData({
          form: { status: IdentityAuthenticationStatus.Passed, method: IdentityAuthenticationMethod.InPerson, identificationIds: [] },
        });
        expect(wrapper.vm.mustSpecifyOther).toBeFalsy();
        await wrapper.setData({
          form: { status: IdentityAuthenticationStatus.Passed, method: IdentityAuthenticationMethod.InPerson, identificationIds: [notOther] },
        });
        expect(wrapper.vm.mustSpecifyOther).toBeFalsy();
        await wrapper.setData({
          form: {
            status: IdentityAuthenticationStatus.Passed,
            method: IdentityAuthenticationMethod.InPerson,
            identificationIds: [withOther],
          },
        });
        expect(wrapper.vm.mustSpecifyOther).toBeTruthy();
        await wrapper.setData({
          form: {
            status: IdentityAuthenticationStatus.Passed,
            method: IdentityAuthenticationMethod.InPerson,
            identificationIds: [notOther, withOther],
          },
        });
        expect(wrapper.vm.mustSpecifyOther).toBeTruthy();
      });
    });

    describe('exceptionalMustSpecifyOther', () => {
      it('returns true selected item has isOther = true', async () => {
        const withOther = mockOptionItemData().filter((m) => m.isOther)[0].id;
        const notOther = mockOptionItemData().filter((m) => !m.isOther)[0].id;
        await wrapper.setData({
          form: { status: IdentityAuthenticationStatus.Passed, method: IdentityAuthenticationMethod.InPerson, exceptionalTypeId: null },
        });
        expect(wrapper.vm.exceptionalMustSpecifyOther).toBeFalsy();
        await wrapper.setData({
          form: { status: IdentityAuthenticationStatus.Passed, method: IdentityAuthenticationMethod.InPerson, exceptionalTypeId: notOther },
        });
        expect(wrapper.vm.exceptionalMustSpecifyOther).toBeFalsy();
        await wrapper.setData({
          form: {
            status: IdentityAuthenticationStatus.Passed,
            method: IdentityAuthenticationMethod.InPerson,
            exceptionalTypeId: withOther,
          },
        });
        expect(wrapper.vm.exceptionalMustSpecifyOther).toBeTruthy();
      });
    });

    describe('watcher isValidAuthStatus', () => {
      it('empties form when validation of identity isnt ok', async () => {
        await wrapper.setData({
          form: {
            identificationIds: ['abc'],
            status: IdentityAuthenticationStatus.Passed,
          },
        });
        await wrapper.setData({
          form: {
            method: IdentityAuthenticationMethod.Exceptional,
          },
        });
        expect(wrapper.vm.form.identificationIds).toEqual(['abc']);
        expect(wrapper.vm.form.method).toBe(IdentityAuthenticationMethod.Exceptional);
        await wrapper.setData({ form: { status: IdentityAuthenticationStatus.Failed } });
        expect(wrapper.vm.form.identificationIds).toEqual([]);
        expect(wrapper.vm.form.method).toBe(IdentityAuthenticationMethod.NotApplicable);
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe('Save', () => {
      it('saves changes and triggers a toast', async () => {
        wrapper.vm.$toasted.global.success = jest.fn();
        const withOther = mockOptionItemData().filter((m) => m.isOther)[0].id;
        await wrapper.setData({
          form: {
            status: IdentityAuthenticationStatus.Passed,
            method: IdentityAuthenticationMethod.Exceptional,
            identificationIds: [withOther],
            specifiedOther: 'xxx',
            exceptionalTypeId: 'exid',
            exceptionalTypeOther: 'exceptionalTypeOther',
          },
        });
        await wrapper.vm.save();
        expect(caseFileStore.setCaseFileIdentityAuthentication).toHaveBeenCalledWith(wrapper.vm.caseFile.id, {
          status: IdentityAuthenticationStatus.Passed,
          method: IdentityAuthenticationMethod.Exceptional,
          identificationIds: [{ optionItemId: withOther, specifiedOther: 'xxx' }],
          exceptionalAuthenticationTypeId: { optionItemId: 'exid', specifiedOther: 'exceptionalTypeOther' },
        });
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledTimes(1);
        expect(wrapper.emitted('update:show')[0][0]).toEqual(false);
      });

      it('includes exceptionalAuthenticationType only when exceptional', async () => {
        wrapper.vm.$toasted.global.success = jest.fn();
        const withOther = mockOptionItemData().filter((m) => m.isOther)[0].id;
        await wrapper.setData({
          form: {
            status: IdentityAuthenticationStatus.Passed,
            method: IdentityAuthenticationMethod.InPerson,
            identificationIds: [withOther],
            specifiedOther: 'xxx',
            exceptionalTypeId: 'exid',
            exceptionalTypeOther: 'exceptionalTypeOther',
          },
        });
        await wrapper.vm.save();
        expect(caseFileStore.setCaseFileIdentityAuthentication).toHaveBeenCalledWith(wrapper.vm.caseFile.id, {
          status: IdentityAuthenticationStatus.Passed,
          method: IdentityAuthenticationMethod.InPerson,
          identificationIds: [{ optionItemId: withOther, specifiedOther: 'xxx' }],
        });
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledTimes(1);
        expect(wrapper.emitted('update:show')[0][0]).toEqual(false);
      });

      it('saves changes and closes only when valid - method invalid', async () => {
        wrapper.vm.$toasted.global.success = jest.fn();
        await wrapper.setData({
          form: {
            // method invalid
            method: IdentityAuthenticationMethod.NotApplicable,
            status: IdentityAuthenticationStatus.Passed,
            identificationIds: ['abc'],
          },
        });

        await wrapper.vm.save();
        expect(caseFileStore.setCaseFileIdentityAuthentication).toHaveBeenCalledTimes(0);
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledTimes(0);
        expect(wrapper.emitted('update:show')).toBeUndefined();
      });

      it('saves changes and closes only when valid - need ids', async () => {
        wrapper.vm.$toasted.global.success = jest.fn();

        await wrapper.setData({
          form: {
            method: IdentityAuthenticationMethod.Exceptional,
            status: IdentityAuthenticationStatus.Passed,
            // need ids
            identificationIds: [],
          },
        });

        await wrapper.vm.save();
        expect(caseFileStore.setCaseFileIdentityAuthentication).toHaveBeenCalledTimes(0);
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledTimes(0);
        expect(wrapper.emitted('update:show')).toBeUndefined();
      });

      it('saves changes and closes only when valid - method System', async () => {
        wrapper.vm.$toasted.global.success = jest.fn();
        await wrapper.setData({
          form: {
            // method invalid
            method: IdentityAuthenticationMethod.System,
            status: IdentityAuthenticationStatus.Passed,
            identificationIds: ['abc'],
          },
        });

        await wrapper.vm.save();
        expect(caseFileStore.setCaseFileIdentityAuthentication).toHaveBeenCalledTimes(0);
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledTimes(0);
        expect(wrapper.emitted('update:show')).toBeUndefined();
      });
    });

    describe('onStatusChange', () => {
      it('should set method to NotApplicate when onStatusChange has been called', async () => {
        await wrapper.setData({
          form: {
            method: IdentityAuthenticationMethod.System,
          },
        });
        wrapper.vm.onStatusChange();
        expect(wrapper.vm.form.method).toEqual(IdentityAuthenticationMethod.NotApplicable);
      });
    });
  });
});
