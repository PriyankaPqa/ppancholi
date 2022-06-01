import Vue from 'vue';
import helpers from '@/ui/helpers/helpers';
import { TranslateResult } from 'vue-i18n';
import { FeatureKeys } from '@/entities/tenantSettings';

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
  onSecondaryClick?: string;
  feature?: FeatureKeys
}

export default Vue.extend({

  data() {
    return {
      showExportValidationImpact: false,
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
          this.downloadImportPaymentStatusesTemplate();
          break;
        case 'downloadImportUsersTemplate':
          this.downloadImportUsersTemplate();
          break;
        default:
      }
    },

    exportImpactValidation() {
      this.showExportValidationImpact = true;
    },

    generateFundingRequest() {
      return false;
    },

    downloadImportPaymentStatusesTemplate() {
      const fileName = 'ImportPaymentStatusesTemplate.csv';
      const blob = new Blob(['PaymentGroupId,Status,CancellationReason'], { type: 'text/csv' });
      helpers.downloadBlob(blob, fileName);
    },

    downloadImportUsersTemplate() {
      const fileName = 'ImportUsersTemplate.csv';
      const blob = new Blob(['FirstName,LastName,Email,Role'], { type: 'text/csv' });
      helpers.downloadBlob(blob, fileName);
    },
  },
});
