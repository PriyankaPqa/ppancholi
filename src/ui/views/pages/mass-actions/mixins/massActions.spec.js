import { mockStorage } from '@crctech/registration-lib/src/store/storage';
import { createLocalVue, shallowMount } from '@/test/testSetup';
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

      it('should trigger proper method downloadTemplate', () => {
        wrapper.vm.downloadTemplate = jest.fn();
        wrapper.vm.onClick('downloadTemplate');
        expect(wrapper.vm.downloadTemplate).toHaveBeenCalledTimes(1);
      });
    });

    describe('filterItemsOnLevelOrRole', () => {
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
        expect(wrapper.vm.filterItemsOnLevelOrRole(items)).toMatchObject([items[0]]);
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
        expect(wrapper.vm.filterItemsOnLevelOrRole(items)).toMatchObject([items[1]]);
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

    describe('downloadTemplate', () => {
      it('should do nothing', () => {
        expect(wrapper.vm.downloadTemplate()).toBe(false);
      });
    });
  });
});
