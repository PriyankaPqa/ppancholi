import { Selector, t } from 'testcafe';

class PrivacyStatement {
    checkbox: Selector;

    constructor() {
      this.checkbox = Selector('input').withAttribute('data-test', 'isPrivacyAgreed');
    }

    async clickCheckBox() {
      await t.click(this.checkbox);
    }
}

export default new PrivacyStatement();
