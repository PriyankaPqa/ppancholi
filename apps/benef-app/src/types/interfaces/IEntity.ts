export interface IEntity {
  validate(skipAgeRestriction?:boolean): string[];
}
