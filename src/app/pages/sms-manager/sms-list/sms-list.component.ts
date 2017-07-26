import {Component, OnInit, ViewContainerRef} from '@angular/core';
// import { HttpModule }    from '@angular/http';
import {NgForm} from '@angular/forms';

import { SmsList } from './sms-list';
import {SmsListService} from './sms-list.service';

// import { LocalDataSource } from 'ng2-smart-table';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Component({
  selector: 'sms-list',
  templateUrl: './sms-list.html',
  // styleUrls: ['./pieChart.scss']
})

export class SmsListComponent implements OnInit {

  public smsList: SmsList[] = [];

  // settings = {
  //   hideSubHeader : true,
  //   columns: {
  //     id: {
  //       title: '#',
  //       type: 'number'
  //     },
  //     undefine_word: {
  //       title: 'Singkatan',
  //       type: 'string'
  //     },
  //     word: {
  //       title: 'Arti',
  //       type: 'string'
  //     }
  //   }
  // };

  // source: LocalDataSource = new LocalDataSource();

  constructor(private smsListService: SmsListService, public toastr: ToastsManager, vcr: ViewContainerRef) {
    this.toastr.setRootViewContainerRef(vcr);
  }

  ngOnInit(): void {
    this.getSmsList();
  }

  private getSmsList(): void {
    this.smsListService.getSmsList()
    .subscribe(smsList => this.smsList = smsList);
  }

  private submitForm (sms: SmsList): void {
    let data = <any>{};
    data.abbreviation = sms.undefine_word;
    data.word = sms.word;
    this.smsListService.updateSmsList(data)
    .subscribe(() => {
      this.getSmsList();
      this.showMessage('success', 'Singkatan berhasil ditambah');
    }); 
  }

  private showMessage(status: string, message: string): void {
    if(status == 'success')
      this.toastr.success(message, status);
    else if(status == 'error')
      this.toastr.error(message, status);
  };

}
