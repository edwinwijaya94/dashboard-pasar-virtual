import {EventEmitter, Injectable} from '@angular/core';

@Injectable()
export class OpFilterService {
  
  public periodChange$: EventEmitter<any>;

  constructor() {
  	this.periodChange$ = new EventEmitter();
  }
  
  public changePeriod(startDate: any, endDate: any){
   this.periodChange$.emit({startDate: startDate, endDate: endDate});
  }
}