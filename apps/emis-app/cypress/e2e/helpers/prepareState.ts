import { IProvider } from '@/services/provider';
import { mockCreateEvent } from '@libs/cypress-lib/mocks/events/event';
import {
  mockAssessmentResponseRequest,
  mockCreateAssessmentRequest,
  mockEditAssessmentAnsweredQuestionsRequest,
  mockPartialSaveAssessmentAnsweredQuestionsRequest,
  mockSaveAssessmentAnsweredQuestionsRequest,
  mockUpdateAssessmentRequest } from '@libs/cypress-lib/mocks/assessments/assessment';
import { UserRoles } from '@libs/cypress-lib/support/msal';
import { mockProgram } from '@libs/cypress-lib/mocks/programs/program';
import { mockApprovalTableData, mockApprovalTableWithMultipleApprovalGroupData, mockCreateApprovalTableRequest } from '@libs/cypress-lib/mocks/approval-table/approvalTable';
import { mockCreateFinancialAssistanceTableRequest } from '@libs/cypress-lib/mocks/financialAssistance/financialAssistanceTables';
import { useProvider } from 'cypress/provider/provider';
import { IEventEntity } from '@libs/entities-lib/event';
import { mockCreateHouseholdRequest } from '@libs/cypress-lib/mocks/household/household';
import { mockSetCaseFileStatusRequest } from '@libs/cypress-lib/mocks/casefiles/casefile';
import {
  mockCreateMassFinancialAssistanceCustomFileRequest,
  mockCreateMassFinancialAssistanceRequest,
  mockCreateMassFinancialAssistanceUploadCsvFileRequest } from '@libs/cypress-lib/mocks/mass-actions/massFinancialAssistance';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { mockApprovalActionRequest, mockFinancialAssistancePaymentRequest, mockUpdatePaymentRequest } from '@libs/cypress-lib/mocks/financialAssistance/financialAssistancePayment';
import { EPaymentModalities } from '@libs/entities-lib/program';
import { PaymentStatus } from '@libs/entities-lib/financial-assistance-payment';
import { IAnsweredQuestion } from '@libs/entities-lib/assessment-template';
import { fixtureGenerateFaCsvFile, fixtureGenerateFaCustomOptionsXlsxFile } from 'cypress/fixtures/mass-actions';
import { CaseFileStatus, ICaseFileEntity } from '@libs/entities-lib/case-file';
import helpers from '@libs/shared-lib/helpers/helpers';
import { HouseholdStatus } from '@libs/entities-lib/household';
import { linkEventToTeamForManyRoles } from './teams';

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
export const createFATable = async (provider: IProvider, eventId: string, programId: string, amountType:EFinancialAmountModes) => {
  const mockCreateFinancialAssistanceTable = mockCreateFinancialAssistanceTableRequest(amountType, { eventId, programId });
  const table = await provider.financialAssistanceTables.createFinancialAssistanceTable(mockCreateFinancialAssistanceTable);
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
export const createProgramWithTableWithItemAndSubItem = async (provider: IProvider, eventId: string, amountType:EFinancialAmountModes) => {
  const { program, mockCreateProgram } = await createProgram(provider, eventId);
  const table = await createFATable(provider, eventId, program.id, amountType);
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
export const partiallyCompleteCasefileAssessment = async (provider: IProvider, assessmentResponseId: string, casefileId: string, assessmentFormId: string) => {
  const mockPartialSaveAssessmentAnsweredQuestions = mockPartialSaveAssessmentAnsweredQuestionsRequest(assessmentResponseId, casefileId, assessmentFormId);
  await provider.assessmentResponses.saveAssessmentAnsweredQuestions(mockPartialSaveAssessmentAnsweredQuestions);
};

/**
 * Complete and submit the assessment added to the casefile
 * @param provider
 * @param assessmentResponseId
 * @param casefileId
 * @param assessmentFormId
 */
export const completeAndSubmitCasefileAssessment = async (provider: IProvider, assessmentResponseId: string, casefileId: string, assessmentFormId: string) => {
  const mockSaveAssessmentAnsweredQuestions = mockSaveAssessmentAnsweredQuestionsRequest(assessmentResponseId, casefileId, assessmentFormId);
  await provider.assessmentResponses.saveAssessmentAnsweredQuestions(mockSaveAssessmentAnsweredQuestions);
  const submitAssessmentResponse = await provider.assessmentResponses.completeSurveyByBeneficiary(mockSaveAssessmentAnsweredQuestions);
  return submitAssessmentResponse;
};

/**
 * Complete and submit the assessment added to the casefile as CRC user
 * @param provider
 * @param assessmentResponseId
 * @param casefileId
 * @param assessmentFormId
 */
export const completeAndSubmitCasefileAssessmentByCrcUser = async (provider: IProvider, assessmentResponseId: string, casefileId: string, assessmentFormId: string) => {
  const mockSaveAssessmentAnsweredQuestions = mockSaveAssessmentAnsweredQuestionsRequest(assessmentResponseId, casefileId, assessmentFormId);
  await provider.assessmentResponses.saveAssessmentAnsweredQuestions(mockSaveAssessmentAnsweredQuestions);
  const submitAssessmentResponse = await provider.assessmentResponses.completeSurvey(mockSaveAssessmentAnsweredQuestions);
  return submitAssessmentResponse;
};

/**
 * Edit the completed assessment added to the casefile
 * @param provider
 * @param assessmentResponseId
 * @param casefileId
 * @param assessmentFormId
 */
// eslint-disable-next-line
export const editCompletedCasefileAssessment = async (provider: IProvider, assessmentResponseId: string, casefileId: string, assessmentFormId: string, answeredQuestionsHistory:IAnsweredQuestion[]) => {
  const mockEditAssessmentAnsweredQuestions = mockEditAssessmentAnsweredQuestionsRequest(assessmentResponseId, casefileId, assessmentFormId, answeredQuestionsHistory);
  await provider.assessmentResponses.saveAssessmentAnsweredQuestions(mockEditAssessmentAnsweredQuestions);
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
 * @param allRolesValues
 */
export const prepareStateEventAndProgram = async (accessToken: string, allRolesValues: UserRoles[]) => {
  const provider = useProvider(accessToken);
  const { event, team } = await createEventWithTeamWithUsers(provider, allRolesValues);
  const { program, mockCreateProgram } = await createProgram(provider, event.id);
  return { provider, event, team, mockCreateProgram, program };
};

/**
 * Creates a event, add a team to it, and assign roles to this team using inbuilt provider
 * @param accessToken
 * @param allRolesValues
 */
export const createEventAndTeam = async (accessToken: string, allRolesValues: UserRoles[]) => {
  const provider = useProvider(accessToken);
  const { event, team } = await createEventWithTeamWithUsers(provider, allRolesValues);
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
// eslint-disable-next-line
export const prepareStateHouseholdMassFinancialAssistance = async (accessToken: string, event:IEventEntity, tableId: string, programId: string) => {
  const provider = useProvider(accessToken);
  const responseCreateHousehold = await createHousehold(provider, event);
  const eventId = event.id;
  const caseFileId = responseCreateHousehold.registrationResponse.caseFile.id;
  await searchCasefileAndWait(provider, caseFileId);
  const mockCreateMassFinancialAssistance = mockCreateMassFinancialAssistanceRequest(event, { eventId, tableId, programId });
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
export const addFinancialAssistancePayment = async (provider: IProvider, modality: EPaymentModalities, caseFileId: string, financialAssistanceTableId: string) => {
  const mockFinancialAssistancePayment = mockFinancialAssistancePaymentRequest(modality, { caseFileId, financialAssistanceTableId });
  const createdFinancialAssistancePayment = await provider.financialAssistancePaymentsService.addFinancialAssistancePayment(mockFinancialAssistancePayment);
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
export const updateFinancialAssistancePayment = async (provider: IProvider, entityId: string, paymentGroupId: string, status: PaymentStatus) => {
  const mockUpdatePayment = mockUpdatePaymentRequest(status, { entityId, paymentGroupId });
  const updatedFinancialAssistancePayment = await provider.financialAssistancePaymentsService.updatePaymentStatus(mockUpdatePayment);
  return updatedFinancialAssistancePayment;
};

/**
 * Creates a event, add a team to it, assign roles to this team, creates a program for that event
 * and adds financial assistance table to it with an Item and Sub-item
 * @param accessTokenL6
 * @param allRolesValues
 * @param amountMode
 */
export const prepareStateEventTeamProgramTableWithItemSubItem = async (accessTokenL6: string, allRolesValues: UserRoles[], amountMode:EFinancialAmountModes) => {
  const resultPrepareStateEvent = await createEventAndTeam(accessTokenL6, allRolesValues);
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
export const prepareStateHouseholdAddSubmitUpdateFAPayment = async (accessTokenL6: string, event:IEventEntity, tableId:string, paymentStatus:PaymentStatus, paymentModalities: EPaymentModalities) => {
  const resultPrepareStateHousehold = await prepareStateHousehold(accessTokenL6, event);
  const caseFile = resultPrepareStateHousehold.registrationResponse.caseFile;
  const provider = resultPrepareStateHousehold.provider;
  const createdFinancialAssistancePayment = await addFinancialAssistancePayment(provider, paymentModalities, caseFile.id, tableId);
  const submittedFinancialAssistancePayment = await submitFinancialAssistancePayment(provider, createdFinancialAssistancePayment.id);
  await updateFinancialAssistancePayment(provider, submittedFinancialAssistancePayment.id, submittedFinancialAssistancePayment.groups[0].id, paymentStatus);
  return { caseFile, submittedFinancialAssistancePayment };
};

/**
 * Creates a Mass Financial Assistance using custom xlsx file
 * @param accessToken
 * @param event
 * @param tableId
 * @param householdQuantity
 * @param fileName
 * @param tableName
 */
// eslint-disable-next-line
export const prepareStateMassActionFinancialAssistanceCustomFile = async (accessToken: string, event:IEventEntity, tableId: string, householdQuantity: number, fileName: string, tableName = 'MassActionTable') => {
  const responseCreateHouseholds = await prepareStateMultipleHouseholds(accessToken, event, householdQuantity);
  const caseFileCreated1 = responseCreateHouseholds.householdsCreated[0].registrationResponse.caseFile;
  const caseFileCreated2 = responseCreateHouseholds.householdsCreated[1].registrationResponse.caseFile;
  const caseFileCreated3 = responseCreateHouseholds.householdsCreated[2].registrationResponse.caseFile;
  await searchCaseFilesRecursively(responseCreateHouseholds.provider, [caseFileCreated1, caseFileCreated2, caseFileCreated3]);
  const generatedFaCustomOptionsXlsxFileData = await fixtureGenerateFaCustomOptionsXlsxFile([caseFileCreated1, caseFileCreated2, caseFileCreated3], tableId, tableName, fileName);
  const mockCreateMassFinancialAssistanceCustomFile = mockCreateMassFinancialAssistanceCustomFileRequest(event.id, generatedFaCustomOptionsXlsxFileData);
  // eslint-disable-next-line
  const responseMassFinancialAssistance = await responseCreateHouseholds.provider.massActions.create('financial-assistance-custom-options', mockCreateMassFinancialAssistanceCustomFile);
  return { responseMassFinancialAssistance, responseCreateHouseholds };
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
// eslint-disable-next-line
export const prepareStateMassActionFinancialAssistanceUploadFile = async (accessToken: string, event:IEventEntity, tableId: string, programId: string, householdQuantity: number, filePath: string) => {
  const responseCreateHouseholds = await prepareStateMultipleHouseholds(accessToken, event, householdQuantity);
  const caseFileCreated1 = responseCreateHouseholds.householdsCreated[0].registrationResponse.caseFile;
  const caseFileCreated2 = responseCreateHouseholds.householdsCreated[1].registrationResponse.caseFile;
  const caseFileCreated3 = responseCreateHouseholds.householdsCreated[2].registrationResponse.caseFile;
  await searchCaseFilesRecursively(responseCreateHouseholds.provider, [caseFileCreated1, caseFileCreated2, caseFileCreated3]);
  const generatedFaCsvData = fixtureGenerateFaCsvFile([caseFileCreated1, caseFileCreated2, caseFileCreated3], tableId, filePath);
  const mockCreateMassFinancialAssistanceUploadCsvFile = mockCreateMassFinancialAssistanceUploadCsvFileRequest(event.id, tableId, programId, generatedFaCsvData);
  // eslint-disable-next-line
  const responseMassFinancialAssistance = await responseCreateHouseholds.provider.massActions.create('financial-assistance', mockCreateMassFinancialAssistanceUploadCsvFile);
  return { responseMassFinancialAssistance, responseCreateHouseholds };
};
