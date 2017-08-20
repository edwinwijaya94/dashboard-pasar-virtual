import { Injectable}    from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import {vmHelper} from '../vmHelper';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class VmTransactionService{

  constructor(private http: Http, private vmHelper: vmHelper) {
  }

  public getTransactionStats(startDate: any, endDate: any): Observable<any> {
    var url = this.vmHelper.hostname+'/api/virtualmarket/transaction?type=stats&start_date='+startDate+'&end_date='+endDate;
    return this.http.get(url)
             .map((response: Response) => <any>response.json().data)
             .catch(this.handleError);

  }

  public getBuyerStats(startDate: any, endDate: any): Observable<any> {
    var url = this.vmHelper.hostname+'/api/virtualmarket/buyer?type=stats&start_date='+startDate+'&end_date='+endDate;
    return this.http.get(url)
             .map((response: Response) => <any>response.json().data)
             .catch(this.handleError);
  }  

  public getTransactionHistory(startDate: any, endDate: any): Observable<any> {
    var url = this.vmHelper.hostname+'/api/virtualmarket/transaction?type=history&start_date='+startDate+'&end_date='+endDate;
    return this.http.get(url)
             .map((response: Response) => <any>response.json().data)
             .catch(this.handleError);

  }

  public getBuyerHistory(startDate: any, endDate: any): Observable<any> {
    var url = this.vmHelper.hostname+'/api/virtualmarket/buyer?type=history&start_date='+startDate+'&end_date='+endDate;
    return this.http.get(url)
             .map((response: Response) => <any>response.json().data)
             .catch(this.handleError);
  } 

  private handleError(error: any): Promise<any> {
      console.error('An error occurred', error); // for demo purposes only
      return Promise.reject(error.message || error);
    }

}
