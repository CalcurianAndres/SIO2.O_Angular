import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EspecificacionSustrato } from 'src/app/compras/models/modelos-compra';
import { EspecificacionesService } from 'src/app/services/especificaciones.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-nueva-especificacion',
  standalone: false,templateUrl: './nueva-especificacion.component.html',
  styleUrls: ['./nueva-especificacion.component.scss']
})
export class NuevaEspecificacionComponent {

  constructor(public api: EspecificacionesService) {

  }

  @Input() NUEVA_ESPECIFICACION!: boolean;
  @Input() NUEVO_SUSTRATO!:boolean;
  @Input() NUEVA_CAJA!:boolean;
  @Input() NUEVO_PADS!:boolean;
  @Input() NUEVO_OTROS!:boolean;
  @Input() Materiales!: any;
  @Input() Edicion!: any;
  @Input() Editable!: any;
  @Input() Edicion_sustrato!: any;
  @Input() Esp_otro!:any
  @Input() Edicion_cajas!:any;
  @Input() EDITAR_OTROS!:any;
  @Output() onCloseModal = new EventEmitter();
  @Output() onActualizar = new EventEmitter();


  public newKey = ''
  public newKey_Value = ''

  public EspecificacionPads:any = {
    largo:{
      min:'',
      nom:'',
      max:''
    },
    ancho:{
      min:'',
      nom:'',
      max:''
    },
    signado:{
      min:'',
      nom:'',
      max:''
    },
    espesor:{
      min:'',
      nom:'',
      max:''
    }
  }

  public EspecificacionTinta: any = {
    viscosidad: {
      min: 0,
      max: 0,
      con: ''
    },
    rigidez: {
      min: 0,
      max: 0,
      con: ''
    },
    tack: {
      min: 0,
      max: 0,
      con: ''
    },
    finura: {
      min: 0,
      max: 0,
      con: ''
    },
    secado: {
      min: 0,
      max: 0,
      con: ''
    }
  }
  
EspecificacionSustrato: EspecificacionSustrato = {
    gramaje: {
      min: 0,
      nom: 0,
      max: 0,
    },
    calibre: {
      pt: {
        min: 0,
        nom: 0,
        max: 0,
      },
      um: {
        min: 0,
        nom: 0,
        max: 0,
      },
      mm: {
        min: 0,
        nom: 0,
        max: 0,
      },
    },
    cobb: {
      top: {
        min: 0,
        nom: 0,
        max: 0,
      },
      back: {
        min: 0,
        nom: 0,
        max: 0,
      },
    },
    curling: {
      min: 0,
      nom: 0,
      max: 0,
    },
    blancura: {
      min: 0,
      nom: 0,
      max: 0,
    },
  };

  public Material_selected: any = '#';

  cerrar() {
    this.Material_selected = '#'
    // Código para establecer los valores min y max en 0
    Object.keys(this.EspecificacionTinta).forEach((key: any) => {
      this.EspecificacionTinta[key].min = 0;
      this.EspecificacionTinta[key].max = 0;
      this.EspecificacionTinta[key].con = '';
    });
    
    this.EspecificacionSustrato = {
      gramaje: {
        min: 0,
        nom: 0,
        max: 0,
      },
      calibre: {
        pt: {
          min: 0,
          nom: 0,
          max: 0,
        },
        um: {
          min: 0,
          nom: 0,
          max: 0,
        },
        mm: {
          min: 0,
          nom: 0,
          max: 0,
        },
      },
      cobb: {
        top: {
          min: 0,
          nom: 0,
          max: 0,
        },
        back: {
          min: 0,
          nom: 0,
          max: 0,
        },
      },
      curling: {
        min: 0,
        nom: 0,
        max: 0,
      },
      blancura: {
        min: 0,
        nom: 0,
        max: 0,
      },
    };

    this.onCloseModal.emit();
  }

  guardar() {
    let data = {
      especificacion: this.EspecificacionTinta,
      material: this.Materiales[this.Material_selected]
    }
    this.api.GuardarEspecificacion(data);
    this.cerrar();
    setTimeout(() => {
      Swal.fire({
        toast:true,
        timer:5000,
        timerProgressBar:true,
        position:'top-end',
        text:this.api.mensaje.mensaje,
        icon:this.api.mensaje.icon,
        showConfirmButton:false
      })
      this.onActualizar.emit();
    }, 1000);
  }

  guardar_sustrato(){
    let data = {
      especificacion: this.EspecificacionSustrato,
      material: this.Materiales[this.Material_selected]
    }
    this.api.GuardarEspecificacion(data);
    this.cerrar();
    setTimeout(() => {
      Swal.fire({
        toast:true,
        timer:5000,
        timerProgressBar:true,
        position:'top-end',
        text:this.api.mensaje.mensaje,
        icon:this.api.mensaje.icon,
        showConfirmButton:false
      })
      this.onActualizar.emit();
    }, 1000);
  }

  Editar_() {
    console.log(this.Editable)
    this.api.EditarESpecificacion(this.Editable);
    setTimeout(() => {
      Swal.fire({
        toast:true,
        timer:5000,
        timerProgressBar:true,
        position:'top-end',
        text:this.api.mensaje.mensaje,
        icon:this.api.mensaje.icon,
        showConfirmButton:false
      })
      this.onActualizar.emit();
    }, 1000);
    this.cerrar()

  }

  guardarPads(){
    let data = {
      especificacion:this.EspecificacionPads,
      material: this.Materiales[this.Material_selected]
    }
    this.api.GuardarEspecificacion2(data)
    this.cerrar();

    this.EspecificacionPads = {
      largo:{
        min:'',
        nom:'',
        max:''
      },
      ancho:{
        min:'',
        nom:'',
        max:''
      },
      signado:{
        min:'',
        nom:'',
        max:''
      },
      espesor:{
        min:'',
        nom:'',
        max:''
      }
    }
  }

  GuardarOtro(){


    if(this.newKey && this.newKey_Value){
      this.Esp_otro[this.newKey] = this.newKey_Value
    }
    let data = {
      especificacion:this.Esp_otro,
      material: this.Materiales[this.Material_selected]
    }

    console.log(data)
    this.api.GuardarEspecificacion2(data)
    this.cerrar();

    this.newKey = ''
    this.newKey_Value = ''
    this.Esp_otro = {}
  }

}
