import {
    Component,
    OnInit,
    OnChanges,
    Input,
    ViewChild, ComponentFactory, ElementRef, ViewChildren, QueryList, OnDestroy, HostBinding,
    HostListener,
} from '@angular/core';

import {
    NgGridItem,
} from './NgGridItem';

import {GridDragService} from '../services/GridDragService';

import {
    NgGrid,
} from '../directives/NgGrid';
import {Subject} from "rxjs/Rx";
import {NgGridItemConfig} from "../interfaces/INgGrid";
import {GridValidationService} from "../services/GridValidationService";
import {NgGridConfig} from "../interfaces/INgGrid";
import {Output, EventEmitter} from '@angular/core';

interface Box {
    id: number;
    config: NgGridItemConfig;
}

@Component({
    selector: 'ngGrid', 
    template: `
        <div [ngGrid]="config" (onResizeStop)="resizeFinished($event)" style="width:60%;">
            <div *ngFor="let item of items; let i = index" [ngGridItem]="item.config"></div>
        </div>
    `
})

export class NgGridComponent implements OnInit, OnDestroy {
    @Output() itemResizeStop = new EventEmitter<NgGridItemConfig>();

    @ViewChild(NgGrid)
    public ngGrid:NgGrid;

    @Input()
    private config:NgGridConfig;

    @Input()
    public items: Array<Box> = [];

    public mouseMove$:Subject<any> = new Subject();
    public newItemAdd$:Subject<any> = new Subject();

    static GRID_POSITIONS_OFFSET = 1;

    constructor(private gridDragService:GridDragService,
                private gridPositionService:GridValidationService) {
    }

    ngOnInit() {
        const {inside, outside, release} = this.gridDragService.registerGrid(this);
        inside.subscribe(v => this.itemDraggedInside(v));
        outside.subscribe(v => this.itemDragOutside(v));
        release.subscribe(v => this.itemReleased(v));
    }

    ngOnDestroy():any {
        this.ngGrid._items.forEach(item => item.ngOnDestroy())
    }

    @HostListener('mousemove', ['$event'])
    private mouseMove(e) {
        this.mouseMove$.next(this.toObserverEvent(e));
    }

    resizeFinished(item:any) {
        this.itemResizeStop.emit(item.config);
        this.items.push(item.config);
        const ids = this.items.map(i => i.id);
        this.items = this.items.filter((item, i, arr) => ids.indexOf(item.id) === i)
    }

    public itemDraggedInside(v) {
        if (this.gridDragService.draggedItem) {
            const {item, event} = v.itemDragged;
            const item_config = this.itemConfigFromEvent(item, event.event);
            const dims = item.getSize();
            if (this.gridPositionService.validateGridPosition(item_config._config.col, item_config._config.col, v.itemDragged.item, this.ngGrid._config)
                && !this.hasCollisions(item_config._config, v.itemDragged.item._config)
                && !this.isOutsideGrid(item_config._config, {
                    columns: this.ngGrid._config.max_cols,
                    rows: this.ngGrid._config.max_rows
                })) {
                // this.ngGrid._placeholderRef.instance.makeValid();
            } else {
                // this.ngGrid._placeholderRef.instance.makeInvalid();
            }
            this.ngGrid._placeholderRef.instance.setSize(dims);
            this.ngGrid._placeholderRef.instance.setGridPosition({col:item_config._config.col, row:item_config._config.row});
        }
    }

    public itemDragOutside(v) {
        this.ngGrid._placeholderRef.instance.setSize({x: 0, y: 0});
        // this.ngGrid._placeholderRef.destroy();
    }

    public itemReleased(v) {
        const item_conf = this.itemConfigFromEvent(v.release.item, v.move.event);
        if (this.gridPositionService.validateGridPosition(item_conf._config.col, item_conf._config.row, v.release.item, this.ngGrid._config)
            && !this.hasCollisions(item_conf._config, v.release.item._config)
            && !this.isOutsideGrid(item_conf._config, {columns: this.ngGrid._config.max_cols, rows: this.ngGrid._config.max_rows})) {
            this.newItemAdd$.next({
                grid: this,
                newConfig: item_conf._config,
                oldConfig: v.release.item._config,
                event: v.release.event
            });
        }
        v.release.item.stopMoving();
        this.ngGrid._placeholderRef.instance.setSize({x: 0, y: 0});
    }

    private itemConfigFromEvent(item:NgGridItem, event:MouseEvent):NgGridItem {
        const {col, row} = this.ngGrid.getGridPositionOfEvent(event, this.gridDragService.posOffset);
        item._config.col = col;
        item._config.row = row;
        return item;
    }

    private hasCollisions(itemConf:NgGridItemConfig, initialConf:NgGridItemConfig):boolean {
        return this.items
            .filter(c => 
                !(c.config.col == initialConf.col && c.config.row == initialConf.row)
            )
            .some((conf) => intersect(
                toRectangle(conf.config), toRectangle(itemConf)
            ));

        function intersect(r1, r2) {
            return !(r2.left > r1.right ||
            r2.right < r1.left ||
            r2.top > r1.bottom ||
            r2.bottom < r1.top);
        }

        function toRectangle(conf:NgGridItemConfig) {
            return {
                left: conf.col,
                top: conf.row,
                right: conf.col + conf.sizex - 1,
                bottom: conf.row + conf.sizey - 1
            };
        }
    }

    private isOutsideGrid(item:NgGridItemConfig, gridSize:any):boolean {
        const {col, row} = item;
        const {sizex, sizey} = item;        
        return (col + sizex - NgGridComponent.GRID_POSITIONS_OFFSET > gridSize.columns)
            || (row + sizey - NgGridComponent.GRID_POSITIONS_OFFSET > gridSize.rows);
    }

    // Create placeholder if it's not initialized or it's destroyed
    @HostListener('dragenter', ['$event'])
    private dragOverStart(e) {
        if (this.ngGrid._placeholderRef === null || this.ngGrid._placeholderRef.instance.destroyed === true) {
            this.ngGrid.initPlaceholder();
        }
    }

    @HostListener('dragover', ['$event'])
    private dragOver(e) {
        const item = this.gridDragService.dragItemConf;
        // Calculate height and width of item
        if (item.sizex < this.ngGrid.minCols) item.sizex = this.ngGrid.minCols;
		if (item.sizey < this.ngGrid.minRows) item.sizey = this.ngGrid.minRows;

        if (!item) return;
        const dims = {
            x: item.sizex,
            y: item.sizey
        };
        const conf:NgGridItemConfig = this.ngGrid.getGridPositionOfEvent(e, this.gridDragService.posOffset);
        conf.sizex = dims.x;
        conf.sizey = dims.y;

        this.ngGrid._placeholderRef.instance.setGridPosition({col:conf.col, row:conf.row});

        if (this.gridPositionService.validateGridPosition(conf.col, conf.row, item, this.ngGrid._config)
            && !this.hasCollisions(conf, item)
            && !this.isOutsideGrid(conf, {columns: this.ngGrid._config.max_cols, rows: this.ngGrid._config.max_rows})) {
            // this.ngGrid._placeholderRef.instance.makeValid();
        } else {
            // this.ngGrid._placeholderRef.instance.makeInvalid();
        }

        this.ngGrid._placeholderRef.instance.setSize(dims);
        e.preventDefault();
    }

    @HostListener('dragleave', ['$event'])
    private dragLeave(e) {
        this.ngGrid._placeholderRef.instance.setSize({x:0, y:0});
    }

    @HostListener('drop', ['$event'])
    private drop(e) {
        const content = this.gridDragService.dragItemConf;
        this.gridDragService.dragItemConf = null;
        // Calculate height and width of item
        if (content.sizex < this.ngGrid.minCols) content.sizex = this.ngGrid.minCols;
		if (content.sizey < this.ngGrid.minRows) content.sizey = this.ngGrid.minRows;

        if (content) {
            const conf:NgGridItemConfig = this.ngGrid.getGridPositionOfEvent(e, this.gridDragService.posOffset);
            conf.sizex = content.sizex;
            conf.sizey = content.sizey;  
            if (this.gridPositionService.validateGridPosition(conf.col, conf.row, content, this.ngGrid._config)
                && !this.hasCollisions(conf, content)) {
                const itemConfig = Object.assign(content, conf);
                this.newItemAdd$.next({
                    grid: this,
                    newConfig: itemConfig,
                    event: e
                });
            }
        }
        this.ngGrid._placeholderRef.destroy();
    }

    public removeItem(item:NgGridItem) {
        // let removed = false;
        // this.items = this.items.filter(i => {
        //     if (i.config.col == item.config.col && i.config.row == item.config.row && !removed) {
        //         removed = true;
        //         return false;
        //     } else {
        //         return true;
        //     }
        // });
        this.ngGrid.removeItem(item);
    }

    public removeItemById(id:number) {
        this.items = this.items.filter(i => i.id != id);
    }

    public addItem(item) {
        // TODO
        this.items.push({id : 1, config: item});
    }

    @HostListener('mousedown', ['$event'])
    private mouseDown(e) {
        const i = this.ngGrid.getItem(e);
        if (i) {
            if (i.canResize(e)) {

            } else if (i.canDrag(e)) {
                this.gridDragService.dragStart(i, this, e);
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }
    }

    @HostListener('mouseup', ['$event'])
    private mouseUp(e:MouseEvent) {
        this.ngGrid._placeholderRef.instance.setSize({x:0, y:0});
    }

    private toObserverEvent(event) {
        return {
            grid: this,
            event,
        };
    }
}