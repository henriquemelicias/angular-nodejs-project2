import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpSettings } from '@app/core/constants/http-settings.const';
import { TaskSchema } from '@data/task/schemas/task.schema.js';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private tasksUrl = HttpSettings.API_URL + "/tasks";
  constructor(private http: HttpClient) { }

  //Post
  addTask(task: TaskSchema): Observable<void> {
    return this.http.post<void>( this.tasksUrl , task, HttpSettings.HEADER_CONTENT_TYPE_JSON);
  }

  //Delete
  deleteTask(id: string): Observable<TaskSchema> {
    return this.http.delete<TaskSchema>( this.tasksUrl + "/" + id, HttpSettings.HEADER_CONTENT_TYPE_JSON);
  }

  //Get
  getTask(id: string): Observable<TaskSchema> {
    return this.http.get<TaskSchema>(this.tasksUrl + "/" + id, HttpSettings.HEADER_CONTENT_TYPE_JSON);
  }

  getTasks(): Observable<TaskSchema[]> {
    return this.http.get<TaskSchema[]>(this.tasksUrl, HttpSettings.HEADER_CONTENT_TYPE_JSON);
  }

  updateTask(task: TaskSchema): Observable<void> {
    return this.http.put<void>(this.tasksUrl + "/" + task._id, task, HttpSettings.HEADER_CONTENT_TYPE_JSON);
  }
   
}
