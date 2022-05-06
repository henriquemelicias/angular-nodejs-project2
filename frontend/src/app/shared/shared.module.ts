import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IfMediaDirective } from './directives/if-media.directive';
import { AlertComponent } from './components/alert/alert.component';
import { ModalComponent } from './components/modal/modal.component';
import { DropdownFormComponent } from '@shared/components/dropdown-form/dropdown-form.component';

/* Make sure to export to declare AND export anything to be used by other components. */
@NgModule( {
               declarations: [
                   IfMediaDirective,
                   AlertComponent,
                   ModalComponent,
                   DropdownFormComponent
               ],
               imports: [
                   CommonModule
               ],
               exports: [
                   IfMediaDirective,
                   AlertComponent,
                   DropdownFormComponent,
                   ModalComponent
               ]
           } )
export class SharedModule {}
