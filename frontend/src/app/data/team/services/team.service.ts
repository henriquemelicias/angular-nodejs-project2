import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpSettings } from '@core/constants/http-settings.const';
import { BehaviorSubject, Observable } from 'rxjs';
import { TeamSchema } from "@data/team/schemas/team.schema";
import { AlertService } from "@core/services/alert/alert.service";
import { SanitizedErrorInterface } from "@core/models/sanitized-error.interface";
import { AppErrorHandler } from "@core/utils/class-error-handler.util";
import { AlertType } from "@core/models/alert.model";
import { GenericMessageEnum } from "@core/enums/generic-message.enum";
import { LoggerService } from "@core/services/logger/logger.service";

@Injectable( {
                 providedIn: 'root'
             } )
export class TeamService {

    private static _TEAMS_PER_PAGE = 50;
    private _API_URI = HttpSettings.API_URL + "/teams"

    private static _teams$ = new BehaviorSubject<TeamSchema[][] | undefined>( undefined );
    private static _currentTeam?: TeamSchema[][];

    constructor(
        private http: HttpClient
    ) { }

    public static getTeams$(): Observable<TeamSchema[][] | undefined> {
        return this._teams$.asObservable();
    }

    public loadTeams$( numPage: Number ) {
        TeamService._currentTeam = TeamService._teams$.getValue();

        TeamService._currentTeam = TeamService._currentTeam ? TeamService._currentTeam : [];

        while ( numPage > TeamService._currentTeam.length ) {
            TeamService._currentTeam.push( [] );
        }

        const index = Number( numPage ) - 1;

        this.getTeams( TeamService._TEAMS_PER_PAGE, numPage ).subscribe(
            {
                next: teams => {
                    if ( !TeamService._currentTeam )  return;

                    TeamService._currentTeam[index] = teams;
                    TeamService._teams$.next( TeamService._currentTeam );
                },
                error: ( error: SanitizedErrorInterface ) => {
                    if ( error.hasBeenHandled ) return;

                    const errorHandler = new AppErrorHandler( error );
                    errorHandler
                        .ifErrorHandlers( null, () => {
                            AlertService.alertToApp(
                                AlertType.Error,
                                GenericMessageEnum.UNEXPECTED_UNHANDLED_ERROR + error.message,
                                null,
                                LoggerService.setCaller( "TeamService", "loadTeam$" )
                            );
                        } ).toObservable();
                }
            } );
    }

    addTeam( teamName: String ): Observable<void> {

        return this.http.post<void>( this._API_URI, { name: teamName }, HttpSettings.HEADER_CONTENT_TYPE_JSON );
    }

    getTeams( numTeams: Number, numPage: Number ): Observable<TeamSchema[]> {
        const query = [ { numTeams: numTeams }, { numPage: numPage } ];
        return this.http.get<TeamSchema[]>(
            this._API_URI + '/?numTeams=' + numTeams + '&numPage=' + numPage,
            HttpSettings.HEADER_CONTENT_TYPE_JSON
        );
    }

}
