import type { User } from '@/types';
import { type CrudRepository, createCrudRepository } from '../repository';
import type { KeyValueDriver } from '../localStorageDriver';
import { STORAGE_KEYS } from '../keys';

export type UserRepository = CrudRepository<User>;

export function createUserRepository(driver: KeyValueDriver): UserRepository {
  return createCrudRepository<User>(driver, STORAGE_KEYS.users);
}
