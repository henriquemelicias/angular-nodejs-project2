import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthService, LoginInput, LoginOutput } from "@core/services/auth/auth.service";
import { LoggerService } from "@core/services/logger/logger.service";
import { AlertService } from "@core/services/alert/alert.service";
import { UserSchema } from "@data/user/schemas/user.schema";
import { SanitizedErrorInterface } from "@core/models/sanitized-error.interface";
import { AppErrorHandler } from "@core/utils/class-error-handler.util";
import { HttpStatusCode } from "@angular/common/http";
import { AuthStorageService } from "@core/services/auth-storage/auth-storage.service";
import { AlertType } from "@core/models/alert.model";
import { Router } from "@angular/router";
import { GenericMessageEnum } from "@core/enums/generic-message.enum";
import { UserService } from "@data/user/services/user.service";

@Component( {
              selector: 'app-login',
              templateUrl: './login.component.html',
              styleUrls: [ './login.component.css' ]
            } )
export class LoginComponent implements OnInit {

  public loginForm: FormGroup;
  isPasswordTextType: boolean = false;

  constructor( private formBuilder: FormBuilder,
               private authService: AuthService,
               private router: Router ) {

    // Initial form and validators.
    this.loginForm = formBuilder.group( {
                                          username: [ '', Validators.required ],
                                          password: [ '', Validators.required ]
                                        } );
  }

  ngOnInit(): void {
  }

  get form(): { [key: string]: AbstractControl; } {
    return this.loginForm.controls;
  }

  public togglePasswordFieldTextType() {
    this.isPasswordTextType = !this.isPasswordTextType;
  }

  public onSubmit() {
    const logCallers = LoggerService.setCaller( this, this.onSubmit );

    const loginInput = {} as LoginInput;
    loginInput.username = this.loginForm.controls['username'].value;
    loginInput.password = this.loginForm.controls['password'].value;
    this.loginForm.reset();

    LoggerService.info( "HTTP login request sent with: " + JSON.stringify( loginInput ), logCallers );

    this.authService.login( loginInput ).subscribe(
      {
        next: ( data: LoginOutput ) => {

          AuthStorageService.saveToken( data.token );
          AuthStorageService.saveUser( data as UserSchema );
          UserService.setSessionUser( data as UserSchema );
          LoggerService.info( "Login successful.", logCallers );

          // Go to profile.
          this.router.navigate( [ '/profile' ] ).then(
            _ => {
              setTimeout( () => {
                AlertService.alertToApp( AlertType.Success, 'Login successful', { isAutoClosed: true }, logCallers );
              } );
            },
            error => {
              AlertService.alertToApp( AlertType.Error, JSON.stringify( error ), null, logCallers );
            }
          );
        },
        error: ( error: SanitizedErrorInterface ) => {
          if ( error.hasBeenHandled ) return;

          const errorHandler = new AppErrorHandler( error );
          errorHandler
            .serverErrorHandler( () => {

              if ( errorHandler.error.status === HttpStatusCode.Unauthorized ) {
                AlertService.error(
                  "Invalid username and/or password",
                  { id: 'alert-login', hasAnimationShake: false },
                  logCallers
                );
                errorHandler.hasBeenHandled = true;
              }

            } )
            .ifErrorHandlers( null, () => {
              AlertService.alertToApp(
                  AlertType.Error,
                  GenericMessageEnum.UNEXPECTED_UNHANDLED_ERROR + error.message,
                  null,
                  logCallers
              );
            } );
        }
      }
    )
  }

}
