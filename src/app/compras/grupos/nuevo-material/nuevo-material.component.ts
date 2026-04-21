import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FabricantesService } from 'src/app/services/fabricantes.service';
import { GruposService } from 'src/app/services/grupos.service';
import { Fabricante } from '../../models/modelos-compra';
import { MaterialesService } from 'src/app/services/materiales.service';

@Component({
  selector: 'app-nuevo-material',
  standalone: false,templateUrl: './nuevo-material.component.html',
  styleUrls: ['./nuevo-material.component.scss']
})
export class NuevoMaterialComponent implements OnInit{

  public Fabricantes:any = []
  public origenes:any = []
  public selected_sustrato:boolean = false;
  public selected_tinta:boolean = false;
  public selected_pantone:boolean = false;
  public selected_cajas:boolean = false;
  public selected_envases:boolean = false;

  @Input() nuevo_material:any;
  @Input() cargando!:boolean;
  @Output() onCloseModal = new EventEmitter();
  @Output() onCloseModal_ = new EventEmitter();

  public grupo:string = '';
  public gramaje:string = '';
  public calibre:string = '';
  public color:string = '';
  public codigo:string = '';
  public Fabricante:string = '';
  public origen:string = '';
  public serie:string = '';
  public nombre:string = '';
  public rgb:string = '';
  public modelo:string = '';
  public cinta:string = '';
  public capacidad:string = '';


  constructor(public grupos:GruposService,
              public fabricante:FabricantesService,
              public api:MaterialesService){}

            
            
  ngOnInit(): void {
    var phrases = [
      'Arreglando código',
      'Ajustando',
      'Descargando la información',
      'Buscando errores',
      'Ya casi terminamos',
    ];
  
    // Function to change the random phrase
    function changeRandomPhrase() {
      var randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      document.getElementById('random-phrases')!.textContent = randomPhrase;
    }
  
    // Call the function every 1 second
    setInterval(changeRandomPhrase, 2000);
  }


    buscarFabricante(e:any){
      this.Fabricantes = this.fabricante.buscarFabricanteDe(this.grupos.grupos[e.value]._id!)
      if(this.grupos.grupos[e.value].trato){
        this.selected_sustrato = true;
      }else{
        this.selected_sustrato = false;
      }

      if(this.grupos.grupos[e.value].nombre === 'Tintas'){
        this.selected_tinta = true;
      }else{
        this.selected_tinta = false;
      }
      if(this.grupos.grupos[e.value].nombre === 'Cajas Corrugadas'){
        this.selected_cajas = true;
      }else{
        this.selected_cajas = false;
      }
      if(this.grupos.grupos[e.value].nombre === 'Envases'){
        this.selected_envases = true;
      }else{
        this.selected_envases = false;
      }

    }

    select_color(e:any){
      if(e.value === 'P'){
        this.selected_pantone = true;
      }else{
        this.selected_pantone = false;
      }
    }

    SeleccionarFabricante(e:any){
      this.origenes = this.Fabricantes[e.value].origenes
    }

    cerrar(){
      this.grupo = '';
      this.gramaje = '';
      this.calibre = '';
      this.color = '';
      this.codigo = '';
      this.Fabricante = '';
      this.origen = '';
      this.serie = '';
      this.nombre = '';
      this.modelo = '';
      this.onCloseModal.emit();
    }

    cerrar_(){
      this.grupo = '';
      this.gramaje = '';
      this.calibre = '';
      this.color = '';
      this.codigo = '';
      this.Fabricante = '';
      this.origen = '';
      this.serie = '';
      this.nombre = '';
      this.modelo = '';
      this.modelo = '';
      this.rgb = '';
      this.cinta = '';
      this.capacidad = ''
      this.onCloseModal_.emit();
    }
    

    guardarMaterial(){

      let data = {
        grupo:this.grupos.grupos[Number(this.grupo)]._id,
        gramaje:this.gramaje,
        calibre:this.calibre,
        color:this.color,
        codigo:this.codigo,
        fabricante:this.Fabricantes[Number(this.Fabricante)]._id,
        origen:this.origen,
        serie:this.serie,
        nombre:this.nombre,
        modelo:this.modelo,
        rgb:this.rgb,
        cinta:this.cinta,
        capacidad:this.capacidad
      }

      this.api.nuevoMaterial(data)

      this.cerrar();
    }

}
