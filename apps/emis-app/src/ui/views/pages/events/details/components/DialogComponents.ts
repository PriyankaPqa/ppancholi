export enum EDialogComponent {
  CallCentre = 'EventCallCentreDialog',
  RegistrationLocation = 'EventRegistrationLocationDialog',
  ShelterLocation = 'EventShelterLocationDialog',
  Agreement = 'EventAgreementDialog',
  RegistrationAssessment = 'EventRegistrationAssessmentDialog',
  EventConsent = 'EventConsentSelectionDialog',
}

export interface DialogData {
  id?: string,
  isEditMode: boolean,
  component: EDialogComponent,
}
