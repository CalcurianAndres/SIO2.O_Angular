import { Component, DoCheck } from '@angular/core';
import { GruposService } from 'src/app/services/grupos.service';
import { MaterialesService } from 'src/app/services/materiales.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-especificaciones',
  standalone: false,
  templateUrl: './especificaciones.component.html',
  styleUrls: ['./especificaciones.component.scss'],
})
export class EspecificacionesComponent implements DoCheck {
  NUEVA_ESPECIFICACION = false;
  EDITAR_ESPECIFICACION = false;
  EDITAR_SUSTRATO = false;
  EDITAR_CAJA = false;
  EDITAR_OTROS = false;
  NUEVO_SUSTRATO = false;
  NUEVA_CAJA = false;
  NUEVO_PADS = false;
  NUEVO_OTROS = false;
  Detalle = false;
  materiales_seleceted: any = [];
  materialesEspecificados: any = [];
  grupoSelected: any;
  Especificacion: any;
  especificacion_para_editar!: any;
  Esp_otro: any = {};
  cargando = true;
  gruposPrevLength = 0;

  currentPage = 1;
  pageSize = 10;
  pageSizes = [10, 25, 50, 100];

  constructor(
    public grupos: GruposService,
    public material: MaterialesService,
  ) {}

  ngDoCheck(): void {
    if (this.grupos.grupos?.length !== this.gruposPrevLength) {
      this.gruposPrevLength = this.grupos.grupos?.length || 0;
      if (this.grupos.grupos?.length > 0) {
        this.cargando = false;
        if (!this.grupoSelected) {
          this.grupoSelected = this.grupos.grupos[0].nombre;
          this.materialesEspecificados = this.material.filtrarPorGrupoConEspecificacion(this.grupos.grupos[0]._id);
        }
      }
    }
  }

  get hayGrupos(): boolean {
    return (this.grupos.grupos?.length ?? 0) > 0;
  }

  get totalGrupos(): number {
    return this.grupos.grupos?.length || 0;
  }

  get totalConEspecificacion(): number {
    if (!this.material.materiales) return 0;
    return this.material.materiales.filter((m: any) => m.especificacion || m.especificacion2).length;
  }

  get totalSinEspecificacion(): number {
    if (!this.material.materiales) return 0;
    return this.material.materiales.filter((m: any) => !m.especificacion && !m.especificacion2).length;
  }

  get filteredMateriales(): any[] {
    if (!this.materialesEspecificados) return [];
    return this.materialesEspecificados;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredMateriales.length / this.pageSize) || 1;
  }

  get paginatedMateriales(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredMateriales.slice(start, start + this.pageSize);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(p: number) {
    if (p >= 1 && p <= this.totalPages) this.currentPage = p;
  }

  changePageSize(event: any) {
    this.pageSize = Number(event.target.value);
    this.currentPage = 1;
  }

  seleccionarGrupo(grupo: any) {
    this.grupoSelected = grupo.nombre;
    this.materialesEspecificados = this.material.filtrarPorGrupoConEspecificacion(grupo._id);
    this.currentPage = 1;
  }

  cerrarNuevo() {
    this.NUEVA_ESPECIFICACION = false;
    this.EDITAR_ESPECIFICACION = false;
    this.NUEVA_CAJA = false;
    this.EDITAR_SUSTRATO = false;
    this.NUEVO_SUSTRATO = false;
    this.NUEVO_PADS = false;
    this.NUEVO_OTROS = false;
    this.EDITAR_CAJA = false;
    this.EDITAR_OTROS = false;
    if (this.grupos.grupos?.length > 0) {
      this.grupoSelected = this.grupos.grupos[0].nombre;
      this.materialesEspecificados = this.material.filtrarPorGrupoConEspecificacion(this.grupos.grupos[0]._id);
    }
    this.currentPage = 1;
  }

  Detallar(data: any) {
    this.Detalle = true;
    this.Especificacion = data.especificacion2
      ? data.especificacion2.especificacion
      : data.especificacion;
  }

  actualizarEspecificaciones() {
    const grupo_encontrado = this.grupos.BuscarGrupoPorNombre(this.grupoSelected);
    if (!grupo_encontrado) return;
    this.materialesEspecificados = this.material.filtrarPorGrupoConEspecificacion(grupo_encontrado._id);
  }

  nueva_especificacion(id: any) {
    const Grupo: any = this.grupos.grupos?.find((x: any) => x._id == id);
    if (!Grupo) return;
    if (Grupo.trato) {
      this.NUEVO_SUSTRATO = true;
    } else if (Grupo.nombre === 'Tintas' || Grupo.nombre === 'Barniz s/impresión') {
      this.NUEVA_ESPECIFICACION = true;
    } else if (Grupo.nombre === 'Cajas Corrugadas') {
      this.NUEVA_CAJA = true;
    } else if (Grupo.nombre === 'Soportes de Embalaje') {
      this.NUEVO_PADS = true;
    } else {
      this.NUEVO_OTROS = true;
    }
    this.materiales_seleceted = this.material.filtrarPorGrupoSinEspecificacion(id);
  }

  Editar(item: any) {
    if (!item?.grupo) return;
    if (item.grupo.trato) {
      this.EDITAR_SUSTRATO = true;
    } else if (item.grupo.nombre === 'Tintas') {
      this.EDITAR_ESPECIFICACION = true;
    } else if (item.grupo.nombre === 'Cajas Corrugadas') {
      this.EDITAR_CAJA = true;
    } else {
      this.EDITAR_OTROS = true;
    }
    this.especificacion_para_editar = item.especificacion;
    if (item.especificacion2) {
      this.Esp_otro = { ...item.especificacion2.especificacion };
      this.Esp_otro._id = item.especificacion2._id;
    }
  }
}
