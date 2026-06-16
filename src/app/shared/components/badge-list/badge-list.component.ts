import { Component, ContentChild, EventEmitter, Input, Output, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-badge-list',
  standalone: false,
  templateUrl: './badge-list.component.html',
  styleUrls: ['./badge-list.component.scss'],
})
export class BadgeListComponent {
  /** Array of items to display as badges. Can be strings or objects. */
  @Input() items: any[] = [];

  /** Bulma tag color classes. Default: 'is-info is-light is-medium' */
  @Input() tagClass = 'is-info is-light is-medium';

  /** Emits the index of the item to remove */
  @Output() remove = new EventEmitter<number>();

  /** Optional custom template for rendering each item.
   *  Context: { $implicit: item, index: number }
   *  If omitted, renders the item as a raw string. */
  @ContentChild(TemplateRef) template!: TemplateRef<any>;
}
