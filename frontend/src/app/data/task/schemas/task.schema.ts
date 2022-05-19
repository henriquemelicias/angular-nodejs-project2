import { ChecklistItemSchema } from '@data/task/schemas/checklist-item.schema'
import { TaskPriorityEnum } from "@data/task/enums/task-priority.enum";

export interface TaskSchema {
    _id: string;
    name: string;
    priority: TaskPriorityEnum;
    percentage: number;
    madeByUser: string;
    startDate?: Date;
    endDate?: Date;
    users: string[];
    checklist: ChecklistItemSchema[];
}