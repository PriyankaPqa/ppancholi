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
    'local',
  ] as string[],

  convertToUtc: [
  ] as string[],

  static: [
    'EventSchedule.scheduledOpenDate',
    'EventSchedule.scheduledCloseDate',
    'EventSchedule.openDate',
    'EventSchedule.closeDate',
    'EventResponseDetails.dateReported',
    'EventAgreement.startDate',
    'EventAgreement.endDate',
    'EventCallCentre.startDate',
    'EventCallCentre.endDate',
  ] as string[],

  getType(dateField: string) : DateTypes {
    if (this.convertToLocal.indexOf(dateField) > -1) return DateTypes.ConvertToLocal;
    if (this.convertToUtc.indexOf(dateField) > -1) return DateTypes.ConvertToUtc;
    if (this.static.indexOf(dateField) > -1) return DateTypes.Static;
    return DateTypes.Unknown;
  },
};
