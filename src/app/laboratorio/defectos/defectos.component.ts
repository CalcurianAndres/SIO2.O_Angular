import { Component } from '@angular/core';
import { CategoriasService } from 'src/app/services/categorias.service';
import { ClientesService } from 'src/app/services/clientes.service';
import { DefectosService } from 'src/app/services/defectos.service';
import { OpoligraficaService } from 'src/app/services/opoligrafica.service';
import { OproduccionService } from 'src/app/services/oproduccion.service';
import { TrabajadoresService } from 'src/app/services/trabajadores.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-defectos',
  standalone: false,
  templateUrl: './defectos.component.html',
  styleUrls: ['./defectos.component.scss'],
})
export class DefectosComponent {
  constructor(
    public clientes: ClientesService,
    public categorias: CategoriasService,
    public api: DefectosService,
    public ordenes: OproduccionService,
    public trabajadores: TrabajadoresService,
  ) {}

  public valor = 0;

  public Tags = [true, false, false];
  public defecto = '';

  public cliente_ = '';
  public categoria_ = '';
  public aqls = [0, 0, 0];
  public defectos = {
    menores: [],
    mayores: [],
    criticos: [],
  };
  public _causas: any = {
    menores: [],
    mayores: [],
    criticos: [],
  };

  public tipo = '';
  public n = 0;
  public edicion = false;

  public edicion_general = false;
  public ticket_rojo = false;
  public causas = false;
  public causa_posible: any = '';
  public causas_array: any = [];

  public index_actual: number = 0;
  public index_tag = 0;
  public causas_por_defectos: any = [[]];

  public tipo_selected;
  public defecto_selected;
  public causa_selected;

  mostrarCausas: { [key: string]: boolean } = {};

  public fase_selected;
  public causa_;

  public supervisor;
  public searchText__;
  public searchText_;

  public analista;
  public searchText;
  public paleta;
  public cantidad;
  public destructor;
  public listaDeTicketsRojos = false;
  public listado: any = [];

  public listaDeTicketsAmarillo = false;

  MostrarListado(lista, op) {
    this.listado = lista;
    this.GenerarTicket(op);
  }

  filteredEmployees__() {
    if (!this.searchText__) {
      return [];
    }

    return this.trabajadores.trabajador.filter((trabajador) => {
      const nombreCompleto = `${trabajador.datos_personales.nombres} ${trabajador.datos_personales.apellidos}`;
      const searchMatch =
        trabajador.datos_personales.nombres.toLowerCase().includes(this.searchText__.toLowerCase()) ||
        trabajador.datos_personales.apellidos.toLowerCase().includes(this.searchText__.toLowerCase()) ||
        trabajador.contratacion.cargo.nombre.toLowerCase().includes(this.searchText__.toLowerCase());

      // const nombreEnTeam = this.data.team.find((empleado: string) => empleado === nombreCompleto);

      return searchMatch;
    });
  }

  filteredEmployees_() {
    if (!this.searchText) {
      return [];
    }

    return this.trabajadores.trabajador.filter((trabajador) => {
      const nombreCompleto = `${trabajador.datos_personales.nombres} ${trabajador.datos_personales.apellidos}`;
      const searchMatch =
        trabajador.datos_personales.nombres.toLowerCase().includes(this.searchText.toLowerCase()) ||
        trabajador.datos_personales.apellidos.toLowerCase().includes(this.searchText.toLowerCase()) ||
        trabajador.contratacion.cargo.nombre.toLowerCase().includes(this.searchText.toLowerCase());

      // const nombreEnTeam = this.data.team.find((empleado: string) => empleado === nombreCompleto);

      return searchMatch;
    });
  }

  filteredEmployees() {
    if (!this.searchText_) {
      return [];
    }

    return this.trabajadores.trabajador.filter((trabajador) => {
      const nombreCompleto = `${trabajador.datos_personales.nombres} ${trabajador.datos_personales.apellidos}`;
      const searchMatch =
        trabajador.datos_personales.nombres.toLowerCase().includes(this.searchText_.toLowerCase()) ||
        trabajador.datos_personales.apellidos.toLowerCase().includes(this.searchText_.toLowerCase()) ||
        trabajador.contratacion.cargo.nombre.toLowerCase().includes(this.searchText_.toLowerCase());

      // const nombreEnTeam = this.data.team.find((empleado: string) => empleado === nombreCompleto);

      return searchMatch;
    });
  }

  toggleCausas(index: number, tipo: string): void {
    const key = tipo + index;
    this.mostrarCausas[key] = !this.mostrarCausas[key];
  }

  agregarCausa(defecto: any) {
    if (typeof defecto === 'string') {
      defecto = { descripcion: defecto, causas: [], nuevaCausa: '' };
    }

    defecto.causas = defecto.causas || [];

    if (defecto.nuevaCausa?.trim()) {
      defecto.causas.push(defecto.nuevaCausa.trim());
      defecto.nuevaCausa = '';
    }
  }

  getTicketsAmarillosPorOrden(ordenId: string) {
    return this.ordenes.ticket_amarillo.filter((t) => t.op._id === ordenId);
  }

  GuardandoCambios(e) {
    if (this.Tags[0]) {
      this.aqls[0] = e.value;
    } else if (this.Tags[1]) {
      this.aqls[1] = e.value;
    } else {
      this.aqls[2] = e.value;
    }
  }

  guardarCausas() {
    if (!this.causas_por_defectos[this.index_actual]) {
      this.causas_por_defectos[this.index_actual] = [];
    }

    if (this.index_tag === 0) {
      if (!this._causas.menores[this.index_actual]) {
        this._causas.menores[this.index_actual] = [];
      }
      this._causas.menores[this.index_actual].push(...this.causas_array);
    } else if (this.index_tag === 1) {
      if (!this._causas.mayores[this.index_actual]) {
        this._causas.mayores[this.index_actual] = [];
      }
      this._causas.mayores[this.index_actual].push(...this.causas_array);
    } else if (this.index_tag === 2) {
      if (!this._causas.criticos[this.index_actual]) {
        this._causas.criticos[this.index_actual] = [];
      }
      this._causas.criticos[this.index_actual].push(...this.causas_array);
    }

    this.causas = false;
    this.causas_array = [];
    this.causa_posible = '';
  }

  habilitarEdicion() {
    this.edicion_general = true;
    this.Tags = [true, false, false];
    this.valor = this.aqls[0];
  }

  seleccionTag(n) {
    this.Tags = [false, false, false];
    this.Tags[n] = true;
    this.valor = this.aqls[n];
    // for(let i=0; i<this.aqls[n];i=i+0.01){
    //   this.valor = i;
    //   console.log(i)
    // }
  }

  editar(n, tipo) {
    this.edicion = true;
    this.n = n;
    this.tipo = tipo;
    this.valor = this.aqls[0];
  }

  clases: boolean[] = [];
  deleteDefecto(tipo, i) {
    this.clases[i] = true;
    setTimeout(() => {
      this.defectos[tipo].splice(i, 1);
      this.clases = [];
    }, 500);
  }

  onEnterPress() {
    if (!this.defecto) {
      return;
    }
    let tipo = '';
    if (this.Tags[0]) {
      tipo = 'menores';
    } else if (this.Tags[1]) {
      tipo = 'mayores';
    } else {
      tipo = 'criticos';
    }
    this.agregarDefecto(tipo);
    this.defecto = '';
  }

  addCausa() {
    if (!this.causa_posible) {
      return;
    }

    this.causas_array.push(this.causa_posible);
    this.causa_posible = '';
  }

  agregarDefecto(tipo) {
    this.defectos[tipo].push(this.defecto);
    this.defecto = '';
  }

  guardarCambios() {
    let data = {
      cliente: this.cliente_,
      categoria: this.categoria_,
      defectos: {
        menores: {
          causas: this._causas.menores,
          defectos: this.defectos.menores,
          aql: this.aqls[0],
        },
        mayores: {
          causas: this._causas.mayores,
          defectos: this.defectos.mayores,
          aql: this.aqls[1],
        },
        criticos: {
          causas: this._causas.criticos,
          defectos: this.defectos.criticos,
          aql: this.aqls[2],
        },
      },
    };

    this.api.guardarDefecto(data);
    setTimeout(() => {
      Swal.fire({
        toast: true,
        showConfirmButton: false,
        position: 'top-end',
        icon: this.api.mensaje.icon,
        text: this.api.mensaje.mensaje,
        timer: 5000,
        timerProgressBar: true,
      });
    }, 1000);
  }

  BuscarDefectosAlmacenados() {
    let resultado = this.api.buscarPorClienteYCategoria(this.cliente_, this.categoria_);
    if (!resultado) {
      this.edicion_general = true;
    } else {
      this.defectos.menores = resultado.defectos.menores.defectos;
      this.defectos.mayores = resultado.defectos.mayores.defectos;
      this.defectos.criticos = resultado.defectos.criticos.defectos;
      this._causas.menores = resultado.defectos.menores.causas;
      this._causas.mayores = resultado.defectos.mayores.causas;
      this._causas.criticos = resultado.defectos.criticos.causas;
      this.aqls[0] = resultado.defectos.menores.aql;
      this.aqls[1] = resultado.defectos.mayores.aql;
      this.aqls[2] = resultado.defectos.criticos.aql;
      this.edicion_general = false;
    }
  }

  public orden_selected: any = '';
  GenerarTicket(orden) {
    this.orden_selected = orden;
    this.cliente_ = orden.cliente._id;
    this.categoria_ = orden.producto[0].identificacion.categoria;

    this.BuscarDefectosAlmacenados();
  }

  guardar() {
    let data = {
      op: this.orden_selected,
      tipo: this.tipo_selected,
      defectos: this.defecto_selected,
      causa: this.causa_selected,
      fase: this.fase_selected,
      observacion: this.causa_,
      supervisor: this.supervisor,
      analista: this.analista,
      paleta: this.paleta,
      cantidad: this.cantidad,
      destructor: this.destructor,
    };

    this.ordenes.nuevoTicketRojo(data);

    this.orden_selected = '';
    this.defecto_selected = '';
    this.causa_selected = '';
    this.fase_selected = '';
    this.causa_ = '';
    this.supervisor = '';
    this.analista = '';
    this.paleta = '';
    this.cantidad = '';
    this.destructor = '';
    this.ticket_rojo = false;

    setTimeout(() => {
      console.log(this.ordenes.mensaje);
      Swal.fire({
        toast: true,
        text: this.ordenes.mensaje.mensaje,
        icon: this.ordenes.mensaje.icon,
        timer: 5000,
        showConfirmButton: false,
        position: 'top-end',
        timerProgressBar: true,
      });
    }, 1000);
  }
}
