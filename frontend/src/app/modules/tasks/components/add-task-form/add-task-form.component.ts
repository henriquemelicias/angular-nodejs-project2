import { Component, OnInit } from '@angular/core';
import { TaskService } from '@data/task/services/task.service'
import { TaskSchema } from '@data/task/schemas/task.schema';
import { UserService } from '@app/data/user/services/user.service';
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-add-task-form',
    templateUrl: './add-task-form.component.html',
    styleUrls: [ './add-task-form.component.css' ]
})
export class AddTaskFormComponent implements OnInit {

  public taskForm: FormGroup;

  selectedPriority: string = '';
  username: string = "";

  constructor(private taskService: TaskService, private formBuilder: FormBuilder,) {
    
    this.taskForm = formBuilder.group(
      {
          name: [
              '', [
                  Validators.required,
                  Validators.minLength( 4 ),
                  Validators.maxLength( 50 ),
                  Validators.pattern( "[a-zA-Z0-9]*" )
              ]
          ]
  } );

    const userPromise = firstValueFrom( UserService.getSessionUser$() );

    userPromise.then( user => {
      if ( user ) {
        this.username = user.username;
      }
    } );
  }

  ngOnInit(): void {
  }

  public get form(): { [key: string]: AbstractControl; } {
    return this.taskForm.controls;
  }

  public onSubmit(): void {

      const taskName = this.form['name'].value;
      this.addTask( taskName );
  }

  selectChangeHandler (event: any) {
    this.selectedPriority= event.target.value;
  }

  addTask(name: string): void {
    const t:TaskSchema = {name: name, priority: this.selectedPriority, percentage: 0, madeBy: this.username};
    this.taskService.addTask(t).subscribe();
  }

  deleteTask(id: string): void {
    this.taskService.deleteTask(id).subscribe();
  }

}
