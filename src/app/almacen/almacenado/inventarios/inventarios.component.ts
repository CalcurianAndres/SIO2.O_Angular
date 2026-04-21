import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AlmacenService } from 'src/app/services/almacen.service';

@Component({
  selector: 'app-inventarios',
  standalone: false,templateUrl: './inventarios.component.html',
  styleUrls: ['./inventarios.component.scss']
})
export class InventariosComponent {

  constructor(private almacen:AlmacenService){

  }

  @Input() Inventario:any;
  @Input() agrupadoMateriales!: Array<{
    nombre: string;
    materialesPorId: Array<{
      nombre: string;
      marca: string;
      netoTotal: number;
      unidad: string;
      lotes: {
        [key: string]: Array<{
          codigo: string;
          ancho: string;
          largo: string;
          presentacion: string;
          recepcion: string;
          neto: number;
        }>;
      };
    }>;
  }>;
  @Output() onCloseModal = new EventEmitter();

  public clicked: any = [];
  public clicked_: any = [];
  public clicked__: any = [];

  public registro_:boolean = false;

  public registro:any = []

  showInfo(i) {
    if (!this.clicked[i]) {
      this.clicked[i] = true; // Si no se ha hecho clic previamente, muestra la información adicional
    } else {
      this.clicked[i] = false; // Si ya se hizo clic, oculta la información adicional
    }
  }
  showInfo_(i) {
    if (!this.clicked_[i]) {
      this.clicked_[i] = true; // Si no se ha hecho clic previamente, muestra la información adicional
    } else {
      this.clicked_[i] = false; // Si ya se hizo clic, oculta la información adicional
    }
  }

  showInfo__(i) {
    if (!this.clicked__[i]) {
      this.clicked__[i] = true; // Si no se ha hecho clic previamente, muestra la información adicional
    } else {
      this.clicked__[i] = false; // Si ya se hizo clic, oculta la información adicional
    }
  }

  totalizar(values){
    return values.reduce((sum, mat) => sum + Number(mat.neto), 0)
  }

  totalizarPorNombre(material_: any): number {
    return material_.materialesPorId.reduce((acc: number, material: any) => acc + material.netoTotal, 0);
  }

  cerrar(){
    this.onCloseModal.emit();
  }


  buscarRegistro(material){
      this.registro = this.almacen.Registro.filter(x => x.material.nombre === material.nombre)
      console.log(this.registro)
      this.Inventario = false;
      this.registro_ = true;
  }
}
