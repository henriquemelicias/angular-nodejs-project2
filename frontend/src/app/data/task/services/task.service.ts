import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpSettings } from '@app/core/constants/http-settings.const';
import { TaskSchema } from '@data/task/schemas/task.schema.js';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private tasksUrl = HttpSettings.API_URL + "/task";
  constructor(private http: HttpClient) { }

  //Post
  addTask(task: TaskSchema): Observable<TaskSchema> {
    return this.http.post<TaskSchema>( this.tasksUrl + "/create", task, HttpSettings.HEADER_CONTENT_TYPE_JSON);
  }

  //Delete
  deleteTask(id: string): Observable<TaskSchema> {
    return this.http.delete<TaskSchema>( this.tasksUrl + "/" + id, HttpSettings.HEADER_CONTENT_TYPE_JSON);
  }
}
