import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgGrid, NgGridDraggable, NgGridComponent, NgGridItem, NgGridItemConfig, NgGridItemEvent, NgGridPlaceholder } from '../main';

@NgModule({
  imports: [CommonModule],
  declarations:     [ NgGridComponent, NgGrid, NgGridItem, NgGridPlaceholder, NgGridDraggable ],
  entryComponents:  [ NgGridPlaceholder ],
  exports:          [ NgGrid, NgGridComponent, NgGridItem, NgGridDraggable ]
})
export class NgGridModule {}