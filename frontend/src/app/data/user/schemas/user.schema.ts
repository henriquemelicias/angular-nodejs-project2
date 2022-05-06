import { TaskSchema } from "@app/data/task/schemas/task.schema";

export interface UserSchema {
  _id: string;
  username: string;
  roles: string[];
  tasks: TaskSchema[];
}
