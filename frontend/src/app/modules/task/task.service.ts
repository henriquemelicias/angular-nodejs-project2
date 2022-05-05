import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpSettings } from '@app/core/constants/http-settings.const';
import { LoggerService } from '@app/core/services/logger/logger.service';
import { Task } from '@modules/task/task';
import { catchError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private tasksUrl = HttpSettings.API_URL + "/task/";
  constructor(private http: HttpClient) { }

  //Post
  addTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.tasksUrl + task.name, task, HttpSettings.HEADER_CONTENT_TYPE_JSON);
  }

  //Delete
  deleteTask(name: string): Observable<Task> {
    return this.http.delete<Task>(this.tasksUrl + name, HttpSettings.HEADER_CONTENT_TYPE_JSON);
  }
}
