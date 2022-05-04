import { UserSchema } from '@data/user/schemas/user.schema';

export interface Team {
  _id: string;
  name: string;
  members: UserSchema[]
}