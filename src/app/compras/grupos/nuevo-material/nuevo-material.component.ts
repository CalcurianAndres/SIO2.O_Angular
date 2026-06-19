import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FabricantesService } from 'src/app/services/fabricantes.service';
import { GruposService } from 'src/app/services/grupos.service';
import { MaterialesService } from 'src/app/services/materiales.service';
import { Pantone } from 'src/app/services/pantone.service';

@Component({
  selector: 'app-nuevo-material',
  standalone: false,
  templateUrl: './nuevo-material.component.html',
  styleUrls: ['./nuevo-material.component.scss'],
})
export class NuevoMaterialComponent implements OnChanges {
  @Input() nuevo_material: any;
  @Input() editar_material: any;
  @Input() material_data: any;
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
  calibre: string = '';
  gramaje: string = '';
  color: string = '';
  pantoneCode: string = '';
  cinta: string = '';
  guardando = false;
  colores = ['Cyan', 'Magenta', 'Amarillo', 'Negro', 'Pantone'];

  // Pantone selector
  selectedPantone: Pantone | null = null;
  showPantoneSelector = false;

  constructor(
    public grupos: GruposService,
    public fabricante: FabricantesService,
    public api: MaterialesService,
  ) {}

  get grupoSeleccionado(): any {
    if (this.grupo === '') return null;
    return this.grupos.grupos[Number(this.grupo)];
  }

  get esSustrato(): boolean {
    return this.grupoSeleccionado?.trato === true;
  }

  get esTinta(): boolean {
    return this.grupoSeleccionado?.nombre === 'Tintas';
  }

  get esPantone(): boolean {
    return this.color === 'Pantone';
  }

  onColorChange() {
    if (!this.esPantone) {
      this.pantoneCode = '';
      this.selectedPantone = null;
    }
  }

  openPantoneSelector() {
    this.showPantoneSelector = true;
  }

  onPantoneSelected(pantone: Pantone) {
    this.selectedPantone = pantone;
    this.pantoneCode = pantone.code;
    this.showPantoneSelector = false;
  }

  get esCaja(): boolean {
    return this.grupoSeleccionado?.nombre === 'Cajas de embalaje';
  }

  get formValido(): boolean {
    if (this.guardando) return false;
    if (!this.grupo || this.Fabricante === '' || !this.nombre || !this.serie || !this.codigo) return false;
    if (this.esSustrato && (!this.calibre || !this.gramaje)) return false;
    if (this.esTinta && !this.color) return false;
    if (this.esPantone && !this.selectedPantone) return false;
    if (this.esCaja && !this.cinta) return false;
    return true;
  }

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
    if (changes['editar_material']?.currentValue && this.material_data) {
      this.guardando = false;
      const m = this.material_data;
      const gIdx = this.grupos.grupos.findIndex((g: any) => g._id === (m.grupo?._id || m.grupo));
      if (gIdx !== -1) {
        this.grupo = String(gIdx);
        this.buscarFabricante({ value: gIdx });
      }
      setTimeout(() => {
        const fIdx = this.Fabricantes.findIndex((f: any) => f._id === (m.fabricante?._id || m.fabricante));
        if (fIdx !== -1) this.Fabricante = String(fIdx);
      });
      this.nombre = m.nombre || '';
      this.serie = m.serie || '';
      this.codigo = m.codigo || '';
      this.calibre = m.calibre || '';
      this.gramaje = m.gramaje || '';
      this.color = m.color || '';
      this.cinta = m.cinta || '';

      // Restaurar Pantone si existe en el material
      if (m.pantone) {
        this.selectedPantone = m.pantone;
        this.pantoneCode = m.pantone.code;
      } else if (m.color && m.color.startsWith('Pantone ')) {
        this.color = 'Pantone';
        this.pantoneCode = m.color.replace('Pantone ', '');
      }
    }
  }

  buscarFabricante(e: any) {
    this.Fabricante = '';
    this.Fabricantes = this.fabricante.buscarFabricanteDe(this.grupos.grupos[e.value]._id!);
  }

  cerrar() {
    this.grupo = '';
    this.Fabricante = '';
    this.serie = '';
    this.nombre = '';
    this.codigo = '';
    this.calibre = '';
    this.gramaje = '';
    this.color = '';
    this.pantoneCode = '';
    this.selectedPantone = null;
    this.showPantoneSelector = false;
    this.cinta = '';
    this.onCloseModal.emit();
  }

  cerrar_() {
    this.grupo = '';
    this.Fabricante = '';
    this.serie = '';
    this.nombre = '';
    this.codigo = '';
    this.calibre = '';
    this.gramaje = '';
    this.color = '';
    this.pantoneCode = '';
    this.selectedPantone = null;
    this.showPantoneSelector = false;
    this.cinta = '';
    this.onCloseModal_.emit();
  }

  guardarMaterial() {
    this.guardando = true;
    const grupoId = this.grupos.grupos[Number(this.grupo)]._id;
    const fabricanteId = this.Fabricantes[Number(this.Fabricante)]._id;

    const data: any = {
      grupo: grupoId,
      fabricante: fabricanteId,
      serie: this.serie,
      nombre: this.nombre,
      codigo: this.codigo,
    };
    if (this.esSustrato) {
      data.calibre = this.calibre;
      data.gramaje = this.gramaje;
    }
    if (this.esTinta) {
      if (this.esPantone && this.selectedPantone) {
        data.color = 'Pantone';
        data.pantone = {
          code: this.selectedPantone.code,
          hex: this.selectedPantone.hex,
          r: this.selectedPantone.r,
          g: this.selectedPantone.g,
          b: this.selectedPantone.b,
        };
      } else {
        data.color = this.color;
      }
    }
    if (this.esCaja) {
      data.cinta = this.cinta;
    }

    if (this.editar_material && this.material_data) {
      data._id = this.material_data._id;
      this.api.guardarMaterial(data);
    } else {
      this.api.nuevoMaterial(data);
    }
    this.cerrar();
  }
}
