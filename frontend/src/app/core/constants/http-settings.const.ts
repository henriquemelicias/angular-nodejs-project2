 pimport { HttpHeaders } from "@angular/common/http";

export class HttpSettings {
  public static API_URL = 'http://appserver.alunos.di.fc.ul.pt:3080/api';
  // public static API_URL = 'http://localhost:3080/api';

  public static HEADER_CONTENT_TYPE_JSON = {
    headers: new HttpHeaders( { 'Content-Type': 'application/json' } )
  };

  public static RESPONSE_TYPE_TEXT = {  responseType: 'text'  };
}
