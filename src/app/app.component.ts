import { Component, ViewChild } from '@angular/core';
import { NgGridConfig, NgGridItemConfig, NgGridItemEvent, NgGrid } from "./angular2-grid/main";
import { UUID } from "angular2-uuid/index";

import { GridDragService } from './angular2-grid/services/GridDragService';
import { GridValidationService } from './angular2-grid/services/GridValidationService';

interface Box {
    id: number;
    config: NgGridItemConfig;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
    @ViewChild('gridvar')
    private ngGrid1:NgGrid;
    
    private items: Array<Box> = [];
    private rgb: string = '#efefef';
    private curNum: number = 5;
    private gridConfig: NgGridConfig = <NgGridConfig>{
        'id': UUID.UUID(),
        'margins': [5],
        'draggable': true,
        'resizable': true,
        'max_cols': 0,
        'max_rows': 0,
        'visible_cols': 0,
        'visible_rows': 0,
        'min_cols': 1,
        'min_rows': 1,
        'col_width': 2,
        'row_height': 2,
        'cascade': 'off',
        'min_width': 50,
        'min_height': 50,
        'fix_to_grid': false,
        'auto_style': true,
        'auto_resize': false,
        'maintain_ratio': false,
        'prefer_new': false,
        'zoom_on_drag': false,
        'limit_to_screen': true
    };
    private curItemCheck: number = 0;
    private itemPositions: Array<any> = [];

    private draggable:Box = {
        id: 23,
        config: this._generateDefaultDraggableConfig()
    };

    constructor(private gridPositionService:GridValidationService, private gridDragService:GridDragService) {
        for (var i = 0; i < 7; i++) {
            const conf = this._generateDefaultItemConfig();
            conf.payload = 1 + i;
            this.items[i] = { id: i + 1, config: conf };
        }

        this.gridPositionService.addPositionCondition(this.validatePosition);
        this.gridPositionService.addResizeCondition(this.validateResize);
    }

    get ratioDisabled(): boolean {
        return (this.gridConfig.max_rows > 0 && this.gridConfig.visible_cols > 0) ||
            (this.gridConfig.max_cols > 0 && this.gridConfig.visible_rows > 0) ||
            (this.gridConfig.visible_cols > 0 && this.gridConfig.visible_rows > 0);
    }

    get itemCheck(): number {
        return this.curItemCheck;
    }

    set itemCheck(v: number) {
        this.curItemCheck = v;
    }

    get curItem(): NgGridItemConfig {
        return this.items[this.curItemCheck] ? this.items[this.curItemCheck].config : {};
    }

    addBox(): void {
        const conf: NgGridItemConfig = this._generateNewItemConfig();
        conf.payload = this.curNum++;
        this.items.push({ id: conf.payload, config: conf });
    }

    removeBox(): void {
        if (this.items[this.curItemCheck]) {
            this.items.splice(this.curItemCheck, 1);
        }
    }

    updateItem(index: number, event: NgGridItemEvent): void {
        // Do something here
    }

    onDrag(index: number, event: NgGridItemEvent): void {
        // Do something here
    }

    onResize(index: number, event: NgGridItemEvent): void {
        // Do something here
    }

    private _generateDefaultItemConfig(): NgGridItemConfig {
        return {'dragHandle': '.handle', 'col': 1, 'row': 1, 'sizex': 1, 'sizey': 1 };
    }

    private _generateNewItemConfig(): NgGridItemConfig {
        return {'dragHandle': '.handle', 'col': 37, 'row': 3, 'sizex': 1, 'sizey': 1 };
    }

    private _generateDefaultDraggableConfig(): NgGridItemConfig {
        return {'dragHandle': '.handle', 'col': 1, 'row': 1, 'sizex': 2, 'sizey': 2 };
    }

    private _randomise(): void {
        for (var x in this.items) {
            this.items[x].config.col = Math.floor(Math.random() * 6) + 1;
            this.items[x].config.row = 1;
        }
    }

    ngOnInit() {
    }

    private validatePosition(gridCol:number, gridRow:number):boolean {
        return true;
        //return gridCol % 8 == 1;
    }

    private validateResize(col:number, row:number, conf:NgGridItemConfig):boolean {
        return conf.sizex % 2 === 0;
    }
}
