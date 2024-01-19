import Vue from 'vue';
import helpers from '@/ui/helpers/helpers';
import { ICardSettings } from '@/types/interfaces/ICardSettings';
import { MassActionDataCorrectionType, MassActionType } from '@libs/entities-lib/mass-action';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';

export interface IMassActionCards extends ICardSettings {
  group: number;
}
/* eslint-disable max-len */
export default Vue.extend({
  data() {
    return {
      showExportValidationImpact: false,
      templateData: {
        [MassActionDataCorrectionType.ContactInformation]: {
          fileName: 'ContactInformationTemplate.csv',
          blobsParts: 'PersonId,PrimarySpokenLanguageSpecifiedOther,HomePhoneNumber,MobilePhoneNumber,AlternatePhoneNumber,AlternatePhoneNumberExtension,ETag',
        },
        [MassActionDataCorrectionType.HomeAddress]: {
          fileName: 'HomeAddressTemplate.csv',
          blobsParts: 'HouseholdId,StreetAddress,UnitSuite,City,ProvinceEn,PostalCode,SpecifiedOtherProvince,Country,ETag',
        },
        [MassActionDataCorrectionType.AuthenticationSpecifiedOther]: {
          fileName: 'AuthenticationSpecifiedOtherTemplate.csv',
          blobsParts: 'CaseFileId,AuthenticationSpecifiedOther,ETag',
        },
        [MassActionDataCorrectionType.Labels]: {
          fileName: 'LabelsTemplate.csv',
          blobsParts: 'CaseFileId,LabelName1,LabelName2,LabelName3,LabelName4,ETag',
        },
        [MassActionDataCorrectionType.IdentitySet]: {
          fileName: 'IdentitySetTemplate.csv',
          blobsParts: 'PersonId,FirstName,LastName,MiddleName,GenderSpecifiedOther,ETag',
        },
        [MassActionDataCorrectionType.TemporaryAddress]: {
          fileName: 'TemporaryAddressTemplate.csv',
          blobsParts: 'PersonId,PlaceName,StreetAddress,PlaceNumber,UnitSuite,City,PostalCode,ProvinceEn,SpecifiedOtherProvince,CrcProvided,CheckIn,CheckOut,ETag',
        },
        [MassActionDataCorrectionType.FinancialAssistance]: {
          fileName: 'FinancialAssistanceTemplate.csv',
          blobsParts: 'TBD,ETag',
        },
        importPaymentStatuses: {
          fileName: 'ImportPaymentStatusesTemplate.csv', blobsParts: 'PaymentGroupId,Status,CancellationReason,ActualDate',
        },
        importUsers: {
          fileName: 'ImportUsersTemplate.csv', blobsParts: 'FirstName,LastName,Email,Role',
        },
      },
    };
  },
  methods: {
    filterItems(items: IMassActionCards[]) {
      return helpers.availableItems(this, items);
    },

    onClick(methodName: string) {
      switch (methodName) {
        case 'exportImpactValidation':
          this.exportImpactValidation();
          break;
        case 'generateFundingRequest':
          this.generateFundingRequest();
          break;
        case 'downloadImportPaymentStatusesTemplate':
          this.downloadTemplate(this.templateData.importPaymentStatuses.fileName, this.templateData.importPaymentStatuses.blobsParts);
          break;
        case 'downloadImportUsersTemplate':
          if (this.$hasFeature(FeatureKeys.UseIdentityServer)) {
            this.downloadApiTemplate(MassActionType.ImportUsers);
          } else {
            this.downloadTemplate(this.templateData.importUsers.fileName, this.templateData.importUsers.blobsParts);
          }
          break;
        case 'downloadFACustomTemplate':
          this.downloadApiTemplate(MassActionType.FinancialAssistanceCustomOptions);
          break;
        default:
      }
    },

    onClickMenu(methodName: string, itemValue: number) {
      if (methodName === 'downloadDataCorrectionTemplate') {
        this.downloadDataCorrectionTemplate(itemValue);
      }
    },

    exportImpactValidation() {
      this.showExportValidationImpact = true;
    },

    generateFundingRequest() {
      return false;
    },

    downloadTemplate(fileName: string, blobParts: string) {
      const blob = new Blob([blobParts], { type: 'text/csv' });
      helpers.downloadBlob(blob, fileName);
    },

    async downloadApiTemplate(massActionType: (MassActionDataCorrectionType | MassActionType)) {
      const res = await this.$services.massActions.downloadTemplate(massActionType);
      if (res) {
        helpers.downloadFile(res);
      }
    },

    async downloadDataCorrectionTemplate(massActionType: MassActionDataCorrectionType) {
      await this.downloadApiTemplate(massActionType);
    },
  },
});
