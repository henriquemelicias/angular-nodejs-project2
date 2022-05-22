import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpSettings } from '@app/core/constants/http-settings.const';
import { Observable } from 'rxjs';
import { MeetingSchema } from "@data/meetings/schemas/meeting.schema";

@Injectable( {
                 providedIn: 'root'
             } )
export class MeetingService {

    private static _API_URI = HttpSettings.API_URL + "/meetings";

    constructor( private http: HttpClient ) { }

    public getTeamMeetingPossibleSessions( teamName: string,
                                           startDate: Date,
                                           endDate: Date,
                                           duration: Date ): Observable<{ startDate: Date, endDate: Date }[]> {
        return this.http.get<{ startDate: Date, endDate: Date }[]>(
            MeetingService._API_URI + "/team/possible/" + teamName + "?startDate=" + startDate + "&endDate=" + endDate +
            "&duration=" + duration,
            HttpSettings.HEADER_CONTENT_TYPE_JSON
        );
    };

    addTeamMeeting( teamMeeting: MeetingSchema ): Observable<void> {
        return this.http.post<void>(
            MeetingService._API_URI + "/teams", teamMeeting, HttpSettings.HEADER_CONTENT_TYPE_JSON
        );
    }

    getMeetingsByTeam( teamName: string ): Observable<MeetingSchema[]> {
        return this.http.get<MeetingSchema[]>(
            MeetingService._API_URI + "/team/" + teamName,
            HttpSettings.HEADER_CONTENT_TYPE_JSON
        );
    }
}
