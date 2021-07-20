import Vue from 'vue';

export interface IMassActionCards {
  title: string;
  description: string;
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
}

export default Vue.extend({
  methods: {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    filterItemsOnLevelOrRole(items: any) {
      return items.filter((item: any) => {
        let levelCheck = false;
        let rolesCheck = false;

        if (item.level) {
          levelCheck = this.$hasLevel(item.level);
        }

        if (item.roles) {
          rolesCheck = item.roles.some((r: string) => this.$hasRole(r));
        }
        return levelCheck || rolesCheck;
      });
    },

    onClick(methodName: string) {
      switch (methodName) {
        case 'exportImpactValidation':
          this.exportImpactValidation();
          break;
        case 'importValidationImpact':
          this.importValidationImpact();
          break;
        case 'generateFundingRequest':
          this.generateFundingRequest();
          break;
        case 'importPaymentStatuses':
          this.importPaymentStatuses();
          break;
        case 'downloadTemplate':
          this.downloadTemplate();
          break;
        default:
      }
    },

    exportImpactValidation() {
      return false;
    },

    importValidationImpact() {
      return false;
    },

    generateFundingRequest() {
      return false;
    },

    importPaymentStatuses() {
      return false;
    },

    downloadTemplate() {
      return false;
    },
  },
});
