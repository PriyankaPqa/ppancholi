export enum DateTypes {
  ConvertToLocal = 'convertToLocal',
  ConvertToUtc = 'convertToUtc',
  Static = 'static',
  Unknown = 'unknown',
}

export const dateTypes = {
  convertToLocal: [
    'Entity.created',
    'Entity.timestamp',
    'EventSchedule.timestamp',
    'IFinancialAssistancePaymentGroup.cancellationDate',
    'local',
    'EventSchedule.scheduledOpenDate',
    'TaskHistory.dateOfChange',
    'Task.dateAdded',
    'Notification.created',
    'Approval.submissionStartedDate',
    'ApprovalHistory.dateOfApprovalAction',
    'Event.statusChangeDate',
  ] as string[],

  convertToUtc: [
    'Report.Export',
  ] as string[],

  static: [
    'EventSchedule.scheduledCloseDate',
    'EventSchedule.openDate',
    'EventSchedule.closeDate',
    'EventResponseDetails.dateReported',
    'EventAgreement.startDate',
    'EventAgreement.endDate',
    'EventCallCentre.startDate',
    'EventCallCentre.endDate',
    'HouseholdMemberMetadata.dateOfBirth',
    'ImpactedIndividuals.checkIn',
    'ImpactedIndividuals.checkOut',
    'CaseFileIndividual.checkIn',
    'CaseFileIndividual.checkOut',
    'Task.dueDate',
    'RecoveryPlan.startDate',
  ] as string[],

  getType(dateField: string) : DateTypes {
    if (this.convertToLocal.indexOf(dateField) > -1) {
      return DateTypes.ConvertToLocal;
    }
    if (this.convertToUtc.indexOf(dateField) > -1) {
      return DateTypes.ConvertToUtc;
    }
    if (this.static.indexOf(dateField) > -1) {
      return DateTypes.Static;
    }
    throw new Error('Please enter a proper date field name');
    // return DateTypes.Unknown;
  },
};
