import { IProvider } from '@/services/provider';
import { mockCreateEvent } from '@libs/cypress-lib/mocks/events/event';
import { mockCreateAssessmentRequest } from '@libs/cypress-lib/mocks/events/assessment';
import { UserRoles } from '@libs/cypress-lib/support/msal';
import { mockProgram } from '@libs/cypress-lib/mocks/programs/program';
import { mockCreateFinancialAssistanceTableRequest } from '@libs/cypress-lib/mocks/financialAssistance/financialAssistanceTables';
import { useProvider } from 'cypress/provider/provider';
import { IEventEntity } from '@libs/entities-lib/event';
import { mockCreateHouseholdRequest } from '@libs/cypress-lib/mocks/household/household';
import { mockCreateMassFinancialAssistanceRequest } from '@libs/cypress-lib/mocks/mass-actions/massFinancialAssistance';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { mockFinancialAssistancePaymentRequest, mockUpdatePaymentRequest } from '@libs/cypress-lib/mocks/financialAssistance/financialAssistancePayment';
import { EPaymentModalities } from '@libs/entities-lib/program';
import { PaymentStatus } from '@libs/entities-lib/financial-assistance-payment';
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
 * Creates a program, adds financial assistance table to it with an Item and Sub-item
 * @param provider
 * @param eventId
 * @param amountType
 */
export const createProgramWithTableWithItemAndSubItem = async (provider: IProvider, eventId: string, amountType:EFinancialAmountModes) => {
  const { program, mockCreateProgram } = await createProgram(provider, eventId);
  const mockCreateFinancialAssistanceTable = mockCreateFinancialAssistanceTableRequest(amountType, { eventId, programId: program.id });
  const table = await provider.financialAssistanceTables.createFinancialAssistanceTable(mockCreateFinancialAssistanceTable);
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

// verifies if casefile created is indexed through search and wait
const searchCasefileAndWait = async (provider: IProvider, caseFileId: string, maxAttempt = 10): Promise<number> => {
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
          cy.wait(2000)
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
  const searchResult = await searchCasefileAndWait(provider, caseFileId);
  if (searchResult === 1) {
    const mockCreateMassFinancialAssistance = mockCreateMassFinancialAssistanceRequest(event, { eventId, tableId, programId });
    const responseMassFinancialAssistance = await provider.massActions.create('financial-assistance-from-list', mockCreateMassFinancialAssistance);
    return { responseMassFinancialAssistance, responseCreateHousehold };
  }
    throw new Error('Event index not yet updated');
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
