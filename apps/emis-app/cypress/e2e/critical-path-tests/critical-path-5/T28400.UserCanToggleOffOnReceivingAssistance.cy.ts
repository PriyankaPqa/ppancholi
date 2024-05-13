import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { ECurrentAddressTypes, ICurrentAddress } from '@libs/entities-lib/value-objects/current-address';
import { format } from 'date-fns';
import { faker } from '@faker-js/faker';
import { returnDateInFormat } from '@libs/cypress-lib/helpers';
import { ECanadaProvinces } from '@libs/shared-lib/types';
import { getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
import { CaseFileImpactedIndividualsHomePage } from '../../../pages/casefiles/case-file-impacted-individuals/caseFileImpactedIndividualsHome.page';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { createEventAndTeam, prepareStateHousehold, updatePersonsCurrentAddress } from '../../helpers/prepareState';
import { CaseFileDetailsPage } from '../../../pages/casefiles/caseFileDetails.page';

const canRoles = [
  UserRoles.level6,
  UserRoles.level5,
  UserRoles.level4,
  UserRoles.level3,
  UserRoles.level2,
  UserRoles.level1,
];

const cannotRoles = [
  UserRoles.level0,
  UserRoles.contributor1,
  UserRoles.contributor2,
  UserRoles.contributor3,
  UserRoles.readonly,
];

const { filteredCanRoles, filteredCannotRoles, allRoles } = getRoles(canRoles, cannotRoles);

let accessTokenL6 = '';
let fullName = '';
let currentAddress = {} as ICurrentAddress;
const mockRemoveMemberFromReceivingAssistanceRationale = 'Mock-string-remove-member-from-receiving-assistance';
const mockMemberReceivingAssistanceRationale = 'Mock-string-member-receiving-assistance';

describe('[T28400] User can toggle off/on receiving assistance', { tags: ['@impacted-individuals'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const resultCreatedEvent = await createEventAndTeam(accessTokenL6, allRoles);
      cy.wrap(resultCreatedEvent.provider).as('provider');
      cy.wrap(resultCreatedEvent.event).as('event');
      cy.wrap(resultCreatedEvent.team).as('teamCreated');
    });
  });

  after(function () {
    if (this.provider && this.teamCreated?.id) {
      removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
    }
  });

  describe('Can Roles', () => {
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.then(async function () {
            const resultHousehold = await prepareStateHousehold(accessTokenL6, this.event);
            currentAddress = await updatePersonsCurrentAddress(
              this.provider,
              [resultHousehold.registrationResponse.household.primaryBeneficiary],
              ECurrentAddressTypes.FriendsFamily,
              { checkIn: format(Date.now(), 'PP'), checkOut: format(faker.date.future(), 'PP') },
              );
            const { mockCreateHousehold } = resultHousehold;
            fullName = `${mockCreateHousehold.primaryBeneficiary.identitySet.firstName} ${mockCreateHousehold.primaryBeneficiary.identitySet.lastName}`;
            cy.wrap(resultHousehold.registrationResponse.caseFile).as('caseFile');
            cy.wrap(resultHousehold.registrationResponse.caseFile.id).as('caseFileId');
            cy.login(roleName);
            cy.goTo(`casefile/${resultHousehold.registrationResponse.caseFile.id}/impactedIndividuals`);
          });
        });

        it('can toggle off/on receiving assistance', () => {
          const caseFileImpactedIndividualsHomePage = new CaseFileImpactedIndividualsHomePage();
          caseFileImpactedIndividualsHomePage.getPrimaryMemberCard().within(() => {
            caseFileImpactedIndividualsHomePage.getPrimaryMemberLabel().should('be.visible');
            caseFileImpactedIndividualsHomePage.getCurrentAddressType().should('eq', 'Friends / Family');
            caseFileImpactedIndividualsHomePage.getCheckIn().should('eq', returnDateInFormat(currentAddress.checkIn as string, 'PP'));
            caseFileImpactedIndividualsHomePage.getCheckOut().should('eq', returnDateInFormat(currentAddress.checkOut as string, 'PP'));
            caseFileImpactedIndividualsHomePage.getCurrentAddressStreet().should('eq', `${currentAddress.address.streetAddress}  #${currentAddress.address.unitSuite}`.trim());
            caseFileImpactedIndividualsHomePage.getCurrentAddressLine().should(
              'eq',
              `${currentAddress.address.city}, ${ECanadaProvinces[currentAddress.address.province]}, ${currentAddress.address.postalCode}`,
            );
            caseFileImpactedIndividualsHomePage.getCurrentAddressCountry().should('eq', currentAddress.address.country);
            caseFileImpactedIndividualsHomePage.getIsCrcProvided().should('eq', 'No');
            caseFileImpactedIndividualsHomePage.getEditCurrentTemporaryAddressButton().should('be.enabled');
            caseFileImpactedIndividualsHomePage.getReceivingAssistanceToggle().should('be.checked');
            caseFileImpactedIndividualsHomePage.getPreviousTemporaryAddressExpandButton().should('be.visible');
            caseFileImpactedIndividualsHomePage.getReceivingAssistanceToggle().click({ force: true });
          });
            caseFileImpactedIndividualsHomePage.getImpactedIndividualRationaleDialogTitle().should('eq', 'Remove member from receiving assistance'.trim());
            caseFileImpactedIndividualsHomePage.getDialogCloseButton().should('be.visible');
            caseFileImpactedIndividualsHomePage.getDialogCancelButton().should('be.visible');
            caseFileImpactedIndividualsHomePage.getDialogSubmitButton().should('be.visible');
            caseFileImpactedIndividualsHomePage.getUserAndDate().should(
              'eq',
              `Removed by: ${getUserName(roleName)} (${getUserRoleDescription(roleName)}) - ${format(new Date(), 'PP')}`,
              );
            caseFileImpactedIndividualsHomePage.getRationaleInput().get('label').getAndTrimText().should('eq', 'Rationale *'.trim());
            caseFileImpactedIndividualsHomePage.getRationaleInputTextArea().type(mockRemoveMemberFromReceivingAssistanceRationale);
            caseFileImpactedIndividualsHomePage.getDialogSubmitButton().click();

          caseFileImpactedIndividualsHomePage.refreshUntilImpactedIndividualsCardPinnedActivityUpdated(mockRemoveMemberFromReceivingAssistanceRationale);
          caseFileImpactedIndividualsHomePage.getPrimaryMemberCard().within(() => {
            caseFileImpactedIndividualsHomePage.getReceivingAssistanceToggle().should('not.be.checked');
            caseFileImpactedIndividualsHomePage.getPinnedActivityUserInformation().invoke('text').should(
              'eq',
              `Individual no longer receiving assistance by ${getUserName(roleName)} (${getUserRoleDescription(roleName)}) - ${format(new Date(), 'PP')}`,
            );
            caseFileImpactedIndividualsHomePage.getPinnedActivityRationale().should(
              'eq',
              mockRemoveMemberFromReceivingAssistanceRationale,
            );
            caseFileImpactedIndividualsHomePage.getReceivingAssistanceToggle().click({ force: true });
          });
          caseFileImpactedIndividualsHomePage.getImpactedIndividualRationaleDialogTitle().should('eq', 'Member receiving assistance'.trim());
          caseFileImpactedIndividualsHomePage.getUserAndDate().should(
            'eq',
            `Actioned by: ${getUserName(roleName)} (${getUserRoleDescription(roleName)}) - ${format(new Date(), 'PP')}`,
            );
          caseFileImpactedIndividualsHomePage.getRationaleInput().get('label').getAndTrimText().should('eq', 'Rationale *'.trim());
          caseFileImpactedIndividualsHomePage.getRationaleInputTextArea().type(mockMemberReceivingAssistanceRationale);
          caseFileImpactedIndividualsHomePage.getDialogSubmitButton().click();
          caseFileImpactedIndividualsHomePage.refreshUntilImpactedIndividualsCardPinnedActivityUpdated(mockMemberReceivingAssistanceRationale);
          caseFileImpactedIndividualsHomePage.getPrimaryMemberCard().within(() => {
            caseFileImpactedIndividualsHomePage.getReceivingAssistanceToggle().should('be.checked');
            caseFileImpactedIndividualsHomePage.getPinnedActivityUserInformation().invoke('text').should(
              'eq',
              `Individual is receiving assistance by ${getUserName(roleName)} (${getUserRoleDescription(roleName)}) - ${format(new Date(), 'PP')}`,
            );
            caseFileImpactedIndividualsHomePage.getPinnedActivityRationale().should(
              'eq',
              mockMemberReceivingAssistanceRationale,
            );
          });
          caseFileImpactedIndividualsHomePage.goToCaseFileActivityPage();
          const caseFileActivityHomePage = new CaseFileDetailsPage(); // avoiding dependency cycle error
          caseFileActivityHomePage.waitAndRefreshUntilCaseFileActivityVisibleWithBody('Receiving assistance');
          caseFileActivityHomePage.getCaseFileActivityTitle(0).should('eq', 'Impacted individuals edited');
          caseFileActivityHomePage.getCaseFileActivityBody(0).should('eq', `${fullName} - Receiving assistance \n${mockMemberReceivingAssistanceRationale}`.trim());
          caseFileActivityHomePage.getCaseFileActivityTitle(1).should('eq', 'Impacted individuals edited');
          caseFileActivityHomePage.getCaseFileActivityBody(1).should(
            'eq',
            `${fullName} - No longer receiving assistance \n${mockRemoveMemberFromReceivingAssistanceRationale}`.trim(),
            );
        });
      });
    }
  });

  describe('Cannot Roles', () => {
    for (const roleName of filteredCannotRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.then(async function () {
            const resultHousehold = await prepareStateHousehold(accessTokenL6, this.event);
            const { mockCreateHousehold } = resultHousehold;
            fullName = `${mockCreateHousehold.primaryBeneficiary.identitySet.firstName} ${mockCreateHousehold.primaryBeneficiary.identitySet.lastName}`;
            cy.wrap(resultHousehold.registrationResponse.caseFile).as('caseFile');
            cy.wrap(resultHousehold.registrationResponse.caseFile.id).as('caseFileId');
            cy.login(roleName);
            cy.goTo(`casefile/${resultHousehold.registrationResponse.caseFile.id}/impactedIndividuals`);
          });
        });
        it('should see the Receiving Assistance toggle disabled', () => {
          const caseFileImpactedIndividualsHomePage = new CaseFileImpactedIndividualsHomePage();
          caseFileImpactedIndividualsHomePage.getReceivingAssistanceToggle().should('be.disabled');
        });
      });
    }
  });
});
