import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FabricantesService } from 'src/app/services/fabricantes.service';
import { GruposService } from 'src/app/services/grupos.service';
import { MaterialesService } from 'src/app/services/materiales.service';

@Component({
  selector: 'app-nuevo-material',
  standalone: false,
  templateUrl: './nuevo-material.component.html',
  styleUrls: ['./nuevo-material.component.scss'],
})
export class NuevoMaterialComponent implements OnChanges {
  @Input() nuevo_material: any;
  @Input() cargando!: boolean;
  @Input() selectedGrupo: any;
  @Output() onCloseModal = new EventEmitter();
  @Output() onCloseModal_ = new EventEmitter();

  grupo: string = '';
  Fabricante: string = '';
  Fabricantes: any[] = [];
  serie: string = '';
  nombre: string = '';
  codigo: string = '';
  guardando = false;

  constructor(
    public grupos: GruposService,
    public fabricante: FabricantesService,
    public api: MaterialesService,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['nuevo_material']?.currentValue) {
      this.guardando = false;
      if (this.selectedGrupo) {
        const idx = this.grupos.grupos.findIndex((g: any) => g._id === this.selectedGrupo._id);
        if (idx !== -1) {
          this.grupo = String(idx);
          this.buscarFabricante({ value: idx });
        }
      }
    }
  }

  buscarFabricante(e: any) {
    this.Fabricantes = this.fabricante.buscarFabricanteDe(this.grupos.grupos[e.value]._id!);
  }

  cerrar() {
    this.grupo = '';
    this.Fabricante = '';
    this.serie = '';
    this.nombre = '';
    this.codigo = '';
    this.onCloseModal.emit();
  }

  cerrar_() {
    this.grupo = '';
    this.Fabricante = '';
    this.serie = '';
    this.nombre = '';
    this.codigo = '';
    this.onCloseModal_.emit();
  }

  guardarMaterial() {
    this.guardando = true;
    const grupoId = this.grupos.grupos[Number(this.grupo)]._id;
    const fabricanteId = this.Fabricantes[Number(this.Fabricante)]._id;

    const data = {
      grupo: grupoId,
      fabricante: fabricanteId,
      serie: this.serie,
      nombre: this.nombre,
      codigo: this.codigo,
    };

    this.api.nuevoMaterial(data);
    this.cerrar();
  }
}
