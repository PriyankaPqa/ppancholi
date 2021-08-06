import { ITeamEntity, ITeamMember, ITeamMetadata } from '@/entities/team';
import {
  IBaseActions, IBaseActionsMock, IBaseGetters, IBaseGettersMock, IBaseMutations, IBaseMutationsMock,
} from '../base';

export interface IGetters extends IBaseGetters<ITeamEntity, ITeamMetadata> {
}

export interface IGettersMock extends IBaseGettersMock<ITeamEntity, ITeamMetadata> {
}

export interface IActions extends IBaseActions<ITeamEntity, ITeamMetadata, uuid> {
  getTeamsAssignable(eventId: uuid): Promise<ITeamEntity[]>;
  createTeam(payload: ITeamEntity): Promise<ITeamEntity>;
  editTeam(payload: ITeamEntity): Promise<ITeamEntity>;
  addTeamMembers(teamId: uuid, teamMembers: ITeamMember[]): Promise<ITeamEntity>;
  removeTeamMember(teamId: uuid, teamMemberId: uuid): Promise<ITeamEntity>;
}

export interface IActionsMock extends IBaseActionsMock<ITeamEntity, ITeamMetadata> {
  getTeamsAssignable: jest.Mock<ITeamEntity[]>;
  createTeam: jest.Mock<ITeamEntity>;
  editTeam: jest.Mock<ITeamEntity>;
  addTeamMembers: jest.Mock<ITeamEntity>;
  removeTeamMember: jest.Mock<ITeamEntity>;
}

export interface IMutations extends IBaseMutations<ITeamEntity, ITeamMetadata> {
 }

export interface IMutationsMock extends IBaseMutationsMock<ITeamEntity, ITeamMetadata> {
}

export interface IStorageMake {
  getters: IGetters;
  actions: IActions;
  mutations: IMutations;
}

export interface IStorageMakeMock {
  getters: IGettersMock;
  actions: IActionsMock;
  mutations: IMutationsMock;
}

export interface IStorage {
  make(): IStorageMake
}

export interface IStorageMock {
  make(): IStorageMake
}
