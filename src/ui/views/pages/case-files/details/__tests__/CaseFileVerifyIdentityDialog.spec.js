/* eslint-disable no-unused-vars */
import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';

import { IdentityAuthenticationMethod, IdentityAuthenticationStatus } from '@/entities/case-file';
import Component from '../components/CaseFileVerifyIdentityDialog.vue';

const localVue = createLocalVue();

describe('CaseFileVerifyIdentityDialog.vue', () => {
  let wrapper;
  let storage;

  beforeEach(async () => {
    storage = mockStorage();
    wrapper = await mount(Component, {
      localVue,
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
      mocks: {
        $storage: storage,
      },
    });
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
    test('Help button exists and has the correct link', () => {
      const helpButton = wrapper.find('[data-test="showHelp"]');
      expect(helpButton.exists()).toBe(true);
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
          propsData: {
            show: true,
            caseFile: {
              id: 'a612c472-95b7-4983-99c0-3ee9c4946b45',
              identityAuthentication: null,
            },
          },
          mocks: {
            $storage: storage,
          },
        });
        expect(wrapper.vm.form.method).toEqual(IdentityAuthenticationMethod.NotApplicable);
        expect(wrapper.vm.form.status).toEqual(IdentityAuthenticationStatus.NotVerified);
        expect(wrapper.vm.form.identificationIds).toEqual([]);
      });

      it('sets form when identityAuthentication is passed', async () => {
        wrapper = await shallowMount(Component, {
          localVue,
          propsData: {
            show: true,
            caseFile: {
              id: 'a612c472-95b7-4983-99c0-3ee9c4946b45',
              identityAuthentication: {
                method: IdentityAuthenticationMethod.Exceptional,
                status: IdentityAuthenticationStatus.Passed,
                identificationIds: ['abc'],
              },
            },
          },
          mocks: {
            $storage: storage,
          },
        });

        expect(wrapper.vm.form.method).toEqual(IdentityAuthenticationMethod.Exceptional);
        expect(wrapper.vm.form.status).toEqual(IdentityAuthenticationStatus.Passed);
        expect(wrapper.vm.form.identificationIds).toEqual(['abc']);
      });

      it('calls fetchScreeningIds', async () => {
        expect(storage.caseFile.actions.fetchScreeningIds).toHaveBeenCalled();
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
      it('calls storage for screeningIds and passes current value', async () => {
        await wrapper.setData({ form: { identificationIds: ['abc'] } });
        wrapper.vm.$storage.caseFile.getters.screeningIds = jest.fn();
        let opt = wrapper.vm.verificationOptions;
        expect(wrapper.vm.$storage.caseFile.getters.screeningIds).toHaveBeenCalledWith(true, ['abc']);
        await wrapper.setData({ form: { identificationIds: [] } });
        opt = wrapper.vm.verificationOptions;
        expect(wrapper.vm.$storage.caseFile.getters.screeningIds).toHaveBeenCalledWith(true, []);
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

    describe('watcher isValidAuthStatus', () => {
      it('empties form when validation of identity isnt ok', async () => {
        await wrapper.setData({
          form: {
            identificationIds: ['abc'],
            method: IdentityAuthenticationMethod.Exceptional,
          },
        });
        await wrapper.setData({
          form: {
            status: IdentityAuthenticationStatus.Passed,
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
    describe('Save', () => {
      it('saves changes and triggers a toast', async () => {
        wrapper.vm.$toasted.global.success = jest.fn();
        await wrapper.setData({
          form: {
            method: IdentityAuthenticationMethod.Exceptional,
            status: IdentityAuthenticationStatus.Passed,
            identificationIds: ['abc'],
          },
        });

        await wrapper.vm.save();
        expect(storage.caseFile.actions.setCaseFileIdentityAuthentication).toHaveBeenCalledWith(wrapper.vm.caseFile.id, {
          method: IdentityAuthenticationMethod.Exceptional,
          status: IdentityAuthenticationStatus.Passed,
          identificationIds: ['abc'],
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
        expect(storage.caseFile.actions.setCaseFileIdentityAuthentication).toHaveBeenCalledTimes(0);
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
        expect(storage.caseFile.actions.setCaseFileIdentityAuthentication).toHaveBeenCalledTimes(0);
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
        expect(storage.caseFile.actions.setCaseFileIdentityAuthentication).toHaveBeenCalledTimes(0);
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledTimes(0);
        expect(wrapper.emitted('update:show')).toBeUndefined();
      });
    });
  });
});
