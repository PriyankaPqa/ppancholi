import { IProvider } from '@/services/provider';
import { mockCreateEvent } from '@libs/cypress-lib/mocks/events/event';
import {
  mockAssessmentResponseRequest,
  mockCreateAssessmentRequest,
  mockEditAssessmentAnsweredQuestionsRequest,
  mockPartialSaveAssessmentAnsweredQuestionsRequest,
  mockSaveAssessmentAnsweredQuestionsRequest,
  mockUpdateAssessmentRequest,
  mockUpdateAssessmentWithAllPossibleComponentsRequest,
} from '@libs/cypress-lib/mocks/assessments/assessment';
import { UserRoles } from '@libs/cypress-lib/support/msal';
import { mockProgram } from '@libs/cypress-lib/mocks/programs/program';
import { mockApprovalTableData, mockApprovalTableWithMultipleApprovalGroupData, mockCreateApprovalTableRequest } from '@libs/cypress-lib/mocks/approval-table/approvalTable';
import { mockCreateFinancialAssistanceTableRequest } from '@libs/cypress-lib/mocks/financialAssistance/financialAssistanceTables';
import { useProvider } from 'cypress/provider/provider';
import { IEventEntity } from '@libs/entities-lib/event';
import {
  mockCreateHouseholdRequest,
  mockCustomCurrentAddressCreateRequest,
  mockUpdatePersonIdentityRequest,
} from '@libs/cypress-lib/mocks/household/household';
import { mockSetCaseFileStatusRequest } from '@libs/cypress-lib/mocks/casefiles/casefile';
import {
  mockCreateMassActionXlsxFileRequest,
  mockCreateMassFinancialAssistanceRequest,
  mockCreateMassFinancialAssistanceUploadCsvFileRequest,
  MockCreateMassActionFaUploadCsvFileRequestParams,
  mockCreateMassActionDataCorrectionFileRequest,
  MockCreateMassActionXlsxFileRequestParams,
} from '@libs/cypress-lib/mocks/mass-actions/massFinancialAssistance';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { mockApprovalActionRequest, mockFinancialAssistancePaymentRequest, mockUpdatePaymentRequest } from '@libs/cypress-lib/mocks/financialAssistance/financialAssistancePayment';
import { EPaymentModalities } from '@libs/entities-lib/program';
import { PaymentStatus } from '@libs/entities-lib/financial-assistance-payment';
import { IAnsweredQuestion } from '@libs/entities-lib/assessment-template';
import { fixtureGenerateFaCsvFile } from 'cypress/fixtures/mass-actions';
import { CaseFileStatus, ICaseFileEntity, IIdentityAuthentication } from '@libs/entities-lib/case-file';
import helpers from '@libs/shared-lib/helpers/helpers';
import { HouseholdStatus, IDetailedRegistrationResponse } from '@libs/entities-lib/household';
import { ECurrentAddressTypes, ICreateHouseholdRequest } from '@libs/entities-lib/household-create';
import { MassActionDataCorrectionType } from '@libs/entities-lib/mass-action';
import { linkEventToTeamForManyRoles } from './teams';

export interface MassActionFinancialAssistanceXlsxFileParams {
  provider: any,
  event?: IEventEntity,
  massAction: string,
  generatedXlsxFileData: Blob,
  massActionType?: number,
  fileName: string,
}

export interface CreateFATableParams {
  provider: IProvider,
  eventId: string,
  programId: string,
  amountType: EFinancialAmountModes
}

export interface CasefileAssessmentParams {
  provider: IProvider,
  assessmentResponseId: string,
  casefileId: string,
  assessmentFormId: string,
  answeredQuestionsHistory?: IAnsweredQuestion[]
}

export interface CreateMassFinancialAssistanceFilteredListParams {
  accessToken: string,
  event: IEventEntity,
  tableId: string,
  programId: string
}

export interface AddFinancialAssistancePaymentParams {
  provider: IProvider,
  modality: EPaymentModalities,
  caseFileId: string,
  financialAssistanceTableId: string
}

export interface UpdateFinancialAssistancePaymentParams {
  provider: IProvider,
  entityId: string,
  paymentGroupId: string,
  status: PaymentStatus
}

export interface AddSubmitUpdateFaPaymentParams {
  accessTokenL6: string,
  event: IEventEntity,
  tableId: string,
  paymentStatus: PaymentStatus,
  paymentModalities: EPaymentModalities
}

export interface MassActionFinancialAssistanceUploadFileParams {
  accessToken: string,
  event: IEventEntity,
  tableId: string,
  programId: string,
  householdQuantity: number,
  filePath: string
}

export interface MassActionDataCorrectionFileParams {
  provider: any,
  dataCorrectionType: MassActionDataCorrectionType,
  generatedCsvFile: string,
  correctionType: string
}

export interface IPrepareStateHousehold {
  provider: IProvider,
  registrationResponse: IDetailedRegistrationResponse,
  mockCreateHousehold: ICreateHouseholdRequest,
}

/**
 * Creates a event, add a team to it, and assign roles to this team
 * @param provider
 * @param roles
 */
export const createEventWithTeamWithUsers = async (provider: IProvider, roles = Object.values(UserRoles)) => {
  const event = await provider.events.createEvent(mockCreateEvent());
  const team = await linkEventToTeamForManyRoles(event, provider, roles);
  return { event, team };
};

/**
 * Creates a Program with custom param
 * @param provider
 * @param eventId
 * @param approvalRequired
 */
export const createCustomProgram = async (provider: IProvider, eventId: string, approvalRequired: boolean) => {
  const mockCreateProgram = mockProgram({ approvalRequired, eventId });
  const program = await provider.programs.createProgram(mockCreateProgram);
  return program;
};

/**
 * Creates a program
 * @param provider
 * @param eventId
 */
export const createProgram = async (provider: IProvider, eventId: string) => {
  const mockCreateProgram = mockProgram({ eventId });
  const program = await provider.programs.createProgram(mockCreateProgram);
  return { program, mockCreateProgram };
};

/**
 * Creates a Financial Assistance Table
 * @param accessToken
 * @param eventId
 * @param programId
 * @param amountType
 */
export const createFATable = async (params: CreateFATableParams) => {
  const eventId = params.eventId;
  const programId = params.programId;
  const mockCreateFinancialAssistanceTable = mockCreateFinancialAssistanceTableRequest(params.amountType, { eventId, programId });
  const table = await params.provider.financialAssistanceTables.createFinancialAssistanceTable(mockCreateFinancialAssistanceTable);
  return table;
};

/**
 * Creates Approval Table
 * @param accessToken
 * @param eventId
 * @param programId
 */
export const createApprovalTable = async (provider: IProvider, eventId: string, programId: string) => {
  const mockCreateApprovalTable = mockCreateApprovalTableRequest({ ...mockApprovalTableData({ eventId, programId }) });
  const table = await provider.approvalTables.create(mockCreateApprovalTable);
  return table;
};

/**
 * Creates Approval Table With Multiple Approval Group
 * @param accessToken
 * @param eventId
 * @param programId
 */
export const createApprovalTableWithMultipleApprovalGroup = async (provider: IProvider, eventId: string, programId: string) => {
  const mockCreateApprovalTableWithMultipleApprovalGroup = mockCreateApprovalTableRequest({ ...mockApprovalTableWithMultipleApprovalGroupData({ eventId, programId }) });
  const table = await provider.approvalTables.create(mockCreateApprovalTableWithMultipleApprovalGroup);
  return table;
};

/**
 * Creates a household
 * @param accessToken
 * @param event
 */
export const createHousehold = async (provider: IProvider, event: IEventEntity) => {
  const mockCreateHousehold = mockCreateHouseholdRequest({ eventId: event.id });
  const registrationResponse = await provider.households.postCrcRegistration(mockCreateHousehold);
  return { registrationResponse, mockCreateHousehold };
};

/**
 * Sets casefile status
 * @param provider
 * @param caseFileId
 * @param status
 */
export const setCasefileStatus = async (provider: IProvider, caseFileId: string, status: CaseFileStatus) => {
  const mockSetCaseFileStatus = mockSetCaseFileStatusRequest(status);
  const setCaseFileStatusResponse = await provider.caseFiles.setCaseFileStatus(caseFileId, mockSetCaseFileStatus);
  return setCaseFileStatusResponse;
};

/**
 * Sets household status
 * @param provider
 * @param householdId
 * @param status
 */
export const setHouseholdStatus = async (provider: IProvider, householdId: string, status: HouseholdStatus) => {
  const setHouseholdStatusResponse = await provider.households.setHouseholdStatus(householdId, status, 'This is my reasoning for updating the status');
  return setHouseholdStatusResponse;
};

/**
 * Creates a program, adds financial assistance table to it with an Item and Sub-item
 * @param provider
 * @param eventId
 * @param amountType
 */
export const createProgramWithTableWithItemAndSubItem = async (provider: IProvider, eventId: string, amountType: EFinancialAmountModes) => {
  const { program, mockCreateProgram } = await createProgram(provider, eventId);
  const createFaTableParamData: CreateFATableParams = {
    provider,
    eventId,
    programId: program.id,
    amountType,
  };
  const table = await createFATable(createFaTableParamData);
  return { program, mockCreateProgram, table };
};

/**
 * Creates one household
 * @param accessToken
 * @param event
 */
export const prepareStateHousehold = async (accessToken: string, event: IEventEntity) => {
  const provider = useProvider(accessToken);
  const { registrationResponse, mockCreateHousehold } = await createHousehold(provider, event);
  return { provider, registrationResponse, mockCreateHousehold };
};

/**
 * Adds assessment to a casefile
 * @param provider
 * @param casefileId
 * @param assessmentFormId
 */
export const addAssessmentToCasefile = async (provider: IProvider, casefileId: string, assessmentFormId: string) => {
  const mockAssessmentResponse = mockAssessmentResponseRequest(casefileId, assessmentFormId);
  const createAssessmentResponse = await provider.assessmentResponses.create(mockAssessmentResponse);
  return createAssessmentResponse;
};

/**
 * Partially completes the assessment added to the casefile
 * @param provider
 * @param assessmentResponseId
 * @param casefileId
 * @param assessmentFormId
 */
export const partiallyCompleteCasefileAssessment = async (params: CasefileAssessmentParams) => {
  const mockPartialSaveAssessmentAnsweredQuestions = mockPartialSaveAssessmentAnsweredQuestionsRequest(params.assessmentResponseId, params.casefileId, params.assessmentFormId);
  await params.provider.assessmentResponses.saveAssessmentAnsweredQuestions(mockPartialSaveAssessmentAnsweredQuestions);
};

/**
 * Complete and submit the assessment added to the casefile
 * @param provider
 * @param assessmentResponseId
 * @param casefileId
 * @param assessmentFormId
 */
export const completeAndSubmitCasefileAssessment = async (params: CasefileAssessmentParams) => {
  const mockSaveAssessmentAnsweredQuestions = mockSaveAssessmentAnsweredQuestionsRequest(params.assessmentResponseId, params.casefileId, params.assessmentFormId);
  await params.provider.assessmentResponses.saveAssessmentAnsweredQuestions(mockSaveAssessmentAnsweredQuestions);
  const submitAssessmentResponse = await params.provider.assessmentResponses.completeSurveyByBeneficiary(mockSaveAssessmentAnsweredQuestions);
  return submitAssessmentResponse;
};

/**
 * Complete and submit the assessment added to the casefile as CRC user
 * @param provider
 * @param assessmentResponseId
 * @param casefileId
 * @param assessmentFormId
 */
export const completeAndSubmitCasefileAssessmentByCrcUser = async (params: CasefileAssessmentParams) => {
  const mockSaveAssessmentAnsweredQuestions = mockSaveAssessmentAnsweredQuestionsRequest(params.assessmentResponseId, params.casefileId, params.assessmentFormId);
  await params.provider.assessmentResponses.saveAssessmentAnsweredQuestions(mockSaveAssessmentAnsweredQuestions);
  const submitAssessmentResponse = await params.provider.assessmentResponses.completeSurvey(mockSaveAssessmentAnsweredQuestions);
  return submitAssessmentResponse;
};

/**
 * Edit the completed assessment added to the casefile
 * @param provider
 * @param assessmentResponseId
 * @param casefileId
 * @param assessmentFormId
 */
export const editCompletedCasefileAssessment = async (params: CasefileAssessmentParams) => {
  // eslint-disable-next-line
  const mockEditAssessmentAnsweredQuestions = mockEditAssessmentAnsweredQuestionsRequest(params.assessmentResponseId, params.casefileId, params.assessmentFormId, params.answeredQuestionsHistory);
  await params.provider.assessmentResponses.saveAssessmentAnsweredQuestions(mockEditAssessmentAnsweredQuestions);
  return mockEditAssessmentAnsweredQuestions;
};

/**
 * Creates multiple households
 * @param accessToken
 * @param event
 * @param householdQuantity
 */
export const prepareStateMultipleHouseholds = async (accessToken: string, event: IEventEntity, householdQuantity: number) => {
  const provider = useProvider(accessToken);
  const householdArray = Array.from({ length: householdQuantity }, async () => {
    const { registrationResponse, mockCreateHousehold } = await createHousehold(provider, event);
    return { registrationResponse, mockCreateHousehold };
  });
  const householdsCreated = await Promise.all(householdArray);
  const extractedResults = householdsCreated.map(({ registrationResponse, mockCreateHousehold }) => ({ registrationResponse, mockCreateHousehold }));
  return { provider, householdsCreated: extractedResults, householdQuantity };
};

/**
 * Creates a event, add a team to it, assign roles to this team and creates a program for that event
 * @param accessToken
 * @param allRoles
 */
export const prepareStateEventAndProgram = async (accessToken: string, allRoles: UserRoles[]) => {
  const provider = useProvider(accessToken);
  const { event, team } = await createEventWithTeamWithUsers(provider, allRoles);
  const { program, mockCreateProgram } = await createProgram(provider, event.id);
  return { provider, event, team, mockCreateProgram, program };
};

/**
 * Creates a event, add a team to it, and assign roles to this team using inbuilt provider
 * @param accessToken
 * @param allRoles
 */
export const createEventAndTeam = async (accessToken: string, allRoles: UserRoles[]) => {
  const provider = useProvider(accessToken);
  const { event, team } = await createEventWithTeamWithUsers(provider, allRoles);
  return { provider, event, team };
};

/**
 * Creates an assessment
 * @param provider
 * @param eventId
 * @param programId
 */
export const createAssessment = async (provider: IProvider, eventId: string, programId: string) => {
  const mockCreateAssessment = mockCreateAssessmentRequest({ eventId, programId });
  const assessment = await provider.assessmentForms.create(mockCreateAssessment);
  return { assessment };
};

/**
 * Create and updates an assessment to build survey
 * @param provider
 * @param eventId
 * @param programId
 */
export const createAndUpdateAssessment = async (provider: IProvider, eventId: string, programId: string) => {
  const assessment = await provider.assessmentForms.create(mockCreateAssessmentRequest({ eventId, programId }));
  const updatedAssessment = await provider.assessmentForms.updateAssessmentStructure(mockUpdateAssessmentRequest(assessment.id, { eventId, programId }));
  return updatedAssessment;
};

/**
 * Create and updates an assessment to build survey
 * @param provider
 * @param eventId
 * @param programId
 */
export const createAndUpdateAssessmentWithAllPossibleComponents = async (provider: IProvider, eventId: string, programId: string) => {
  const assessment = await provider.assessmentForms.create(mockCreateAssessmentRequest({ eventId, programId }));
  const updatedAssessment = await provider.assessmentForms.updateAssessmentStructure(mockUpdateAssessmentWithAllPossibleComponentsRequest(assessment.id, { eventId, programId }));
  return updatedAssessment;
};

// verifies if casefile created is indexed through search and wait
const searchCasefileAndWait = async (provider: IProvider, caseFileId: string, maxAttempt = 20, throttle = 2000): Promise<number> => {
  let searchResult = 0;
  let attempt = 0;
  const waitForCaseFileIndexToBeUpdated = async (): Promise<number> => {
    if (searchResult === 1) {
      cy.log('Casefile index successfully updated');
    } else if (attempt < maxAttempt) {
      const search = await provider.caseFiles.search({
        filter: { Entity: { Id: caseFileId } },
        top: 1,
      });
      searchResult = search.odataCount;
      attempt += 1;
      if (searchResult === 0) {
        // eslint-disable-next-line
        await helpers.timeout(throttle)
        cy.log(`Casefile index search attempt ${attempt}`);
        return waitForCaseFileIndexToBeUpdated();
      }
    } else {
      throw new Error(`Failed to search for index after ${maxAttempt} retries.`);
    }
    cy.log('Casefile index successfully updated');
    return searchResult;
  };
  return waitForCaseFileIndexToBeUpdated();
};

export const searchCaseFilesRecursively = async (provider: IProvider, caseFiles: ICaseFileEntity[]) => {
  await Promise.all(
    caseFiles.map(async (caseFile) => {
      await searchCasefileAndWait(provider, caseFile.id);
    }),
  );
};

/**
 * Creates a Mass Financial Assistance
 * @param accessToken
 * @param event
 * @param tableId
 * @param programId
 */
export const prepareStateHouseholdMassFinancialAssistance = async (params: CreateMassFinancialAssistanceFilteredListParams) => {
  const provider = useProvider(params.accessToken);
  const responseCreateHousehold = await createHousehold(provider, params.event);
  const eventId = params.event.id;
  const tableId = params.tableId;
  const programId = params.programId;
  await searchCasefileAndWait(provider, responseCreateHousehold.registrationResponse.caseFile.id);
  const mockCreateMassFinancialAssistance = mockCreateMassFinancialAssistanceRequest(params.event, { eventId, tableId, programId });
  const responseMassFinancialAssistance = await provider.massActions.create('financial-assistance-from-list', mockCreateMassFinancialAssistance);
  return { responseMassFinancialAssistance, responseCreateHousehold };
};

/**
 * Adds financial assistance to a casefile
 * @param provider
 * @param modality
 * @param caseFileId
 * @param financialAssistanceTableId
 */
export const addFinancialAssistancePayment = async (params: AddFinancialAssistancePaymentParams) => {
  const caseFileId = params.caseFileId;
  const financialAssistanceTableId = params.financialAssistanceTableId;
  const mockFinancialAssistancePayment = mockFinancialAssistancePaymentRequest(params.modality, { caseFileId, financialAssistanceTableId });
  const createdFinancialAssistancePayment = await params.provider.financialAssistancePaymentsService.addFinancialAssistancePayment(mockFinancialAssistancePayment);
  return createdFinancialAssistancePayment;
};

/**
 * Submits financial assistance payment request to approver for decision
 * @param provider
 * @param paymentId
 * @param submitTo
 */
export const submitFinancialAssistancePaymentToApprover = async (provider: IProvider, paymentId: string, submitTo: string) => {
  const submittedApprovalRequest = await provider.financialAssistancePaymentsService.submitApprovalRequest(paymentId, submitTo);
  return submittedApprovalRequest;
};

/**
 * Escalate financial assistance payment request to next level approver for final decision
 * @param paymentId
 * @param submittedToUserId
 * @param submittedByroleValue
 */
export const escalateFinancialAssistancePaymentToNextLevelApprover = async (paymentId: string, submittedToUserId: string, submittedByRoleValue: UserRoles) => {
  cy.getToken(submittedByRoleValue).then(async (tokenResponse) => {
    const provider = useProvider(tokenResponse.access_token);
    await provider.financialAssistancePaymentsService.getNextApprovalGroupRoles(paymentId);
    const mockApprovalAction = mockApprovalActionRequest(submittedToUserId);
    const escalatedApprovalRequest = await provider.financialAssistancePaymentsService.submitApprovalAction(paymentId, mockApprovalAction);
    return escalatedApprovalRequest;
  });
};

/**
 * Submit financial assistance
 * @param provider
 * @param financialAssistancePaymentId
 */
export const submitFinancialAssistancePayment = async (provider: IProvider, financialAssistancePaymentId: string) => {
  const submittedFinancialAssistancePayment = await provider.financialAssistancePaymentsService.submitFinancialAssistancePayment(financialAssistancePaymentId);
  return submittedFinancialAssistancePayment;
};

/**
 * Updates financial assistance status
 * @param provider
 * @param entityId
 * @param paymentGroupId
 * @param status
 */
export const updateFinancialAssistancePayment = async (params: UpdateFinancialAssistancePaymentParams) => {
  const entityId = params.entityId;
  const paymentGroupId = params.paymentGroupId;
  const mockUpdatePayment = mockUpdatePaymentRequest(params.status, { entityId, paymentGroupId });
  const updatedFinancialAssistancePayment = await params.provider.financialAssistancePaymentsService.updatePaymentStatus(mockUpdatePayment);
  return updatedFinancialAssistancePayment;
};

/**
 * Creates a event, add a team to it, assign roles to this team, creates a program for that event
 * and adds financial assistance table to it with an Item and Sub-item
 * @param accessTokenL6
 * @param allRoles
 * @param amountMode
 */
export const prepareStateEventTeamProgramTableWithItemSubItem = async (accessTokenL6: string, allRoles: UserRoles[], amountMode: EFinancialAmountModes) => {
  const resultPrepareStateEvent = await createEventAndTeam(accessTokenL6, allRoles);
  const event = resultPrepareStateEvent.event;
  const { provider, team } = resultPrepareStateEvent;
  const resultCreateProgram = await createProgramWithTableWithItemAndSubItem(provider, event.id, amountMode);
  const table = resultCreateProgram.table;
  return { event, team, table, provider };
};

/**
 * Creates a household, adds financial assistance to a casefile, Submit and updates financial assistance
 * @param accessTokenL6
 * @param event
 * @param tableId
 * @param paymentStatus
 * @param paymentModalities
 */
// eslint-disable-next-line
export const prepareStateHouseholdAddSubmitUpdateFAPayment = async (params: AddSubmitUpdateFaPaymentParams) => {
  const resultPrepareStateHousehold = await prepareStateHousehold(params.accessTokenL6, params.event);
  const caseFile = resultPrepareStateHousehold.registrationResponse.caseFile;
  const provider = resultPrepareStateHousehold.provider;
  const addFinancialAssistancePaymentParamData: AddFinancialAssistancePaymentParams = {
    provider,
    modality: params.paymentModalities,
    caseFileId: caseFile.id,
    financialAssistanceTableId: params.tableId,
  };
  const createdFinancialAssistancePayment = await addFinancialAssistancePayment(addFinancialAssistancePaymentParamData);
  const submittedFinancialAssistancePayment = await submitFinancialAssistancePayment(provider, createdFinancialAssistancePayment.id);
  const updateFinancialAssistancePaymentParamData: UpdateFinancialAssistancePaymentParams = {
    provider,
    entityId: submittedFinancialAssistancePayment.id,
    paymentGroupId: submittedFinancialAssistancePayment.groups[0].id,
    status: params.paymentStatus,
  };
  await updateFinancialAssistancePayment(updateFinancialAssistancePaymentParamData);
  return { caseFile, submittedFinancialAssistancePayment };
};

/**
 * Creates multiple households and performs recursive search to verify creation
 * @param accessToken
 * @param event
 * @param householdQuantity
 */
export const prepareStateCreateAndSearchHouseholds = async (accessToken: string, event: IEventEntity, householdQuantity: number) => {
  const responseCreateHouseholds = await prepareStateMultipleHouseholds(accessToken, event, householdQuantity);
  const caseFileCreated1 = responseCreateHouseholds.householdsCreated[0].registrationResponse.caseFile;
  const caseFileCreated2 = responseCreateHouseholds.householdsCreated[1].registrationResponse.caseFile;
  const caseFileCreated3 = responseCreateHouseholds.householdsCreated[2].registrationResponse.caseFile;
  await searchCaseFilesRecursively(responseCreateHouseholds.provider, [caseFileCreated1, caseFileCreated2, caseFileCreated3]);
  return { responseCreateHouseholds, caseFileCreated1, caseFileCreated2, caseFileCreated3 };
};

/**
 * Creates a Mass Action using xlsx file
 * @param provider
 * @param event
 * @param massAction
 * @param generateXlsxFileFunction callback function
 * @param massActionType optional
 */
export const prepareStateMassActionXlsxFile = async (provider: any, massAction: string, mockRequestDataparams: MockCreateMassActionXlsxFileRequestParams) => {
  const mockCreateMassFinancialAssistanceCustomFile = mockCreateMassActionXlsxFileRequest(mockRequestDataparams);
  const responseMassFinancialAssistance = await provider.cypress.massAction.createWithFile(massAction, mockCreateMassFinancialAssistanceCustomFile);
  return responseMassFinancialAssistance;
};

/**
 * Creates a Mass Financial Assistance using csv file
 * @param accessToken
 * @param event
 * @param tableId
 * @param programId
 * @param householdQuantity
 * @param filePath
 */
export const prepareStateMassActionFinancialAssistanceUploadFile = async (params: MassActionFinancialAssistanceUploadFileParams) => {
  const responseCreateHouseholds = await prepareStateMultipleHouseholds(params.accessToken, params.event, params.householdQuantity);
  const caseFileCreated1 = responseCreateHouseholds.householdsCreated[0].registrationResponse.caseFile;
  const caseFileCreated2 = responseCreateHouseholds.householdsCreated[1].registrationResponse.caseFile;
  const caseFileCreated3 = responseCreateHouseholds.householdsCreated[2].registrationResponse.caseFile;
  await searchCaseFilesRecursively(responseCreateHouseholds.provider, [caseFileCreated1, caseFileCreated2, caseFileCreated3]);
  const generatedFaCsvData = fixtureGenerateFaCsvFile([caseFileCreated1, caseFileCreated2, caseFileCreated3], params.tableId, params.filePath);

  const mockRequestParamData: MockCreateMassActionFaUploadCsvFileRequestParams = {
    eventId: params.event.id,
    tableId: params.tableId,
    programId: params.programId,
    fileContents: generatedFaCsvData,
  };
  const mockCreateMassFinancialAssistanceUploadCsvFile = mockCreateMassFinancialAssistanceUploadCsvFileRequest(mockRequestParamData);
  // eslint-disable-next-line
  const responseMassFinancialAssistance = await responseCreateHouseholds.provider.cypress.massAction.createWithFile('financial-assistance', mockCreateMassFinancialAssistanceUploadCsvFile);
  return { responseMassFinancialAssistance, responseCreateHouseholds };
};

/**
 * Fetch household members persons info
 * @param provider
 * @param personIds
 */
export const getPersonsInfo = async (provider: IProvider, personIds: string[]) => {
  const getPersonPromises = personIds.map((personId) => provider.households.getPerson(personId));
  const personsInfo = await Promise.all(getPersonPromises);
  return personsInfo;
};

/**
 * Set Casefile Identity Authentication status
 * @param provider
 * @param casefileIds
 * @param identityAuthenticationStatus
 */
export const setCaseFileIdentityAuthentication = async (provider: IProvider, caseFiles: ICaseFileEntity[], identityAuthenticationStatus: IIdentityAuthentication) => {
  const setCaseFileIdentityAuthenticationPromises = caseFiles.map((caseFiles) => provider.caseFiles.setCaseFileIdentityAuthentication(caseFiles.id, identityAuthenticationStatus));
  const caseFileIdentityAuthentication = await Promise.all(setCaseFileIdentityAuthenticationPromises);
  return caseFileIdentityAuthentication;
};

/**
 * Fetch casefile summary
 * @param provider
 * @param caseFileIds
 */
export const getCaseFilesSummary = async (provider: IProvider, caseFileIds: string[]) => {
  const getCaseFilesSummaryPromises = caseFileIds.map((caseFileId) => provider.caseFiles.getSummary(caseFileId));
  const caseFilesSummary = await Promise.all(getCaseFilesSummaryPromises);
  return caseFilesSummary;
};

/**
 * Get Households summary
 * @param provider
 * @param caseFileIds
 */
export const getHouseholdsSummary = async (provider: IProvider, HouseholdIds: string[]) => {
  const getHouseholdsPromises = HouseholdIds.map((HouseholdId) => provider.households.get(HouseholdId));
  const householdsSummary = await Promise.all(getHouseholdsPromises);
  return householdsSummary;
};

/**
 * Update Person Current Address
 * @param provider
 * @param personIds
 * @param addressType
*/
export const updatePersonsCurrentAddress = async (provider: IProvider, personIds: string[], addressType: ECurrentAddressTypes) => {
  const getUpdatePersonAddressPromises = personIds.map((personId) => provider.households.updatePersonAddress(personId, false, mockCustomCurrentAddressCreateRequest(addressType)));
  await Promise.all(getUpdatePersonAddressPromises);
};

/**
 * Create Authentication Other Data Correction file
 * @param provider
 * @param dataCorrectionType
 * @param generatedCsvFile
 */

export const prepareStateMassActionDataCorrectionFile = async (params: MassActionDataCorrectionFileParams) => {
  const mockDataCorrectionFile = mockCreateMassActionDataCorrectionFileRequest(params.dataCorrectionType, params.generatedCsvFile, params.correctionType);
  const responseMassFinancialAssistance = await params.provider.cypress.massAction.createWithFile('data-correction', mockDataCorrectionFile);
  return responseMassFinancialAssistance;
};

/**
 * Update Person Gender
 * @param provider
 * @param personIds
*/
export const updatePersonsGender = async (provider: IProvider, personIds: string[]) => {
  const getUpdatedPersonGenderPromises = personIds.map((personId) => provider.households.updatePersonIdentity(personId, false, mockUpdatePersonIdentityRequest()));
  await Promise.all(getUpdatedPersonGenderPromises);
};

/**
 * Resolves Potential Duplicate Record
 * @param provider
 * @param householdId
*/
export const resolvePotenialDuplicateRecord = async (provider: IProvider, householdId: string) => {
  const householdDuplicate = await provider.potentialDuplicates.getDuplicates(householdId);
  const resolvedDuplicate = await provider.potentialDuplicates.resolveDuplicate(householdDuplicate[0].id, 'I am resolving this duplicate');
  return { householdDuplicate, resolvedDuplicate };
};
