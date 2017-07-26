import { Injectable }    from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';


import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { FareList } from './fare-list';

@Injectable()
export class FareListService {

  private headers = new Headers({'Content-Type': 'application/json'});
  private hostname = 'http://'+window.location.hostname+':8001'
  

  constructor(private http: Http) { }

  getFareList(): Observable<FareList[]> {
    const url = this.hostname+'/api/virtualmarket/getAllRates';
    return this.http.get(url)
               .map((response: Response) => <FareList[]>response.json())
               .catch(this.handleError);

  }

  updateFareList(data: Object): Observable<void> {
    const url = this.hostname+'/api/virtualmarket/updateRates';
    return this.http.post(url, JSON.stringify(data), {headers: this.headers})
               .map(() => null)
               .catch(this.handleError);

  }  

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}