import {Component, OnInit, ViewContainerRef} from '@angular/core';
// import { HttpModule }    from '@angular/http';
import {NgForm} from '@angular/forms';

import { FareList } from './fare-list';
import {FareListService} from './fare-list.service';

import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Component({
  selector: 'fare-list',
  templateUrl: './fare-list.html',
  // styleUrls: ['./pieChart.scss']
})

export class FareListComponent implements OnInit {

  public fareList: FareList[] = [];
  // private _init = false;

  constructor(private fareListService: FareListService, public toastr: ToastsManager, vcr: ViewContainerRef) {
    this.toastr.setRootViewContainerRef(vcr);
  }

  ngOnInit(): void {
    this.getFareList();
  }

  private getFareList(): void {
    this.fareListService.getFareList()
    .subscribe(fareList => this.fareList = fareList);
  }

  private submitForm (f: NgForm): void {
    let fareList = this.fareList;
    let data = {};
    for(let i=0; i<fareList.length; i++){
      data[fareList[i].parameter] = fareList[i].constant;
    }
    this.fareListService.updateFareList(data)
    .subscribe(() => {
      this.getFareList();
      this.showMessage('success', 'Tarif berhasil diubah');
    }); 
  }

  private showMessage(status: string, message: string): void {
    if(status == 'success')
      this.toastr.success(message, status);
    else if(status == 'error')
      this.toastr.error(message, status);
  };

}
