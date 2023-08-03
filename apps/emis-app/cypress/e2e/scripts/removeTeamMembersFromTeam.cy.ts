import { IProvider } from '@/services/provider';
import { useProvider } from 'cypress/provider/provider';
import { removeTeamMembersFromTeam } from '../helpers/teams';
import { teamIdData } from './team-ids';

let accessTokenL6 = '';
let provider = null as IProvider;

describe('Remove team members', () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      provider = useProvider(accessTokenL6);
      cy.wrap(provider).as('provider');
    });
  });
  it('should remove team members', async function () {
    const teamIds = teamIdData.trim().split('\n').map((str) => `${str}`);

    for (const teamId of teamIds) {
      // eslint-disable-next-line
      await removeTeamMembersFromTeam(teamId.toLowerCase(), this.provider);
    }
  });
});
