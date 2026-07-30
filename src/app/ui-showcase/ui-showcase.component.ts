import { Component } from '@angular/core';
import { TableColumn } from '../shared/components/sio-table/sio-table.component';

interface ColorSwatch {
  name: string;
  hex: string;
  var: string;
}

@Component({
  selector: 'app-ui-showcase',
  standalone: false,
  templateUrl: './ui-showcase.component.html',
  styleUrls: ['./ui-showcase.component.scss'],
})
export class UiShowcaseComponent {
  accentColors: ColorSwatch[] = [
    { name: 'Red', hex: '#ff4444', var: 'var(--accent-red)' },
    { name: 'Green', hex: '#48c78e', var: 'var(--accent-green)' },
    { name: 'Blue', hex: '#3b82f6', var: 'var(--accent-blue)' },
    { name: 'Purple', hex: '#7c3aed', var: 'var(--accent-purple)' },
  ];

  statusColors: ColorSwatch[] = [
    { name: 'Success', hex: '#4caf50', var: 'var(--status-success)' },
    { name: 'Warning', hex: '#ffc107', var: 'var(--status-warning)' },
    { name: 'Danger', hex: '#ef5350', var: 'var(--status-danger)' },
    { name: 'Info', hex: '#42a5f5', var: 'var(--status-info)' },
  ];

  bgColors: ColorSwatch[] = [
    { name: 'Primary', hex: '#26343d', var: 'var(--bg-primary)' },
    { name: 'Secondary', hex: '#454a4e', var: 'var(--bg-secondary)' },
    { name: 'Card', hex: '#3c3f41', var: 'var(--bg-card)' },
    { name: 'Border', hex: '#2d2f39', var: 'var(--border-color)' },
  ];

  textColors: ColorSwatch[] = [
    { name: 'Primary', hex: '#9fadbc', var: 'var(--text-primary)' },
    { name: 'Heading', hex: '#ffffff', var: 'var(--text-heading)' },
    { name: 'Muted', hex: '#64748b', var: 'var(--text-muted)' },
  ];

  // Modal
  showModal: boolean = false;
  modalSize: 'normal' | 'wide' | 'full' = 'normal';

  // Tags
  tagRemovable: boolean = true;

  // Buttons
  btnLoading: boolean = false;

  // Table
  tableColumns: TableColumn[] = [
    { key: 'nombre', label: 'Nombre', sortable: true },
    { key: 'tipo', label: 'Tipo', sortable: true },
    { key: 'estado', label: 'Estado' },
  ];
  tableData = [
    { nombre: 'Sustrato', tipo: 'Material', estado: 'Activo' },
    { nombre: 'Tinta Cyan', tipo: 'Tinta', estado: 'Activo' },
    { nombre: 'Barniz Acuoso', tipo: 'Barniz', estado: 'Pendiente' },
  ];
  tableSort: string = '';
  tableDir: 'asc' | 'desc' = 'asc';

  onTableSort(col: string) {
    if (this.tableSort === col) {
      this.tableDir = this.tableDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.tableSort = col;
      this.tableDir = 'asc';
    }
  }

  simulateLoading() {
    this.btnLoading = true;
    setTimeout(() => (this.btnLoading = false), 2000);
  }

  onAction(action: string) {
    console.log(`Action: ${action}`);
  }
}
