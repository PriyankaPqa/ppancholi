Cypress.Commands.add('getByDataTest', ({ selector, type = '' }, ...options) => cy.get(`${type}[data-test=${selector}]`, ...options));

Cypress.Commands.add('getByDataTestLike', ({ selector, type = '' }, ...options) => cy.get(`${type}[data-test*=${selector}]`, ...options));

Cypress.Commands.add('escape', () => {
  cy.get('body').type('{esc}');
});
Cypress.Commands.add('selectListElementByIndex', (dataTest: string, index: number, parentSelectorType = 'div') => {
  cy.getByDataTest({ selector: dataTest, type: parentSelectorType }).click();
  cy.then(() => {
    cy.get(`.${dataTest}__item`).eq(index).click();
    cy.get(`.${dataTest}__item`).eq(index).invoke('text').then((listOptionText) => listOptionText);
  });
});

Cypress.Commands.add('selectMultipleElementByIndex', (dataTest: string, indexes: number[]) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const index of indexes) {
    cy.selectListElementByIndex(dataTest, index);
  }
  cy.escape();
});

Cypress.Commands.add('selectListElementByValue', (dataTest: string, value: string) => {
  const valueWithoutSpace = value.replace(/\s/g, '');

  cy.getByDataTest({ selector: dataTest, type: 'div' }).click();
  cy.then(() => {
    cy.getByDataTest({ selector: `${dataTest}__item--${valueWithoutSpace}`, type: 'div' }).click();
  });
});

Cypress.Commands.add('selectMultipleElementByValues', (dataTest: string, values: string[]) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const value of values) {
    cy.selectListElementByValue(dataTest, value);
  }
  cy.get('body').type('{esc}');
});

Cypress.Commands.add('writeInputSelect', (dataTest: string, value: string) => {
  cy.getByDataTest({ selector: dataTest, type: 'input' }).click();
  cy.getByDataTest({ selector: dataTest, type: 'input' }).type(value);
});

Cypress.Commands.add('selectCountry', (dataTest: string, { countryCode, search }: { countryCode: string; search: string }) => {
  cy.getByDataTest({ selector: dataTest, type: 'div' }).click();
  cy.writeInputSelect(dataTest, search);
  cy.getByDataTest({ selector: countryCode, type: 'div' }).click();
});

Cypress.Commands.add('setDatePicker', (dataTest: string, { year, month, day }: { year: number; month: number; day: number }) => {
  cy.getByDataTest({ selector: dataTest, type: 'input' }).click();
  cy.then(() => {
    cy.get(`div[data-test="${dataTest}-date-picker"] .v-date-picker-header__value button`).as('header').click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500);
    cy.get('@header').click({ multiple: true });
    cy.get(`div[data-test='${dataTest}-date-picker'] ul.v-date-picker-years`)
    .contains(`${year.toString()}`)
    .click();

    cy.get(`div[data-test='${dataTest}-date-picker']`)
    .find('.v-date-picker-table--month')
    .find('tbody tr td button')
    .as('months');

    cy.get('@months').then((months) => {
      const monthSelector = months[month - 1];
      monthSelector.click();
      cy.get(`div[data-test='${dataTest}-date-picker']`)
            .find('div.v-btn__content')
            .contains(`${day}`)
            .click();
      });
  });
});

Cypress.Commands.add('shouldBeRequired', { prevSubject: true }, (subject, label) => {
  cy.wrap(subject)
    .should('have.attr', 'label', label);
  cy.wrap(subject)
    .children()
    .should('have.attr', 'class')
    .and('contain', 'required');
});

Cypress.Commands.add('getAndTrimText', { prevSubject: true }, (subject) => cy.wrap(subject).invoke('text').then((text) => text.trim()));

Cypress.Commands.add('shouldHaveCrossedText', { prevSubject: true }, (subject, shouldBeCrossed) => {
  const assertion = shouldBeCrossed ? 'string' : 'not.have.string';
  cy.wrap(subject).should('have.attr', 'class').and(assertion, 'line-through');
});
export { };
