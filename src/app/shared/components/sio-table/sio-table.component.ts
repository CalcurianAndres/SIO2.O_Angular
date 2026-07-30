import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
}

@Component({
  selector: 'app-sio-table',
  standalone: false,
  templateUrl: './sio-table.component.html',
  styleUrls: ['./sio-table.component.scss'],
})
export class SioTableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() striped: boolean = true;
  @Input() hoverable: boolean = true;
  @Input() compact: boolean = false;
  @Input() sortColumn: string = '';
  @Input() sortDirection: 'asc' | 'desc' = 'asc';
  @Output() onSort = new EventEmitter<string>();

  get tableClasses(): string {
    let cls = 'table is-fullwidth';
    if (this.striped) cls += ' is-striped';
    if (this.hoverable) cls += ' is-hoverable';
    if (this.compact) cls += ' is-narrow';
    return cls;
  }

  toggleSort(col: TableColumn) {
    if (!col.sortable) return;
    this.onSort.emit(col.key);
  }

  getSortIcon(col: TableColumn): string {
    if (!col.sortable) return '';
    if (this.sortColumn !== col.key) return 'fa-sort';
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }
}
