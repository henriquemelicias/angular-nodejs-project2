import { UserSchema } from '@data/user/schemas/user.schema';
import { Project } from '../project/project';

export interface Team {
  _id?: string;
  name: string;
  members: UserSchema[];
  project: Project
}