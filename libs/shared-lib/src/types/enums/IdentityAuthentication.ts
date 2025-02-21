export enum IdentityAuthenticationMethod {
  NotApplicable = 0,
  Exceptional = 1,
  InPerson = 2,
  System = 3,
}

export enum IdentityAuthenticationStatus {
  NotVerified = 0,
  Passed = 1,
  Failed = 2,
}

export enum Tier2State {
  None = 0,
  ToDo = 1,
  StartedButDocumentsNotSubmitted = 2,
  Pending = 3,
  Passed = 4,
  Failed = 5,
  Cancelled = 6,
}

export enum Tier2GambitScreeningId {
  CanadianDriverLicense = 82,
  ProvincialPhotoId = 53,

  Passport = 2,
  CanadianCitizenshipCard = 6,
  CanadianPermanentResidentCard = 7,
  IndianStatusCard = 29,
  CanadianFirearmsLicense = 10,
  NexusCard = 28,
  OntarioHealthCard = 51,
  QuebecHealthCard = 84,
  CanadianPassport = 56,
  NonCanadianPassport = 57,

  UtilityBill = 74,
  MortgageStatement = 76,
  PropertyTaxAssessment = 77,
  ProvincialGovernmentMail = 78,
  FederalGovernmentMail = 79,
  BankStatement = 80,
  InsuranceStatement = 81,
}
