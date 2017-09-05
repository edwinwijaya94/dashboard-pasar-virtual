import { Component } from '@angular/core';
import {vmHelper} from './vmHelper';

@Component({
  selector: 'virtualmarket',
  templateUrl: './virtualmarket.html',
})
export class VirtualmarketComponent {
  constructor(private vmHelper: vmHelper) {}
}