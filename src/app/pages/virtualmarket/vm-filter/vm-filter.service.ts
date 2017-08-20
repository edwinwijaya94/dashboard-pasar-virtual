import {EventEmitter, Injectable} from '@angular/core';

@Injectable()
export class VmFilterService {
  
  public periodChange$: EventEmitter<any>;

  constructor() {
  	this.periodChange$ = new EventEmitter();
  }
  
  public changePeriod(startDate: any, endDate: any){
   this.periodChange$.emit({startDate: startDate, endDate: endDate});
  }
}