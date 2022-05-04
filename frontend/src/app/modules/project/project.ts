import { Task } from "../task/task";

export interface Project {
    name: string;
    acronym: string;
    startDate: Date;
    endDate?: Date;
    tasks: Task[];
}