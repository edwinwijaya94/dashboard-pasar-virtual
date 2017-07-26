import { Injectable }    from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';


import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { SmsList } from './sms-list';

@Injectable()
export class SmsListService {

  private headers = new Headers({'Content-Type': 'application/json'});
  private hostname = 'http://'+window.location.hostname+':8001'
  

  constructor(private http: Http) { }

  getSmsList(): Observable<SmsList[]> {
    const url = this.hostname+'/api/virtualmarket/undefine/word';
    return this.http.get(url)
               .map((response: Response) => <SmsList[]>response.json().undefine)
               .catch(this.handleError);

  }

  updateSmsList(data: Object): Observable<void> {
    const url = this.hostname+'/api/virtualmarket/dictionary/add';
    return this.http.post(url, JSON.stringify(data), {headers: this.headers})
               .map(() => null)
               .catch(this.handleError);

  }  

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}