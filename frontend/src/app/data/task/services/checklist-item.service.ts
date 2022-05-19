import { Injectable } from '@angular/core';
import { HttpSettings } from '@app/core/constants/http-settings.const';
import { ChecklistItemSchema } from '../schemas/checklist-item.schema';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ChecklistItemService {

  constructor(private http: HttpClient) { }

  private static _API_URI = HttpSettings.API_URL + "/checklistItem";

  // Post
  public addChecklistItem( item: ChecklistItemSchema ): Observable<void> {
    return this.http.post<void>( ChecklistItemService._API_URI, item, HttpSettings.HEADER_CONTENT_TYPE_JSON );
};
}
