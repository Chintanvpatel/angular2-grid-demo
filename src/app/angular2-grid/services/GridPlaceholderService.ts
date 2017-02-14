import {Injectable, ComponentFactory, OnInit, ComponentFactoryResolver, ViewContainerRef, ComponentRef} from "@angular/core";
import {NgGridItem} from "../components/NgGridItem";
import {NgGridPlaceholder} from "../components/NgGridPlaceholder";

@Injectable()
class GridPlaceholderService implements OnInit {
    private placeholder:NgGridPlaceholder;

    constructor(private window:Window, private cmpResolver:ComponentFactoryResolver, private viewContainer:ViewContainerRef) {
    }

    public showPlaceholder(item:NgGridItem, position:{col:number, row:number}) {
        this.placeholder.registerGrid(item._ngGrid);
        this.placeholder.setGridPosition(position.col, position.row);
        this.placeholder.setSize(item.getDimensions().width, item.getDimensions().height);
    }

    ngOnInit():any {
        this.createPlaceholder();
    }

    private createPlaceholder() {
        let factory = this.cmpResolver.resolveComponentFactory(NgGridPlaceholder);
        this.placeholder = factory
                    .create(this.viewContainer.injector, undefined, this.window.document.body)
                    .instance;
    }
}