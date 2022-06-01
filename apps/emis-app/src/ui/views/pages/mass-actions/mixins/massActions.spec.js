import { mockStorage } from '@libs/registration-lib/store/storage';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import helpers from '@/ui/helpers/helpers';
import massActions from './massActions';

const Component = {
  render() {},
  mixins: [massActions],
};

const localVue = createLocalVue();
const storage = mockStorage();
let wrapper;

describe('massActions', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    wrapper = shallowMount(Component, {
      localVue,
      mocks: {
        $storage: storage,
      },
    });
  });

  describe('Methods', () => {
    describe('onClick', () => {
      it('should trigger proper method exportImpactValidation', () => {
        wrapper.vm.exportImpactValidation = jest.fn();
        wrapper.vm.onClick('exportImpactValidation');
        expect(wrapper.vm.exportImpactValidation).toHaveBeenCalledTimes(1);
      });

      it('should trigger proper method generateFundingRequest', () => {
        wrapper.vm.generateFundingRequest = jest.fn();
        wrapper.vm.onClick('generateFundingRequest');
        expect(wrapper.vm.generateFundingRequest).toHaveBeenCalledTimes(1);
      });

      it('should trigger proper method downloadImportPaymentStatusesTemplate', () => {
        wrapper.vm.downloadImportPaymentStatusesTemplate = jest.fn();
        wrapper.vm.onClick('downloadImportPaymentStatusesTemplate');
        expect(wrapper.vm.downloadImportPaymentStatusesTemplate).toHaveBeenCalledTimes(1);
      });

      it('should trigger proper method downloadImportUsersTemplate', () => {
        wrapper.vm.downloadImportUsersTemplate = jest.fn();
        wrapper.vm.onClick('downloadImportUsersTemplate');
        expect(wrapper.vm.downloadImportUsersTemplate).toHaveBeenCalledTimes(1);
      });
    });

    describe('filterItems', () => {
      it('returns items for which user has the proper level', async () => {
        const items = [
          {
            to: 'routes.home.name',
            text: 'leftMenu.home_title',
            test: 'home',
            level: 'level1',
          },
          {
            to: 'routes.caseFile.home.name',
            text: 'leftMenu.caseFiles_title',
            test: 'caseFile',
            level: 'level6',
          },
        ];
        await wrapper.setRole('level1');
        expect(wrapper.vm.filterItems(items)).toMatchObject([items[0]]);
      });

      it('returns items for which user has the proper role', async () => {
        const items = [
          {
            to: 'routes.home.name',
            icon: 'mdi-home',
            text: 'leftMenu.home_title',
            test: 'home',
            level: 'level1',
          },
          {
            to: 'routes.caseFile.home.name',
            icon: 'mdi-clipboard-text',
            text: 'leftMenu.caseFiles_title',
            test: 'caseFile',
            level: 'level6',
            roles: ['contributorIM'],
          },
        ];
        await wrapper.setRole('contributorIM');
        expect(wrapper.vm.filterItems(items)).toMatchObject([items[1]]);
      });

      it('returns items for which user has the proper role', async () => {
        const items = [
          {
            to: 'routes.home.name',
            icon: 'mdi-home',
            text: 'leftMenu.home_title',
            test: 'home',
            level: 'level1',
          },
          {
            to: 'routes.caseFile.home.name',
            icon: 'mdi-clipboard-text',
            text: 'leftMenu.caseFiles_title',
            test: 'caseFile',
            level: 'level6',
            roles: ['contributorIM'],
          },
        ];
        await wrapper.setRole('contributorIM');
        expect(wrapper.vm.filterItems(items)).toMatchObject([items[1]]);
      });

      it('returns items for which user has the feature key', async () => {
        const items = [
          {
            to: 'routes.caseFile.home.name',
            icon: 'mdi-clipboard-text',
            text: 'leftMenu.caseFiles_title',
            test: 'caseFile',
            level: 'level6',
            roles: ['contributorIM'],
            feature: 'feature key-2',
          },
        ];
        await wrapper.setRole('level6');
        expect(wrapper.vm.filterItems(items)).toMatchObject(items);
      });
    });

    describe('exportImpactValidation', () => {
      it('should set showExportValidationImpact to true', () => {
        expect(wrapper.vm.showExportValidationImpact).toBe(false);
        wrapper.vm.exportImpactValidation();
        expect(wrapper.vm.showExportValidationImpact).toBe(true);
      });
    });

    describe('generateFundingRequest', () => {
      it('should do nothing', () => {
        expect(wrapper.vm.generateFundingRequest()).toBe(false);
      });
    });

    describe('downloadImportPaymentStatusesTemplate', () => {
      it('should call downloadBlob with proper params', () => {
        const fileName = 'ImportPaymentStatusesTemplate.csv';
        const blob = new Blob(['PaymentGroupId,Status,CancellationReason'], { type: 'text/csv' });
        helpers.downloadBlob = jest.fn();

        wrapper.vm.downloadImportPaymentStatusesTemplate();

        expect(helpers.downloadBlob).toHaveBeenCalledWith(blob, fileName);
      });
    });

    describe('downloadImportUsersTemplate', () => {
      it('should call downloadBlob with proper params', () => {
        const fileName = 'ImportUsersTemplate.csv';
        const blob = new Blob(['FirstName,LastName,Email,Role'], { type: 'text/csv' });
        helpers.downloadBlob = jest.fn();

        wrapper.vm.downloadImportUsersTemplate();

        expect(helpers.downloadBlob).toHaveBeenCalledWith(blob, fileName);
      });
    });
  });
});
