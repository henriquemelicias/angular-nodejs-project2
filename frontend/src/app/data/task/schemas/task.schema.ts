import { UserSchema } from "@app/data/user/schemas/user.schema";

export interface TaskSchema {
    _id?: string;
    name: string;
    priority: string;
    percentage: number;
    madeByUser: string;
    users?: UserSchema[];
}