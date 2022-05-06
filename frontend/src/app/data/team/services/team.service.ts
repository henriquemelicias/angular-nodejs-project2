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

    public static TEAMS_PER_PAGE = 10;
    private static _API_URI = HttpSettings.API_URL + "/teams"

    private static _teamsByPage$ = new BehaviorSubject<TeamSchema[][] | undefined>( undefined );
    private static _currentTeamsByPage?: TeamSchema[][];

    constructor(
        private http: HttpClient
    ) { }

    public addTeam( teamName: String ): Observable<void> {

        return this.http.post<void>( TeamService._API_URI, { name: teamName }, HttpSettings.HEADER_CONTENT_TYPE_JSON );
    }

    public static getTeamsByPage$(): Observable<TeamSchema[][] | undefined> {
        return this._teamsByPage$.asObservable();
    }

    public getTeamsByPage( numTeams: Number, numPage: Number ): Observable<TeamSchema[]> {
        return this.http.get<TeamSchema[]>(
            TeamService._API_URI + '/by-pages?numTeams=' + numTeams + '&numPage=' + numPage,
            HttpSettings.HEADER_CONTENT_TYPE_JSON
        );
    }

    public getNumberOfTeams(): Observable<{ numberOfTeams: number }> {
        return this.http.get<{ numberOfTeams: number }>(
            TeamService._API_URI + '/num-entries',
            HttpSettings.HEADER_CONTENT_TYPE_JSON
        );
    }

    public loadTeamsByPage$( numPage: Number ) {
        TeamService._currentTeamsByPage = TeamService._teamsByPage$.getValue();

        TeamService._currentTeamsByPage = TeamService._currentTeamsByPage ? TeamService._currentTeamsByPage : [];

        while ( numPage > TeamService._currentTeamsByPage.length ) {
            TeamService._currentTeamsByPage.push( [] );
        }

        const index = Number( numPage ) - 1;

        this.getTeamsByPage( TeamService.TEAMS_PER_PAGE, numPage ).subscribe(
            {
                next: teams => {
                    if ( !TeamService._currentTeamsByPage ) return;

                    TeamService._currentTeamsByPage[index] = teams;
                    TeamService._teamsByPage$.next( TeamService._currentTeamsByPage );
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
}
