import { HouseholdActivity, mockHouseholdActivities } from '../index';

export default class MockHouseholdActivity extends HouseholdActivity {
  constructor() {
    return mockHouseholdActivities()[0];
  }

  getTemplateData() { }

  getActivityName() { }
}
