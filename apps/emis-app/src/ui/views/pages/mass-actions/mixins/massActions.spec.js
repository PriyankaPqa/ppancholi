import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import helpers from '@/ui/helpers/helpers';
import { MassActionDataCorrectionType } from '@libs/entities-lib/mass-action';
import { getPiniaForUser } from '@/pinia/user/user.mock';
import { useMockTenantSettingsStore } from '@libs/stores-lib/tenant-settings/tenant-settings.mock';
import { UserRoles } from '@libs/entities-lib/user';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import massActions from './massActions';
/* eslint-disable max-len */
const Component = {
  render() {},
  mixins: [massActions],
};

const localVue = createLocalVue();
let wrapper;

const doMount = (fullMount = false, pinia = getPiniaForUser(UserRoles.level6), additionalOverwrites = {}, featureList = []) => {
  useMockTenantSettingsStore(pinia);
  wrapper = (fullMount ? mount : shallowMount)(Component, {
    localVue,
    featureList,
    pinia,
    ...additionalOverwrites,
  });
};

describe('massActions', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    doMount();
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
        wrapper.vm.downloadTemplate = jest.fn();
        wrapper.vm.onClick('downloadImportPaymentStatusesTemplate');
        expect(wrapper.vm.downloadTemplate).toHaveBeenCalledWith('ImportPaymentStatusesTemplate.csv', 'PaymentGroupId,Status,CancellationReason,ActualDate');
      });

      it('should trigger proper method downloadImportUsersTemplate', () => {
        wrapper.vm.downloadTemplate = jest.fn();
        wrapper.vm.onClick('downloadImportUsersTemplate');
        expect(wrapper.vm.downloadTemplate).toHaveBeenCalledWith('ImportUsersTemplate.csv', 'FirstName,LastName,Email,Role');
      });

      it('should trigger proper method downloadFACustomTemplate', () => {
        wrapper.vm.downloadApiTemplate = jest.fn();
        wrapper.vm.onClick('downloadFACustomTemplate');
        expect(wrapper.vm.downloadApiTemplate).toHaveBeenCalledWith(15);
      });
    });

    describe('onClickMenu', () => {
      it('should trigger proper method for downloadDataCorrectionTemplate', () => {
        wrapper.vm.downloadDataCorrectionTemplate = jest.fn();
        wrapper.vm.onClickMenu('downloadDataCorrectionTemplate', 1);
        expect(wrapper.vm.downloadDataCorrectionTemplate).toHaveBeenCalledWith(1);
      });
    });

    describe('filterItems', () => {
      it('returns items for which user has the proper level', async () => {
        const items = [
          {
            to: 'routes.home.name',
            text: 'leftMenu.home_title',
            test: 'home',
            level: UserRoles.level1,
          },
          {
            to: 'routes.caseFile.home.name',
            text: 'leftMenu.caseFiles_title',
            test: 'caseFile',
            level: UserRoles.level6,
          },
        ];
        doMount(false, getPiniaForUser(UserRoles.level1));
        expect(wrapper.vm.filterItems(items)).toMatchObject([items[0]]);
      });

      it('returns items for which user has the proper role', async () => {
        const items = [
          {
            to: 'routes.home.name',
            icon: 'mdi-home',
            text: 'leftMenu.home_title',
            test: 'home',
            level: UserRoles.level1,
          },
          {
            to: 'routes.caseFile.home.name',
            icon: 'mdi-clipboard-text',
            text: 'leftMenu.caseFiles_title',
            test: 'caseFile',
            level: UserRoles.level6,
            roles: [UserRoles.contributorIM],
          },
        ];
        doMount(false, getPiniaForUser(UserRoles.contributorIM));
        expect(wrapper.vm.filterItems(items)).toMatchObject([items[1]]);
      });

      it('returns items for which user has the proper role', async () => {
        const items = [
          {
            to: 'routes.home.name',
            icon: 'mdi-home',
            text: 'leftMenu.home_title',
            test: 'home',
            level: UserRoles.level1,
          },
          {
            to: 'routes.caseFile.home.name',
            icon: 'mdi-clipboard-text',
            text: 'leftMenu.caseFiles_title',
            test: 'caseFile',
            level: UserRoles.level6,
            roles: [UserRoles.contributorIM],
          },
        ];
        doMount(false, getPiniaForUser(UserRoles.contributorIM));
        expect(wrapper.vm.filterItems(items)).toMatchObject([items[1]]);
      });

      it('returns items for which user has the feature key', () => {
        doMount(false, getPiniaForUser(UserRoles.level6));
        wrapper.vm.$hasFeature = jest.fn((f) => f === 'feature key-2');
        const items = [
          {
            to: 'routes.caseFile.home.name',
            icon: 'mdi-clipboard-text',
            text: 'leftMenu.caseFiles_title',
            test: 'caseFile',
            level: UserRoles.level6,
            roles: [UserRoles.contributorIM],
            feature: 'feature key-2',
          },
        ];
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

    describe('downloadDataCorrectionTemplate', () => {
      it('should call downloadTemplate with proper data for ContactInformation', () => {
        wrapper.vm.downloadTemplate = jest.fn();
        wrapper.vm.downloadDataCorrectionTemplate(MassActionDataCorrectionType.ContactInformation);
        expect(wrapper.vm.downloadTemplate)
          // eslint-disable-next-line vue/max-len
          .toHaveBeenCalledWith('ContactInformationTemplate.csv', 'PersonId,PrimarySpokenLanguageSpecifiedOther,HomePhoneNumber,MobilePhoneNumber,AlternatePhoneNumber,AlternatePhoneNumberExtension,ETag');
      });

      it('should call downloadTemplate with proper data for HomeAddress', () => {
        wrapper.vm.downloadTemplate = jest.fn();
        wrapper.vm.downloadDataCorrectionTemplate(MassActionDataCorrectionType.HomeAddress);
        expect(wrapper.vm.downloadTemplate)
          .toHaveBeenCalledWith('HomeAddressTemplate.csv', 'HouseholdId,StreetAddress,UnitSuite,City,ProvinceEn,PostalCode,SpecifiedOtherProvince,Country,ETag');
      });

      it('should call downloadTemplate with proper data for AuthenticationSpecifiedOther', () => {
        wrapper.vm.downloadTemplate = jest.fn();
        wrapper.vm.downloadDataCorrectionTemplate(MassActionDataCorrectionType.AuthenticationSpecifiedOther);
        expect(wrapper.vm.downloadTemplate).toHaveBeenCalledWith('AuthenticationSpecifiedOtherTemplate.csv', 'CaseFileId,AuthenticationSpecifiedOther,ETag');
      });

      it('should call downloadTemplate with proper data for Labels', () => {
        wrapper.vm.downloadTemplate = jest.fn();
        wrapper.vm.downloadDataCorrectionTemplate(MassActionDataCorrectionType.Labels);
        expect(wrapper.vm.downloadTemplate).toHaveBeenCalledWith('LabelsTemplate.csv', 'CaseFileId,LabelName1,LabelName2,LabelName3,LabelName4,ETag');
      });

      it('should call downloadTemplate with proper data for IdentitySet', () => {
        wrapper.vm.downloadTemplate = jest.fn();
        wrapper.vm.downloadDataCorrectionTemplate(MassActionDataCorrectionType.IdentitySet);
        expect(wrapper.vm.downloadTemplate).toHaveBeenCalledWith('IdentitySetTemplate.csv', 'PersonId,FirstName,LastName,MiddleName,GenderSpecifiedOther,ETag');
      });

      it('should call downloadTemplate with proper data for TemporaryAddress when feature flag Impacted Individuals is off', () => {
        wrapper.vm.downloadTemplate = jest.fn();
        wrapper.vm.downloadDataCorrectionTemplate(MassActionDataCorrectionType.TemporaryAddress);
        expect(wrapper.vm.downloadTemplate)
          // eslint-disable-next-line vue/max-len
          .toHaveBeenCalledWith('TemporaryAddressTemplate.csv', 'PersonId,PlaceName,StreetAddress,PlaceNumber,UnitSuite,City,PostalCode,ProvinceEn,SpecifiedOtherProvince,ETag');
      });

      it('should call downloadTemplate with proper data for TemporaryAddress when feature flag Impacted Individuals is on', () => {
        doMount(false, getPiniaForUser(UserRoles.level6), {}, [FeatureKeys.ImpactedIndividuals]);
        wrapper.vm.downloadTemplate = jest.fn();
        wrapper.vm.downloadDataCorrectionTemplate(MassActionDataCorrectionType.TemporaryAddress);
        expect(wrapper.vm.downloadTemplate)
          // eslint-disable-next-line vue/max-len
          .toHaveBeenCalledWith('TemporaryAddressTemplate.csv', 'PersonId,PlaceName,StreetAddress,PlaceNumber,UnitSuite,City,PostalCode,ProvinceEn,SpecifiedOtherProvince,CrcProvided,CheckIn,CheckOut,ETag');
      });

      it('should call downloadApiTemplate for FinancialAssistance', () => {
        wrapper.vm.downloadApiTemplate = jest.fn();
        wrapper.vm.downloadDataCorrectionTemplate(MassActionDataCorrectionType.FinancialAssistance);
        expect(wrapper.vm.downloadApiTemplate).toHaveBeenCalledWith(MassActionDataCorrectionType.FinancialAssistance);
      });
    });

    describe('downloadTemplate', () => {
      it('should call downloadBlob with proper params', () => {
        const fileName = 'fileName';
        const blobParts = 'PaymentGroupId,Status,CancellationReason';
        const blob = new Blob([blobParts], { type: 'text/csv' });
        helpers.downloadBlob = jest.fn();

        wrapper.vm.downloadTemplate(fileName, [blobParts]);

        expect(helpers.downloadBlob).toHaveBeenCalledWith(blob, fileName);
      });
    });
  });
});
