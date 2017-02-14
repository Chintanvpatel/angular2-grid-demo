import {
    Directive,
    ElementRef, Input,
} from '@angular/core';
import { GridDragService } from "../services/GridDragService";
import { NgGrid } from "./NgGrid";

@Directive({
    selector: '[ngGridDraggable]',
    inputs: ['content: ngGridDraggable'],
    host: {
        '(dragstart)': 'dragStart($event)',
    },
})
export class NgGridDraggable {
    private content:any;
    private ngGrid:NgGrid;

    constructor(private elementRef:ElementRef, private gridDragService:GridDragService) {
        this.elementRef.nativeElement.draggable = "true";
    }

    private dragStart(e: any):void {
        this.gridDragService.dragItemConf = this.content.config;
        this.gridDragService.initializeGridItem(this.content.config);
        this.gridDragService.posOffset = {'left': (e.pageX - this.elementRef.nativeElement.getBoundingClientRect().left), 'top': (e.pageY - (this.elementRef.nativeElement.getBoundingClientRect().top + window.scrollY))};
    }
}
