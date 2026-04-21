import { Injectable } from '@angular/core';
import { WebSocketService } from './web-socket.service';
import { Mensaje } from '../compras/models/modelos-compra';

@Injectable({
  providedIn: 'root'
})
export class DepartamentosService {

  public departamentos;
  public subunidad;
  public mensaje!:Mensaje

  constructor(private socket:WebSocketService) { 
    this.BuscarDepartamentos()
  }

  BuscarDepartamentos(){
    this.socket.io.emit('CLIENTE:Departamento');
    this.socket.io.emit('CLIENTE:Areas');
    
    this.socket.io.on('SERVER:Departamentos', (data)=>{
      this.departamentos = data;
    })

    this.socket.io.on('SERVER:Areas', (data)=>{
      this.subunidad = data;
      console.log(this.subunidad)
    })

    this.socket.io.on('SERVIDOR:enviaMensaje', (data) => {
      this.mensaje = data
    });
  }

  NuevoDepartamento(data:any){
    this.socket.io.emit('CLIENTE:nuevoDepartamento', data);
  }

  NuevoSubunidad(data){
    console.log('aja')
    this.socket.io.emit('CLIENTE:nuevaArea', data);
  }

  EliminarDepartamento(data:any){
    this.socket.io.emit('CLIENTE:EliminarDepartamento', data);
  }

  EliminarSubUnidad(data:any){
    this.socket.io.emit('CLIENTE:EliminarSubUnidad', data);
  }

  buscarSubUnidad(departamento_id){
    let departamento_ = this.departamentos.find((x:any) => x._id === departamento_id)
    return this.subunidad.filter((x:any)=>x.departamento === departamento_.nombre)
  }

}
