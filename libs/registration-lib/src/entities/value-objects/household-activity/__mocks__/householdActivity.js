import { HouseholdActivity, mockHouseholdActivities } from '..';

export default class MockHouseholdActivity extends HouseholdActivity {
  constructor() {
    return mockHouseholdActivities()[0];
  }

  getTemplateData() { }

  getActivityName() { }
}
