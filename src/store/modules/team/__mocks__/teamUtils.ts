import { mockTeamSearchDataAggregate } from '@/entities/team';

export const aggregateTeamSearchDataWithMembers = jest.fn(() => mockTeamSearchDataAggregate()[0]);

export const buildTeamSearchDataPayload = jest.fn(() => mockTeamSearchDataAggregate()[0]);
