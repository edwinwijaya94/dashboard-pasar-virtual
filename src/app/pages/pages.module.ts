import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';

import { routing }       from './pages.routing';
import { NgaModule } from '../theme/nga.module';
import { AppTranslationModule } from '../app.translation.module';

import { Pages } from './pages.component';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ToastModule} from 'ng2-toastr/ng2-toastr';

@NgModule({
  imports: [CommonModule, AppTranslationModule, NgaModule, routing, BrowserModule, BrowserAnimationsModule, ToastModule.forRoot()],
  declarations: [Pages]
})
export class PagesModule {
}
