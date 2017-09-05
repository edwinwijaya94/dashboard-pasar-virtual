import {EventEmitter, Injectable} from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import {opHelper} from '../opHelper';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

declare var moment:any;

@Injectable()
export class OpFilterService {
  
  public periodChange$: EventEmitter<any>;

  constructor(private http: Http, private opHelper: opHelper) {
  	this.periodChange$ = new EventEmitter();
  }
  
  public changePeriod(startDate: any, endDate: any){
   	this.periodChange$.emit({startDate: startDate, endDate: endDate});
   	this.getConfigInfo(startDate, endDate)
	   	.subscribe(data => {
	      var prevPeriod = {
          startDate: moment(data.prevPeriod.startDate,'YYYY-MM-DD  HH:mm:ss'),
          endDate: moment(data.prevPeriod.endDate,'YYYY-MM-DD  HH:mm:ss'),
        }
        var prevPeriodInfo = this.opHelper.formatDateRange(prevPeriod.startDate, prevPeriod.endDate);
        this.opHelper.periodInfo = '*Data dibandingkan dengan periode sebelumnya ('+prevPeriodInfo+')';
	    });
  }

  public getConfigInfo(startDate: any, endDate: any): Observable<any> {
    var url = this.opHelper.hostname+'/api/operational/config?start_date='+startDate+'&end_date='+endDate;
    return this.http.get(url)
             .map((response: Response) => <any>response.json().data)
             .catch(this.handleError);

  }

  public handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}