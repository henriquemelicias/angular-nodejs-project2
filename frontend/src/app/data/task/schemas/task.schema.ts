export interface TaskSchema {
    _id: string;
    name: string;
    priority: string;
    percentage: number;
    madeByUser: string;
    startDate?: Date;
    endDate?: Date;
    users: string[];
}