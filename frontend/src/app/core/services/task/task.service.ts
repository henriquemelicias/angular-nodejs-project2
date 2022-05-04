import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Task } from '@app/core/models/task';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private tasksUrl = 'http://localhost:8000/api/task/'
  constructor(private http: HttpClient) { }

  httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})}

  //Post
  addTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.tasksUrl + task.name, task, this.httpOptions);
  }

   //Delete
   deleteTask(task: Task): Observable<Task> {
    return this.http.delete<Task>(this.tasksUrl + task.name, this.httpOptions);
  }
}
