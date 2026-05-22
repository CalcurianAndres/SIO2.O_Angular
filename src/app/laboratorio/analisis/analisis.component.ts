import { Component } from '@angular/core';
import { AnalisisSustrato2 } from 'src/app/compras/models/modelos-compra';
import { AnalisisService } from 'src/app/services/analisis.service';
import { GruposService } from 'src/app/services/grupos.service';
import { MaterialesService } from 'src/app/services/materiales.service';
import { RecepcionService } from 'src/app/services/recepcion.service';
import Swal from 'sweetalert2';
import Chart from 'chart.js/auto';
import { SolicitudesService } from 'src/app/services/solicitudes.service';

@Component({
  selector: 'app-analisis',
  standalone: false,
  templateUrl: './analisis.component.html',
  styleUrls: ['./analisis.component.scss'],
})
export class AnalisisComponent {
  public Tinta: boolean = false;
  public Sustrato: boolean = false;
  public Caja: boolean = false;
  public pads: boolean = false;
  public otro: boolean = false;
  public Recepcion_selected;
  public Material_selected;
  public index_material;
  public Busqueda: boolean = false;
  public parametro: any = [];
  mostrarEtiquetas = false;
  informacion: any;
  recepcion_: any;

  abrirEtiquetas(material: any, recepcion: any) {
    this.informacion = material;
    this.recepcion_ = recepcion;
    this.mostrarEtiquetas = true;
  }

  mostrarSeccionBuscar: boolean = false;

  showMaterial() {
    console.log(this.recepcion_);
    console.log(this.informacion[0]);
  }

  tipo_de_busqueda: any = '';
  grupo_selected = '';
  material_selected = '';
  lote_selected = '';
  desde = '';
  hasta = '';
  loading: boolean = false;
  sin_analizar = true;

  public Analisis: any = {
    img: 'no-image',
    cualitativo: {
      tono: false,
      opacidad: false,
      viscosidad: false,
      secadoCapaFina: false,
      secadoCapaGruesa: false,
      brillo: false,
    },
    cuantitativo: {
      papel: '',
      carton: '',
      gramaje: '',
      calibre: '',
      muestra: '',
    },
    sustrato_muestra: '',
    carton: {
      estandar_1: {
        l: '',
        a: '',
        b: '',
      },
      estandar_2: {
        l: '',
        a: '',
        b: '',
      },
      estandar_3: {
        l: '',
        a: '',
        b: '',
      },
      muestra_1: {
        l: '',
        a: '',
        b: '',
        ll: '',
        aa: '',
        bb: '',
        e: '',
      },
      muestra_2: {
        l: '',
        a: '',
        b: '',
        ll: '',
        aa: '',
        bb: '',
        e: '',
      },
      muestra_3: {
        l: '',
        a: '',
        b: '',
        ll: '',
        aa: '',
        bb: '',
        e: '',
      },
    },
    papel: {
      estandar_1: {
        l: '',
        a: '',
        b: '',
      },
      estandar_2: {
        l: '',
        a: '',
        b: '',
      },
      estandar_3: {
        l: '',
        a: '',
        b: '',
      },
      muestra_1: {
        l: '',
        a: '',
        b: '',
        ll: '',
        aa: '',
        bb: '',
        e: '',
      },
      muestra_2: {
        l: '',
        a: '',
        b: '',
        ll: '',
        aa: '',
        bb: '',
        e: '',
      },
      muestra_3: {
        l: '',
        a: '',
        b: '',
        ll: '',
        aa: '',
        bb: '',
        e: '',
      },
    },
    muestra: {
      estandar_1: {
        l: '',
        a: '',
        b: '',
      },
      estandar_2: {
        l: '',
        a: '',
        b: '',
      },
      estandar_3: {
        l: '',
        a: '',
        b: '',
      },
    },
    resultado: {
      estandar: '',
      resultado: '',
      observacion: '',
      guardado: {
        usuario: '',
        fecha: '',
      },
      validado: {
        usuario: '',
        fecha: '',
      },
    },
  };

  public analisisSustrato: AnalisisSustrato2 = {
    numero_muestras: 0,
    ancho: 0,
    largo: 0,
    gramaje: {
      masa_inicial: [],
      masa_final: [],
      gramaje: [],
      promedio: 0,
      desviacion: 0,
      max: 0,
      min: 0,
      decimales: 0,
    },
    cobb: {
      top: {
        cobb: [],
        max: 0,
        min: 0,
        promedio: 0,
        desviacion: 0,
        decimales: 0,
      },
      back: {
        cobb: [],
        max: 0,
        min: 0,
        promedio: 0,
        desviacion: 0,
        decimales: 0,
      },
    },
    calibre: {
      mm: {
        mm: [],
        max: 0,
        min: 0,
        promedio: 0,
        desviacion: 0,
        decimales: 0,
      },
      um: {
        um: [],
        max: 0,
        min: 0,
        promedio: 0,
        desviacion: 0,
        decimales: 0,
      },
      pt: {
        pt: [],
        max: 0,
        min: 0,
        promedio: 0,
        desviacion: 0,
        decimales: 0,
      },
    },
    curling_blancura: {
      curling: {
        curling: [],
        max: 0,
        min: 0,
        promedio: 0,
        desviacion: 0,
        decimales: 0,
      },
      blancura: {
        blancura: [],
        max: 0,
        min: 0,
        promedio: 0,
        desviacion: 0,
        decimales: 0,
      },
    },
    dimensiones: {
      Escuadra: {
        escuadra: [],
        max: 0,
        min: 0,
        promedio: 0,
        desviacion: 0,
        decimales: 0,
      },
      contraEscuadra: {
        contraEscuadra: [],
        max: 0,
        min: 0,
        promedio: 0,
        desviacion: 0,
        decimales: 0,
      },
      Pinza: {
        pinza: [],
        max: 0,
        min: 0,
        promedio: 0,
        desviacion: 0,
        decimales: 0,
      },
      contraPinza: {
        contraPinza: [],
        max: 0,
        min: 0,
        promedio: 0,
        desviacion: 0,
        decimales: 0,
      },
    },
    resultado: {
      estandar: '',
      resultado: '',
      observacion: '',
      pendiente: undefined,
      guardado: {
        usuario: '',
        fecha: '',
      },
      validado: {
        usuario: '',
        fecha: '',
      },
    },
  };

  public AnalisisCajas: any = {
    longitud_interna: {
      largo: {
        largo: [],
        min: 0,
        max: 0,
        promedio: 0,
        desviacion: 0,
        decimales: 0,
      },
      ancho: {
        ancho: [],
        min: 0,
        max: 0,
        promedio: 0,
        desviacion: 0,
        decimales: 0,
      },
      alto: {
        alto: [],
        min: 0,
        max: 0,
        promedio: 0,
        desviacion: 0,
        decimales: 0,
      },
    },
    longitud_externa: {
      largo: {
        largo: [],
        min: 0,
        max: 0,
        promedio: 0,
        desviacion: 0,
        decimales: 0,
      },
      ancho: {
        ancho: [],
        min: 0,
        max: 0,
        promedio: 0,
        desviacion: 0,
        decimales: 0,
      },
      alto: {
        alto: [],
        min: 0,
        max: 0,
        promedio: 0,
        desviacion: 0,
        decimales: 0,
      },
    },
    espesor: {
      espesor: [],
      min: 0,
      max: 0,
      promedio: 0,
      desviacion: 0,
      decimales: 0,
    },
    resultado: {
      observacion: '',
      resultado: '',
      guardado: {
        usuario: '',
        fecha: '',
      },
      validado: {
        usuario: '',
        fecha: '',
      },
    },
    muestras: 0,
  };

  public analisisPads: any = {
    muestras: 0,
    largo: {
      largo: [],
      min: 0,
      max: 0,
      promedio: 0,
      desviacion: 0,
      decimales: 0,
    },
    ancho: {
      ancho: [],
      min: 0,
      max: 0,
      promedio: 0,
      desviacion: 0,
      decimales: 0,
    },
    signado: {
      signado: [],
      min: 0,
      max: 0,
      promedio: 0,
      desviacion: 0,
      decimales: 0,
    },
    espesor: {
      espesor: [],
      min: 0,
      max: 0,
      promedio: 0,
      desviacion: 0,
      decimales: 0,
    },
    resultado: {
      observacion: '',
      resultado: '',
      guardado: {
        usuario: '',
        fecha: '',
      },
      validado: {
        usuario: '',
        fecha: '',
      },
    },
  };

  public AnalisisOtro: any = {
    apariencia: false,
    ph: '',
    otro: '',
    resultado: {
      observacion: '',
      resultado: '',
      guardado: {
        usuario: '',
        fecha: '',
      },
      validado: {
        usuario: '',
        fecha: '',
      },
    },
  };

  public Materiales: any = [];
  public mesActual = '';
  public yearActual;

  constructor(
    public recepciones: RecepcionService,
    public analisis: AnalisisService,
    public grupos: GruposService,
    public materiales: MaterialesService,
    public solicitudes: SolicitudesService,
  ) {
    const meses = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    const fechaActual = new Date();
    this.mesActual = meses[fechaActual.getMonth()];
    this.yearActual = new Date().getFullYear();
  }

  PreparacionesTinta() {
    return this.solicitudes.solicitudes.filter(
      (s) => s.tag === 'Preparacion' && (s.status === 'Por Asignar' || s.status === 'Por Etiquetar'),
    );
  }

  CalcularPeso(materiales) {
    let cantidad = materiales.reduce((total, material) => total + Number(material.neto), 0);
    return cantidad.toFixed(2);
  }

  public sustrato_char: any;

  MostrarDesdeBusqueda(e) {
    this.Busqueda = false;
    this.Analizar(e[0], e[1], e[2], e[3]);
  }

  // SustratoChar(){
  //   if(this.sustrato_char){
  //     this.sustrato_char.destroy();
  //   }
  //   this.sustrato_char = new Chart("Sustrato_chart",{
  //     type:'bar',
  //     data:{
  //       labels:['Sustrato','Tinta','Cajas','Pads','Otros'],
  //       datasets: [{
  //         label: 'Aprobados',
  //         data: [this.analisis.SustratoAprobado,this.analisis.TintasAprobadas,this.analisis.CajasAceptadas,this.analisis.PadsAprobados,this.analisis.OtrosAprobados],
  //         backgroundColor: ['rgba(72, 199, 142, 0.5)',],
  //         borderColor: ['rgb(72, 199, 142)',],
  //         borderWidth:2,
  //         borderSkipped: false,
  //         borderRadius:10
  //         // hoverOffset: 4
  //       },
  //       {
  //         label: 'Rechazados',
  //         data: [this.analisis.SustratoRechazado,this.analisis.TintasRechazadas,this.analisis.CajasRechazadas,this.analisis.PadsRechazados,this.analisis.OtrosRechazados],
  //         backgroundColor: ['rgba(255, 99, 132, 0.5)',],
  //         borderColor: ['rgb(255, 99, 132)',],
  //         borderWidth:2,
  //         borderSkipped: false,
  //         borderRadius:10
  //         // hoverOffset: 4
  //       }],
  //     }
  //   })
  // }

  // setInterval(changeText, 5000); // Cambia el texto cada 5 segundos

  reset() {
    if (this.tipo_de_busqueda != 'grupo') {
      this.grupo_selected = '';
      this.material_selected = '';
    } else if (this.tipo_de_busqueda != 'lote') {
      this.lote_selected = '';
    } else if (this.tipo_de_busqueda != 'fecha') {
      this.desde = '';
      this.hasta = '';
    }
  }

  Format(n: any) {
    n = Number(n);
    return n.toLocaleString('es-ES');
  }

  verificarSiSerealizoAnalisis(material) {
    if (material[0].analisis) {
      if (
        material[0].material.grupo.nombre === 'Tintas' ||
        material[0].material.grupo.nombre === 'Barniz s/impresión'
      ) {
        if (this.analisis.buscarAnalisisPorID(material[0].analisis).resultado.validado.usuario != '') {
          return false;
        } else {
          return true;
        }
      } else if (material[0].material.grupo.nombre === 'Cajas Corrugadas') {
        if (this.analisis.buscarAnalisisCajasPorID(material[0].analisis).resultado.validado.usuario != '') {
          return false;
        } else {
          return true;
        }
      } else if (material[0].material.grupo.nombre === 'Soportes de Embalaje') {
        if (this.analisis.buscarAnalisisPadsPorID(material[0].analisis).resultado.validado.usuario != '') {
          return false;
        } else {
          return true;
        }
      } else if (material[0].material.grupo.trato === true) {
        if (this.analisis.buscarAnalisisSustratoPorID(material[0].analisis).resultado.validado.usuario != '') {
          return false;
        } else {
          return true;
        }
      } else {
        if (this.analisis.buscarAnalisisOtrosPorID(material[0].analisis).resultado.validado.usuario != '') {
          return false;
        } else {
          return true;
        }
      }
    } else {
      return true;
    }
  }

  public Preparacion = false;
  AnalizarPreparacion(preparacion) {
    this.Tinta = true;
    this.Recepcion_selected = preparacion;
    this.Preparacion = true;
    this.Material_selected = preparacion.material;
    console.log(this.Material_selected);
    // this.index_material = index_material;
    if (this.analisis.buscarAnalisisPorID(preparacion.analisis)) {
      this.Analisis = this.analisis.buscarAnalisisPorID(preparacion.analisis);
    }
  }

  Analizar(recepcion: any, material: any, index_recepcion: number, index_material: number) {
    if (material[0].material.grupo.trato === true) {
      console.log(material[0].material.grupo);
      this.Sustrato = true;
      this.Recepcion_selected = recepcion;
      this.Material_selected = material;
      this.index_material = index_material;
      if (this.analisis.buscarAnalisisSustratoPorID(material[0].analisis)) {
        this.analisisSustrato = this.analisis.buscarAnalisisSustratoPorID(material[0].analisis);
        if (!this.analisisSustrato.resultado.resultado) {
          this.analisisSustrato.resultado.pendiente = undefined;
        }
      }
      return;
    } else if (
      material[0].material.grupo.nombre === 'Tintas' ||
      material[0].material.grupo.nombre === 'Barniz s/impresión'
    ) {
      this.Tinta = true;
      this.Recepcion_selected = recepcion;
      this.Material_selected = material;
      this.index_material = index_material;

      if (this.analisis.buscarAnalisisPorID(material[0].analisis)) {
        this.Analisis = this.analisis.buscarAnalisisPorID(material[0].analisis);
        if (!this.Analisis.resultado.resultado) {
          this.Analisis.resultado.pendiente = undefined;
        }
      }
    } else if (material[0].material.grupo.nombre === 'Cajas Corrugadas') {
      this.Caja = true;
      this.Recepcion_selected = recepcion;
      this.Material_selected = material;
      this.index_material = index_material;
      if (this.analisis.buscarAnalisisCajasPorID(material[0].analisis)) {
        this.AnalisisCajas = this.analisis.buscarAnalisisCajasPorID(material[0].analisis);
        console.log(this.AnalisisCajas);
      }
    } else if (material[0].material.grupo.nombre === 'Soportes de Embalaje') {
      this.pads = true;
      this.Recepcion_selected = recepcion;
      this.Material_selected = material;
      this.index_material = index_material;
      if (this.analisis.buscarAnalisisPadsPorID(material[0].analisis)) {
        this.analisisPads = this.analisis.buscarAnalisisPadsPorID(material[0].analisis);
      }
    } else if (material[0].material.grupo.trato === true) {
      this.Sustrato = true;
      this.Recepcion_selected = recepcion;
      this.Material_selected = material;
      this.index_material = index_material;

      if (this.analisis.buscarAnalisisSustratoPorID(material[0].analisis)) {
        this.analisisSustrato = this.analisis.buscarAnalisisSustratoPorID(material[0].analisis);
      }
    } else {
      this.otro = true;
      this.Recepcion_selected = recepcion;
      this.Material_selected = material;
      this.index_material = index_material;
      if (this.analisis.buscarAnalisisOtrosPorID(material[0].analisis)) {
        this.AnalisisOtro = this.analisis.buscarAnalisisOtrosPorID(material[0].analisis);
      }
    }
  }

  Cerrar_() {
    this.Tinta = false;
  }

  cerrar_cajas() {
    this.Caja = false;
    this.pads = false;
    this.otro = false;
    setTimeout(() => {
      // this.SustratoChar();
      Swal.fire({
        title: this.analisis.mensaje.mensaje,
        icon: this.analisis.mensaje.icon,
        timer: 5000,
        showConfirmButton: false,
        timerProgressBar: true,
        toast: true,
        position: 'top-end',
      });
    }, 1000);
  }

  Cerrar() {
    this.Tinta = false;
    // this.SustratoChar()
    setTimeout(() => {
      // this.SustratoChar();
      Swal.fire({
        title: this.analisis.mensaje.mensaje,
        icon: this.analisis.mensaje.icon,
        timer: 5000,
        showConfirmButton: false,
        timerProgressBar: true,
        toast: true,
        position: 'top-end',
      });
    }, 1000);
  }

  Cerrar_tinta() {
    this.Sustrato = false;
    setTimeout(() => {
      Swal.fire({
        title: this.analisis.mensaje.mensaje,
        icon: this.analisis.mensaje.icon,
        timer: 5000,
        showConfirmButton: false,
        timerProgressBar: true,
        toast: true,
        position: 'top-end',
      });
    }, 1000);
  }

  buscar() {
    this.mostrarSeccionBuscar = true;
  }

  buscar_() {
    this.sin_analizar = false;
    this.loading = true;

    if (this.grupo_selected) {
      this.Materiales = this.recepciones.filtrarMaterialesPorGrupoYAnalisis(
        this.grupo_selected,
        this.material_selected,
      );
    }

    if (this.lote_selected) {
      this.Materiales = this.recepciones.filtrarMaterialesPorLoteYAnalisis(this.lote_selected);
    }

    if (this.desde && this.hasta) {
      if (this.hasta < this.desde) {
        Swal.fire({
          showConfirmButton: false,
          icon: 'error',
          text: 'Debes ingresar un lapso de fechas validas',
          toast: true,
          timerProgressBar: true,
          timer: 5000,
          position: 'top-end',
        });
        this.loading = false;
      } else {
        const desde = Date.parse(this.desde);
        const hasta = Date.parse(this.hasta);

        this.Materiales = this.recepciones.filtrarMaterialesporFecha(desde, hasta);
        console.log(this.Materiales);
      }
    }

    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }

  cancelar() {
    this.mostrarSeccionBuscar = false;
  }

  MostrarBusquedad() {
    this.Busqueda = true;
    console.log(this.Materiales);
  }
}
