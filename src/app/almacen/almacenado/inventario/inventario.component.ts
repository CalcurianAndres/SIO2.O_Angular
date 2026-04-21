import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MaterialesService } from 'src/app/services/materiales.service';

@Component({
  selector: 'app-inventario',
  standalone: false,templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.scss']
})
export class InventarioComponent {

  constructor(private material:MaterialesService){

  }

  @Input() Inventario!:boolean;
  @Input() listado!:any;
  @Input() General:any;
  @Input() ByLotes:any;
  @Output() onCloseModal = new EventEmitter();

  GeneralOculto:boolean[] = [];
  LoteOculto:any = [];



  cerrar(){
    this.onCloseModal.emit()
  }

  getObjectKeys(obj: any) {
    return Object.entries(obj);
  }

  GetMaterial(id:string){
    return this.material.materiales.find((x:any)=> x._id == id.split('-')[0])
  }

  buscarValores(objeto: { [key: string]: { [key: string]: number } }, clave: string): { [key: string]: number } | null {
    if (objeto.hasOwnProperty(clave)) {
      return objeto[clave];
    }
  
    return null;
  }

  BuscarLotes(item:any){
    return this.buscarValores(this.ByLotes,item)
  }

  getDetallado(lote:any, material:any){
      return this.listado.filter((x:any)=> x.lote === lote && x.material._id === material)
  }

  showDetalle(n:any, i:any){
    let key = `${n}_${i}`
    if(!this.LoteOculto[key]){
      this.LoteOculto[key] = true;
    }else{
      this.LoteOculto[key] = false;
    }
  }

  MostrarDetalles(n:any, i:any){
    let key = `${n}_${i}`
    if(!this.LoteOculto[key]){
      return false
    }else{
      return true
    }
  }

  showLotes(i:any){
    if(!this.GeneralOculto[i]){
      this.GeneralOculto[i] = true;
    }else{
      this.GeneralOculto[i] = false;
    }
  }

  Format(n:any){
    n = Number(n);
    return n.toLocaleString('es-ES');
  }

  peso(hojas:any, gramaje:any, ancho:any, largo:any){
    return ((Number(hojas)*Number(gramaje)*Number(ancho)*Number(largo))/10000000000)
  }

  



}
