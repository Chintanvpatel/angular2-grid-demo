import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { NgGridModule } from "./angular2-grid/main";
import { NgGridComponent } from './angular2-grid/components/NgGridComponent';
import { NgGridPlaceholder } from './angular2-grid/components/NgGridPlaceholder';
import { NgGridDraggable } from './angular2-grid/directives/NgGridDraggable';
import { GridDragService } from './angular2-grid/services/GridDragService';
import { GridValidationService } from './angular2-grid/services/GridValidationService';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    NgGridModule
  ],
  providers: [ GridDragService, GridValidationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
