import { UserSchema } from '@data/user/schemas/user.schema';
import { ProjectSchema } from '@data/project/schemas/project.schema';

export interface TeamSchema {
  _id: string;
  name: string;
  members: UserSchema[];
  project?: ProjectSchema[];
}