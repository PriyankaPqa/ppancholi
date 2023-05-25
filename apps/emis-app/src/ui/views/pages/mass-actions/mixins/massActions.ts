import Vue from 'vue';
import helpers from '@/ui/helpers/helpers';
import { TranslateResult } from 'vue-i18n';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import { MassActionDataCorrectionType, MassActionType } from '@libs/entities-lib/mass-action';

export interface IMassActionCards {
  title: string;
  description: string | TranslateResult;
  button: string;
  secondaryButton?: string;
  showSecondaryButton?: boolean;
  route: string;
  dataTest: string;
  level: string;
  roles: Array<string>;
  group: number;
  onClick?: string;
  onClickMenu?: string;
  onSecondaryClick?: string;
  feature?: FeatureKeys
  secondaryButtonIsMenu?: boolean;
  secondaryMenuItems?: Array<Record<string, unknown>>
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
          blobsParts: 'PersonId,PlaceName,StreetAddress,PlaceNumber,UnitSuite,City,PostalCode,ProvinceEn,SpecifiedOtherProvince,ETag',
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
    /* eslint-disable @typescript-eslint/no-explicit-any */
    filterItems(items: any) {
      return items.filter((item: any) => {
        let levelCheck = false;
        let rolesCheck = false;
        let featureCheck = true;

        if (item.level) {
          levelCheck = this.$hasLevel(item.level);
        }

        if (item.roles) {
          rolesCheck = item.roles.some((r: string) => this.$hasRole(r));
        }

        if (item.feature) {
          featureCheck = this.$hasFeature(item.feature);
        }
        return featureCheck && (levelCheck || rolesCheck);
      });
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
          this.downloadTemplate(this.templateData.importUsers.fileName, this.templateData.importUsers.blobsParts);
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
      // TODO: EMISV2-5874 introduced xlsx file templates for one mass action type.
      // It would be better to have a consistent approach to template generation, meaning
      // that we should move this all to the API.
      if (massActionType === MassActionDataCorrectionType.FinancialAssistance) {
        // Template is an xlsx file generated by the API
        await this.downloadApiTemplate(massActionType);
        return;
      }
      // Template is a csv file generated by the client
      this.downloadTemplate(this.templateData[massActionType].fileName, this.templateData[massActionType].blobsParts);
    },
  },
});
