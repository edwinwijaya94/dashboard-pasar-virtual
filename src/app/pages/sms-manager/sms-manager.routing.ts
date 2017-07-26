import { Routes, RouterModule } from '@angular/router';

import { SmsManagerComponent } from './sms-manager.component';

const routes: Routes = [
  {
    path: '',
    component: SmsManagerComponent
  }
];

export const routing = RouterModule.forChild(routes);