import { HouseholdActivity, mockHouseholdActivities } from '../index';

export default class MockHouseholdActivity extends HouseholdActivity {
  constructor() {
    super();
    // eslint-disable-next-line no-constructor-return
    return mockHouseholdActivities()[0];
  }

  getTemplateData() { }

  getActivityName() { }
}
