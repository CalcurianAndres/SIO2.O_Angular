import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MaterialesService } from 'src/app/services/materiales.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-materiales',
  standalone: false,
  templateUrl: './materiales.component.html',
  styleUrls: ['./materiales.component.scss'],
})
export class MaterialesComponent implements OnInit {
  @Input() material: any;
  @Input() material_selected: any;
  @Output() onCloseModal = new EventEmitter();
  @Output() onAgregarMaterial = new EventEmitter();

  pageSize: number = 10;
  currentPage: number = 1;
  pageSizes: number[] = [10, 25, 50, 100];

  ngOnInit(): void {
    this.currentPage = 1;
  }

  get totalPages(): number {
    return Math.ceil((this.material_selected?.length || 0) / this.pageSize);
  }

  get paginatedMaterials(): any[] {
    if (!this.material_selected) return [];
    const start = (this.currentPage - 1) * this.pageSize;
    return this.material_selected.slice(start, start + this.pageSize);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  changePageSize(event: any) {
    this.pageSize = Number(event.target.value);
    this.currentPage = 1;
  }

  cerrar() {
    this.onCloseModal.emit();
  }

  agregarMaterial() {
    this.onAgregarMaterial.emit();
  }

  eliminarMaterial(id: any) {
    Swal.fire({
      title: '¿Eliminar este material?',
      text: 'El material se eliminará de manera permanente',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#48c78e',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      cancelButtonColor: '#f03a5f',
    }).then((resultado) => {
      if (resultado.isConfirmed) {
        this.api.EliminarMaterial(id);
        const idx = this.material_selected.findIndex((m: any) => m._id === id);
        if (idx !== -1) this.material_selected.splice(idx, 1);
        setTimeout(() => {
          Swal.fire({
            title: this.api.mensaje.mensaje,
            icon: this.api.mensaje.icon,
            timer: 5000,
            showConfirmButton: false,
            timerProgressBar: true,
            toast: true,
            position: 'top-end',
          });
        }, 1000);
      }
    });
  }

  constructor(public api: MaterialesService) {}
}
