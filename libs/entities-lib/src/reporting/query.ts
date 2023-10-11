import { BaseEntity } from '../base';
import {
  IQuery, QueryType, ReportingTopic,
} from './reporting.types';

export class Query extends BaseEntity implements IQuery {
  name: string;

  queryType: QueryType;

  topic: ReportingTopic;

  owner?: uuid;

  state: string;

  constructor(data?: IQuery) {
    if (data) {
      super(data);
      this.name = data.name;
      this.queryType = data.queryType;
      this.topic = data.topic;
      this.owner = data.owner;
      this.state = data.state;
    } else {
      super();
    }
  }
}
