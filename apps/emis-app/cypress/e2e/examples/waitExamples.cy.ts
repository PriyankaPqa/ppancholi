describe('Different ways of waiting', () => {
  beforeEach(() => {
    cy.login();
    cy.goTo('home');
  });

  it.skip('should wait for a event search call to be done', () => {
    // Watch out as several calls could match the RouteMatcher url
    cy.intercept({ method: 'GET', url: '**/event/search/**' }).as('eventSearch');
    cy.wait('@eventSearch');
    cy.log('The search is over');
  });

  it.skip('should wait for a DOM Element to be displayed and refresh until', () => {
    const someSelector = '#app';
    const anotherSelector = 'a[data-test="eventDetail-link_test-auto-event-2023-02-08-2-13-33"]';
    cy.get(someSelector);
    cy.log(`The selector ${someSelector} has been found`);
    cy.waitFirstRefreshUntilDisplayed(() => true, anotherSelector, { interval: 6000, timeout: 30000 });
    cy.get(anotherSelector).should('be.visible');
  });

  it('should wait for event items to be fetched in pinia store then refresh until the selector is found', () => {
    const selector = 'a[data-test="eventDetail-link_test-auto-event-2023-02-08-2-13-33"]';
    cy.waitItemsRefreshUntilDisplayed('event-entities', selector, { timeout: 8000, interval: 4000 }); // Options os optional
    cy.get(selector).should('be.visible');
  });
});
