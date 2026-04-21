import { Component, OnInit } from '@angular/core';
import { GruposService } from 'src/app/services/grupos.service';
import { MaterialesService } from 'src/app/services/materiales.service';

@Component({
  selector: 'app-especificaciones',
  standalone: false,templateUrl: './especificaciones.component.html',
  styleUrls: ['./especificaciones.component.scss']
})
export class EspecificacionesComponent implements OnInit {
  NUEVA_ESPECIFICACION: boolean = false;
  EDITAR_ESPECIFICACION: boolean = false;
  EDITAR_SUSTRATO: boolean = false;
  EDITAR_CAJA: boolean = false;
  EDITAR_OTROS: boolean = false;
  NUEVO_SUSTRATO: boolean = false
  NUEVA_CAJA: boolean = false;
  NUEVO_PADS: boolean = false;
  NUEVO_OTROS: boolean = false;
  Detalle: boolean = false;
  random = 15;
  materiales_seleceted: any = []
  materialesEspecificados: any;
  grupoSelected: any
  Especificacion: any;
  especificacion_para_editar!: any;
  public Esp_otro:any = {}
  constructor(public grupos: GruposService,
    public material: MaterialesService) {

  }

  ngOnInit(): void {
    setTimeout(() => {
      this.grupoSelected = this.grupos.grupos[0].nombre
      this.materialesEspecificados = this.material.filtrarPorGrupoConEspecificacion(this.grupos.grupos[0]._id)
    }, 1000);
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
    this.grupoSelected = this.grupos.grupos[0].nombre
    this.materialesEspecificados = this.material.filtrarPorGrupoConEspecificacion(this.grupos.grupos[0]._id)
  }

  Detallar(data: any) {
    this.Detalle = true;
    console.log(data)
    if(data.especificacion2){
      this.Especificacion = data.especificacion2.especificacion
    }else{
      this.Especificacion = data.especificacion
    }

    console.log(this.Especificacion)
  }

  actualizarEspecificaciones(){
    let grupo_encontrado = this.grupos.BuscarGrupoPorNombre(this.grupoSelected)
    console.log(this.grupoSelected, grupo_encontrado)
    this.materialesEspecificados = this.material.filtrarPorGrupoConEspecificacion(grupo_encontrado?._id)
    console.log(this.materialesEspecificados)
  }


  nueva_especificacion(id: any) {
    let Grupo:any = this.grupos.grupos.find((x:any) => x._id == id )
    if(Grupo.trato){
      this.NUEVO_SUSTRATO = true;
    }else if(Grupo.nombre === 'Tintas' || Grupo.nombre === 'Barniz s/impresión'){
      this.NUEVA_ESPECIFICACION = true;
    }else if(Grupo.nombre === 'Cajas Corrugadas'){
      this.NUEVA_CAJA = true;
    }else if(Grupo.nombre === 'Soportes de Embalaje'){
      this.NUEVO_PADS = true;
    }else{
      this.NUEVO_OTROS = true;
    }
    this.materiales_seleceted = this.material.filtrarPorGrupoSinEspecificacion(id);

  }

  randomise(grupo: string, id: any) {
    this.grupoSelected = grupo;
    this.materialesEspecificados = this.material.filtrarPorGrupoConEspecificacion(id)
  }

  filas() {
    return Math.ceil(this.grupos.grupos.length / 5)
  }

  Editar(item: any) {
    if(item.grupo.trato){
      this.EDITAR_SUSTRATO = true;
    }else if(item.grupo.nombre === 'Tintas'){
      this.EDITAR_ESPECIFICACION = true;
    }else if(item.grupo.nombre === 'Cajas Corrugadas'){
      this.EDITAR_CAJA = true;
    }else{
      this.EDITAR_OTROS = true;
    }
    this.especificacion_para_editar = item.especificacion;
    this.Esp_otro = item.especificacion2.especificacion
    this.Esp_otro._id = item.especificacion2._id;

    console.log(this.Esp_otro)

  }
}
