import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpSettings } from '@core/constants/http-settings.const';
import { Observable } from 'rxjs';

@Injectable( {
                 providedIn: 'root'
             } )
export class ProjectTeamService {

    private url = HttpSettings.API_URL + "/teams"

    constructor(
        private http: HttpClient
    ) { }

    addTeam( teamName: String ): Observable<void> {

        return this.http.post<void>( this.url, { name: teamName }, HttpSettings.HEADER_CONTENT_TYPE_JSON );
    }
}
