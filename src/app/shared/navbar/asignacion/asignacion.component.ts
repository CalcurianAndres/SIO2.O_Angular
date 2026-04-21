import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AlmacenService } from 'src/app/services/almacen.service';
import { OproduccionService } from 'src/app/services/oproduccion.service';
import { SolicitudesService } from 'src/app/services/solicitudes.service';

@Component({
  selector: 'app-asignacion',
  standalone: false,templateUrl: './asignacion.component.html',
  styleUrls: ['./asignacion.component.scss']
})
export class AsignacionComponent {

  constructor(public orden:OproduccionService,
              public almacen:AlmacenService,
              public solicitudes:SolicitudesService
  ){

  }

  public control:boolean[] = [];
  public control_:boolean[] = [];
  public listado:boolean = false;
  public almacenado = [];
  public indice = 0;
  public item = 0
  public _asignacion:any = [];
  public cantidad = 0

  public lotes:any = []
  public cantidades:any = []
  public sumatoria:any = 0

  public descuentos:any = []

  @Input() asignacion!:boolean;
  @Output() onCloseModal = new EventEmitter();

  cerrar(){
    this.onCloseModal.emit()
  }
  cerrarSubModal(){
    this.listado = false;
     this.asignacion = true;
      this.cantidades = [];
       this.lotes = []
        this.sumatoria = 0
  }

  Asignar(index, id, necesario, item){
    
    if(this._asignacion[this.indice]){
      console.log(this._asignacion[this.indice])
      if(this._asignacion[this.indice][item]){
        this.cantidades = this._asignacion[this.indice][item].cantidades
        this.lotes = this._asignacion[this.indice][item].materiales
        this.sumatoria = this.sumatoria = this.cantidades.reduce((total, cantidad) => total + (cantidad || 0), 0);
      }else{
        this.cantidades = []
        this.lotes = []
      }

      this.indice = index;
      this.item = item
      this.cantidad = necesario
      this.almacenado = this.almacen.buscarPorID(id)
      this.listado = true;
      this.asignacion = false;
    }else{
      this.indice = index;
      this.item = item
      this.cantidad = necesario
      this.almacenado = this.almacen.buscarPorID(id)
      this.listado = true;
      this.asignacion = false;
    }

  }

  largo(n){
    return this.orden.OrdenesPorAsignar()[n].tinta.length + 3
  }

  _largo(n){
    return this.solicitudes.solicitudes[n].materiales.length
  }


  RealizarDescuento(solicitud){

    let asignacion:any = {}

    if(solicitud.op){
      asignacion = {
        op:solicitud.op._id || 'Otros materiales',
        material:[],
        solicitud:solicitud.numero
      }
    }else{
      asignacion = {
        op:'Otros materiales',
        material:[],
        solicitud:solicitud.numero
      }
    }

    for(let i=0;i<this.descuentos.length;i++){
      asignacion.material.push({
        material:this.descuentos[i].producto,
        cantidad:this.descuentos[i].salida
      })
    }

    this.almacen.AsignacionDeMaterial(this.descuentos, asignacion);
    if(solicitud.op){
      this.orden.EditarOrden(solicitud.op._id)
    }
    this.asignacion = false;
  }



}
