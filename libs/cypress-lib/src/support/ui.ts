  Cypress.Commands.add('getByDataTest', ({ selector, type = '' }, ...options) => cy.get(`${type}[data-test=${selector}]`, ...options));

  Cypress.Commands.add('escape', () => {
    cy.get('body').type('{esc}');
  });
  Cypress.Commands.add('selectListElementByIndex', (dataTest:string, index: number, parentSelectorType = 'div') => {
    cy.getByDataTest({ selector: dataTest, type: parentSelectorType })
      .click()
      .then(() => {
        cy.get(`.${dataTest}__item`)
          .eq(index)
          .click()
          .invoke('text')
          .then((listOptionText) => listOptionText);
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

    cy.getByDataTest({ selector: dataTest, type: 'div' })
      .click()
      .then(() => {
        cy.getByDataTest({ selector: `${dataTest}__item--${valueWithoutSpace}`, type: 'div' })
          .click();
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
    cy.getByDataTest({ selector: dataTest, type: 'input' })
      .click()
      .type(value);
  });

  Cypress.Commands.add('selectCountry', (dataTest: string, { countryCode, search }: { countryCode: string; search: string }) => {
    cy.getByDataTest({ selector: dataTest, type: 'div' }).click();
    cy.writeInputSelect(dataTest, search);
    cy.getByDataTest({ selector: countryCode, type: 'div' }).click();
  });

  export {};
