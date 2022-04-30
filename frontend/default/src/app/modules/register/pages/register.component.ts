import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";

import { AuthService, RegisterInput } from "@core/services/auth/auth.service";

import { LoggerService } from "@core/services/logger/logger.service";
import { SanitizedErrorInterface } from "@core/models/sanitized-error.interface";
import { LocalStorageKeyEnum } from "@core/enums/local-storage-key.enum";
import { HttpStatusCode } from "@angular/common/http";
import { AppErrorHandler } from "@core/utils/class-error-handler.util";
import { AlertService } from "@core/services/alert/alert.service";
import { AlertType } from "@core/models/alert.model";
import { AuthStorageService } from "@core/services/auth-storage/auth-storage.service";
import { Router } from "@angular/router";
import { GenericMessage } from "@core/enums/generic-message.enum";

@Component( {
              selector: 'app-pages',
              templateUrl: './register.component.html',
              styleUrls: [ './register.component.css' ]
            } )
export class RegisterComponent implements OnInit {

  public registerForm: FormGroup;

  isPasswordTextType: boolean = false;
  isPasswordConfirmTextType: boolean = false;

  constructor( private formBuilder: FormBuilder,
               private authService: AuthService,
               private authStorage: AuthStorageService,
               private router: Router ) {

    const savedFormValue = JSON.parse( localStorage.getItem( LocalStorageKeyEnum.REGISTER_FORM )! );

    // Initial form and validators.
    this.registerForm = formBuilder.group(
      {
        username: [
          savedFormValue && savedFormValue.username || '', [
            Validators.required,
            Validators.minLength( 3 ),
            Validators.maxLength( 20 )
          ]
        ],
        email: [
          savedFormValue && savedFormValue.email || '', [
            Validators.required,
            Validators.email
          ]
        ],
        password: [
          '', [
            Validators.required,
            Validators.minLength( 8 ),
            Validators.maxLength( 50 ),
            Validators.pattern( "(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).*" )
          ]
        ],
        passwordConfirm: [
          '', [
            Validators.required
          ]
        ]
      } );

    this.registerForm.valueChanges.subscribe( value => {
      localStorage.setItem( LocalStorageKeyEnum.REGISTER_FORM, JSON.stringify( {
                                                                                 username: value.username,
                                                                                 email: value.email
                                                                               } ) );
    } );
  }

  ngOnInit(): void {
  }

  get form(): { [key: string]: AbstractControl; } {
    return this.registerForm.controls;
  }

  public togglePasswordFieldTextType() {
    this.isPasswordTextType = !this.isPasswordTextType;
  }

  public togglePasswordConfirmFieldTextType() {
    this.isPasswordConfirmTextType = !this.isPasswordConfirmTextType;
  }

  public onSubmit() {
    const logCallers = LoggerService.setCaller( this, this.onSubmit );

    const registerInput = {} as RegisterInput;
    registerInput.username = this.registerForm.controls['username'].value;
    registerInput.password = this.registerForm.controls['password'].value;
    registerInput.email = this.registerForm.controls['email'].value;

    LoggerService.info( "HTTP register request sent with: " + JSON.stringify( registerInput ), logCallers );

    this.authService.register( registerInput ).subscribe(
      {
        next: _ => {
          this.registerForm.reset();

          // Go to login.
          this.router.navigate( [ '/login' ] ).then(
            _ => {
              setTimeout( () => {
                LoggerService.info(
                  'Redirected to /login due to successful registration.',
                  LoggerService.setCaller( this, this.onSubmit )
                );

                AlertService.alertToApp(
                  AlertType.Success,
                  'Registration successful',
                  { isAutoClosed: true },
                  logCallers
                );
              } );
            },
            error => {
              LoggerService.error( 'Redirect to /login unsuccessful: ' + JSON.stringify( error ), logCallers );
              AlertService.alertToApp( AlertType.Error, JSON.stringify( error ) );
            }
          );
        },
        error: ( error: SanitizedErrorInterface ) => {
          if ( error.hasBeenHandled ) return;

          const errorHandler = new AppErrorHandler( error );
          errorHandler
            .serverErrorHandler( () => {

              if ( errorHandler.error.status === HttpStatusCode.Conflict ) {
                AlertService.error(
                  error.message,
                  { id: 'alert-register', hasAnimationShake: false },
                  logCallers
                );
                errorHandler.hasBeenHandled = true;
              }
            } )
            .ifErrorHandlers( null, () => {
              AlertService.alertToApp(
                AlertType.Error,
                GenericMessage.UNEXPECTED_UNHANDLED_ERROR + error.message,
                null,
                logCallers
              );
            } ).toObservable();
        }
      } );
  }

}
