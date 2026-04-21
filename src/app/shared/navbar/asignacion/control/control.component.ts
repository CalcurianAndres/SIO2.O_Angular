import { Component, EventEmitter, Input, Output } from '@angular/core';
import * as moment from 'moment';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-control',
  standalone: false,templateUrl: './control.component.html',
  styleUrls: ['./control.component.scss']
})
export class ControlComponent {

  constructor(public usuario:LoginService){

  }


  @Input() listado!:boolean;
  @Input() indice:any;
  @Input() item:any;
  @Input() cantidad:any;
  @Input() almacenado:any
  @Input() asignacion:any
  @Input() lotes:any;
  @Input() cantidades:any;
  @Input() sumatoria:any;
  @Input() descuentos:any;

  @Output() onCloseModal = new EventEmitter()



  cerrar(){
    this.sumatoria = 0
    this.onCloseModal.emit()
  }

  addLote(n: number, cantidad: number, isChecked: any, parcial: boolean, id:string, restante:number, material:string) {
    if (isChecked.checked) {
      if (parcial) {
        // Si parcial es true, sumar solo hasta alcanzar this.cantidad
        const faltante = this.cantidad - this.sumatoria;
        
        if (this.sumatoria + Number(cantidad) > this.cantidad) {
          // Si la suma total se pasa de la cantidad, solo sumar lo que falta
          const cantidadASumar = faltante > 0 ? faltante : 0;
          this.sumatoria = this.sumatoria + cantidadASumar;

          this.cantidades[n] = Number(cantidadASumar)
          this.lotes[n] = this.almacenado[n]
          this.descuentos.push({producto:id, restante:cantidad- this.cantidades[n], fecha:moment().format('DD/MM/YYYY - hh:mm a'), usuario:`${this.usuario.usuario.Nombre} ${this.usuario.usuario.Apellido}`, entrada:0, salida:this.cantidades[n], material})
        } else {
          // Si no se pasa de la cantidad, sumar la cantidad completa
          this.sumatoria = this.sumatoria + Number(cantidad);
          this.cantidades[n] = Number(cantidad)
          this.lotes[n] = this.almacenado[n]
          this.descuentos.push({producto:id, restante:cantidad- this.cantidades[n], fecha:moment().format('DD/MM/YYYY - hh:mm a'), usuario:`${this.usuario.usuario.Nombre} ${this.usuario.usuario.Apellido}`, entrada:0, salida:this.cantidades[n], material})
        }
      } else {
        // Si no es parcial, sumar la cantidad completa
        this.sumatoria = this.sumatoria + Number(cantidad);
        this.cantidades[n] = Number(cantidad)
        this.lotes[n] = this.almacenado[n]
        this.descuentos.push({producto:id, restante:0, fecha:moment().format('DD/MM/YYYY - hh:mm a'), usuario:`${this.usuario.usuario.Nombre} ${this.usuario.usuario.Apellido}`, entrada:0, salida:this.cantidades[n], material})
      }

    } else {
      // Si el checkbox no está marcado, restar la cantidad
      this.sumatoria = this.sumatoria - this.cantidades[n];
      this.cantidades[n] = 0;
      this.lotes.splice(n, 1)
      let i = this.descuentos.findIndex(x => x.producto === id)
      this.descuentos.splice(i,1)
    }
  }

  isDisabled(index: number): boolean {
    // Si sumatoria es mayor o igual a la cantidad, y el checkbox no está marcado, deshabilitarlo
    return this.sumatoria >= this.cantidad && (this.cantidades[index] < 1 || this.cantidades[index] == null);
  }


  AsignarMaterial(){
    if(!this.asignacion[this.indice]){
      this.asignacion[this.indice] = []
    }
    this.asignacion[this.indice][this.item] = []

    this.asignacion[this.indice][this.item] = {
      materiales:this.lotes,
      cantidades:this.cantidades
    }

    this.cerrar()

  }




}
