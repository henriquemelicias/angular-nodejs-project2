
export interface ProjectSchema {
    name: string;
    acronym: string;
    startDate: Date;
    endDate?: Date;
    tasks: string[];
}