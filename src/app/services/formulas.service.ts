import { Injectable } from '@angular/core';
import { WebSocketService } from './web-socket.service';
import { Mensaje } from '../compras/models/modelos-compra';

@Injectable({
  providedIn: 'root'
})
export class FormulasService {

  public mensaje!:Mensaje;
  public formulas:any = [];

  constructor(public socket:WebSocketService) { 
    this.onFormulas()
  }

  onFormulas(){
    this.socket.io.emit('CLIENTE:buscarFormula')
  
    this.socket.io.on('SERVER:formula', (data)=>{
      this.formulas = data;
      console.log(this.formulas)
    })
    this.socket.io.on('SERVIDOR:enviaMensaje', (data) => {
      console.error(data.mensaje);
      this.mensaje = data
    });
  }

  GuardarFormula(data:any){
    this.socket.io.emit('CLIENTE:nuevaFormula',data)
    // this.socket.io.emit('NuevoGrupo',{nombre,parcial:false,icono:'test'})
  }


  BuscarFormulas(color){
    return this.formulas.filter(formula => {
      return formula.pantone === color;
    })
}

}
