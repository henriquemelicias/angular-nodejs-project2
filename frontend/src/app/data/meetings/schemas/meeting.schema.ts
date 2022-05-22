import { MeetingTypeEnum } from "@data/meetings/enums/meeting-type.enum";

export interface MeetingSchema {
    _id: string;
    type: MeetingTypeEnum,
    associatedEntity: string,
    users: string[],
    startDate: Date,
    endDate: Date
}