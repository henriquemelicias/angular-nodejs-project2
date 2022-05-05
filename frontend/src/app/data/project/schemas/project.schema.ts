import { TaskSchema } from "@data/task/schemas/task.schema";

export interface ProjectSchema {
    name: string;
    acronym: string;
    startDate: Date;
    endDate?: Date;
    tasks: TaskSchema[];
}