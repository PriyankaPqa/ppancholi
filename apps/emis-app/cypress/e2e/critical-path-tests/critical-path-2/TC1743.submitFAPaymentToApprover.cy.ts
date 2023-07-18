import { UserRoles } from '@libs/cypress-lib/support/msal';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { createApprovalTable, createCustomProgram, createEventAndTeam, createFATable } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';

const canRoles = {
  Level6: UserRoles.level6,
};

const canRolesValues = [...Object.values(canRoles)] as UserRoles[];

let accessTokenL6 = '';

describe('#TC1743# - Submit FA payment to an Approver', { tags: ['@approval', '@financial-assistance'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const resultPrepareStateEvent = await createEventAndTeam(accessTokenL6, canRolesValues);
      const resultProgram = await createCustomProgram(resultPrepareStateEvent.provider, resultPrepareStateEvent.event.id, true);
      const resultFATable = await createFATable(resultPrepareStateEvent.provider, resultPrepareStateEvent.event.id, resultProgram.program.id, EFinancialAmountModes.Fixed);
      await createApprovalTable(resultPrepareStateEvent.provider, resultPrepareStateEvent.event.id, resultProgram.program.id);
      cy.wrap(resultFATable.table.id).as('tableId');
    });
  });

  after(function () {
    if (this.provider && this.teamCreated?.id) {
      removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
    }
  });

  describe('Can Roles', () => {
    for (const [roleName, roleValue] of Object.entries(canRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.login(roleValue);
        });
        // eslint-disable-next-line
        it('should successfully submit FA payment to an Approver', function() {
        });
      });
    }
  });
});
