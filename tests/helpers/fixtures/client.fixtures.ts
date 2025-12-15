import { Client } from '../../../src/domain/client/entities/client.entity';
import { Location } from '../../../src/domain/client/value-objects/location.vo';

export interface ClientFixtureData {
  id?: string;
  userId?: string;
  name?: string;
  phoneNumber?: string;
  country?: string;
  state?: string;
  company?: string;
  specializationIds?: string[];
}

export class ClientFixtures {
  static createClient(overrides: ClientFixtureData = {}): Client {
    const defaults = {
      id: 'client-123',
      userId: 'user-123',
      name: 'John Doe',
      phoneNumber: '+1234567890',
      country: 'United States',
      state: 'California',
      company: 'Tech Corp',
      specializationIds: ['spec-1', 'spec-2'],
    };

    const data = { ...defaults, ...overrides };

    const location = Location.create({
      country: data.country,
      state: data.state,
    });

    return Client.create(data.id, {
      userId: data.userId,
      name: data.name,
      phoneNumber: data.phoneNumber,
      location,
      company: data.company,
      specializationIds: data.specializationIds,
      onboardingCompleted: false,
    });
  }

  static createMinimalClient(overrides: ClientFixtureData = {}): Client {
    const defaults = {
      id: 'client-minimal',
      userId: 'user-minimal',
      name: 'Min User',
      country: 'United States',
      state: 'Texas',
      specializationIds: ['spec-1'],
    };

    const data = { ...defaults, ...overrides };

    const location = Location.create({
      country: data.country,
      state: data.state,
    });

    return Client.create(data.id, {
      userId: data.userId,
      name: data.name,
      location,
      specializationIds: data.specializationIds,
      onboardingCompleted: false,
    });
  }

  static createClientWithMaxSpecializations(overrides: ClientFixtureData = {}): Client {
    const defaults = {
      id: 'client-max-spec',
      userId: 'user-max-spec',
      name: 'Max Specializations',
      country: 'Canada',
      state: 'Ontario',
      specializationIds: ['spec-1', 'spec-2', 'spec-3'], // Maximum 3
    };

    const data = { ...defaults, ...overrides };

    const location = Location.create({
      country: data.country,
      state: data.state,
    });

    return Client.create(data.id, {
      userId: data.userId,
      name: data.name,
      phoneNumber: data.phoneNumber,
      location,
      company: data.company,
      specializationIds: data.specializationIds,
      onboardingCompleted: false,
    });
  }
}