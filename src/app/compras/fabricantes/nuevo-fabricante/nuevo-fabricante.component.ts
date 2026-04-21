import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import Swal from 'sweetalert2';
import { Fabricante, Fabricante_populated, Grupo, Origenes, Proveedores } from '../../models/modelos-compra';
import { FabricantesService } from 'src/app/services/fabricantes.service';
import { ProveedoresService } from 'src/app/services/proveedores.service';

@Component({
  selector: 'app-nuevo-fabricante',
  standalone: false, templateUrl: './nuevo-fabricante.component.html',
  styleUrls: ['./nuevo-fabricante.component.scss']
})
export class NuevoFabricanteComponent implements OnInit {
  @Input() nuevo: any;
  @Input() data!: Fabricante_populated;
  @Input() editar: any;
  @Input() cargando!: boolean;
  @Output() onCloseModal = new EventEmitter();
  @Output() onCloseModal_ = new EventEmitter();

  nombre: string = '';
  alias: string = '';
  pais: string = '';
  estado: string = '';
  grupo: string = ''
  proveedor_directo: boolean = false;

  p_nombre: string = ''
  p_telefono: string = ''
  p_correo: string = ''
  p_contacto: any = []
  p_direccion: string = ''
  p_rif: string = ''
  p_cargo: string = ''

  proveedor_directo_selected: any;
  proveedor_directo_abierto: boolean = false;

  elementosVisibles: boolean[] = [];

  public origenes: Array<Origenes> = [];
  public grupos: Array<Grupo> = []

  constructor(public api: FabricantesService,
    public proveedor_service: ProveedoresService) {

  }

  ngOnInit(): void {
    var phrases = [
      'Arreglando código de programación',
      'Ajustando colores',
      'Descargando la información',
      'Buscando errores',
      'Programando la respuesta que quieres',
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

  editar_(i: number) {
    this.elementosVisibles[i] = true;
  }

  guardarCambios(i: number) {
    this.elementosVisibles[i] = false;
  }


  // //genera una funcion llamada editar_() que coloque agregue es estilo display:none al elemento con id contacto_i
  // editar_(i:number) {
  //   const elemento = document.getElementById(`contactos_${i}`);
  //   if (elemento) {
  //     elemento.style.display = 'none';
  //     const elemento2 = document.getElementById(`formularios_${i}`);
  //     if (elemento2) {
  //       elemento2.style.display = 'block';
  //       // elimina elemento con id botones_i
  //       const elemento3 = document.getElementById(`botones_${i}`);
  //       if (elemento3) {
  //         elemento3.style.display = 'none';
  //       }
  //     }

  //   }
  // }

  //guardar dentro de this.p_contacto un objeto con nombre,telefono,correo cara uno correspondiente al valor de las variables p_nombre, p_telefono, p_correo
  AgregarContacto() {
    this.p_contacto.push({
      nombre: this.p_nombre,
      numero: this.p_telefono,
      email: this.p_correo,
      cargo: this.p_cargo
    });
    this.p_nombre = '';
    this.p_telefono = '';
    this.p_correo = '';
    this.p_cargo = ''
  }
  AgregarContacto_() {
    this.proveedor_directo_selected[0].contactos.push({
      nombre: this.p_nombre,
      numero: this.p_telefono,
      email: this.p_correo,
      cargo: this.p_cargo
    });
    this.p_nombre = '';
    this.p_telefono = '';
    this.p_correo = '';
    this.p_cargo = '';
  }

  addGuion() {
    if (this.p_rif.length === 1) {
      this.p_rif = this.p_rif + '-';
    }

    if (this.proveedor_directo_selected[0].rif === 1) {
      this.proveedor_directo_selected[0].rif + '-';
    }
  }

  checkValidity(email: any) {
    // Expresión regular para validar el formato del email
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Verificar si el email cumple con el formato válido
    if (!emailRegex.test(email)) {
      return false;
    }

    // Otras validaciones personalizadas, si es necesario

    return true;
  }


  public correo_valido = false;
  validateEmail(correo: any) {
    var validationMessage = document.getElementById("validationMessage");

    if (this.checkValidity(correo)) {
      this.correo_valido = true;
      validationMessage!.textContent = "";
      validationMessage!.style.color = "green";
    } else {
      validationMessage!.textContent = "correo Invalido";
      validationMessage!.style.color = "red";
    }
  }


  //crea una funcion llamada deletecontacto que reciba un indice que sera buscado en this.p_contacto y sera elminado del mismo
  deletecontacto(index: number) {
    this.p_contacto.splice(index, 1);
  }

  deletecontacto_(index: number) {
    this.proveedor_directo_selected[0].contactos.splice(index, 1);
  }

  proveedor(e: any) {
    this.proveedor_directo = e.checked;
  }

  cerrar() {
    this.onCloseModal.emit()
  }
  cerrar_() {
    console.log('close')
    this.onCloseModal_.emit()
  }

  addOrigen() {
    let busqueda = this.origenes.find(x => x.pais === this.pais && x.estado === this.estado)

    if (!busqueda) {
      this.origenes.push({ pais: this.pais, estado: this.estado })
      this.estado = ''
    }
  }

  deleteOrigen(i: number) {
    this.origenes.splice(i, 1)
  }

  deleteGrupo(i: number) {
    this.grupos.splice(i, 1)
  }

  deleteOrigen_(i: number) {
    this.data.origenes.splice(i, 1)
  }

  deleteGrupo_(i: number) {
    this.data.grupo.splice(i, 1)
  }

  addOrigen_() {
    let busqueda = this.data.origenes.find(x => x.pais === this.pais && x.estado === this.estado)

    if (!busqueda) {
      this.data.origenes.push({ pais: this.pais, estado: this.estado })
      this.estado = ''
    }
  }

  addGrupo_() {
    let s_ = this.grupo.split('*')
    let nombre = s_[0]
    let id = s_[1]
    let busqueda = this.data.grupo.find(x => x._id === id && x.nombre === nombre)
    if (!busqueda) {
      this.data.grupo.push({ _id: id, nombre })
      this.grupo = ''
    }
  }


  editGrupo(i) {
    this.edicionGrupo[i] = true
  }

  public edicionGrupo: boolean[] = [];

  editarGrupoEspec(index: any) {

    let data_actual: any = this.data.grupo[index]
    console.log(data_actual)
    data_actual.split('*')
    let nombre = data_actual.split('*')[0]
    let _id = data_actual.split('*')[1]

    this.data.grupo[index] = {
      _id, nombre
    }
    this.edicionGrupo[index] = false
  }

  addGrupo() {
    console.log('aja')
    let s_ = this.grupo.split('*')
    let nombre = s_[0]
    let id = s_[1]
    let busqueda = this.grupos.find(x => x._id === id && x.nombre === nombre)
    if (!busqueda) {
      this.grupos.push({ _id: id, nombre })
      this.grupo = ''
    }
  }

  guardarFabricante(): void {
    const { nombre, alias, origenes, grupos } = this;
    const nuevoFabricante: Fabricante = {
      nombre,
      alias,
      origenes,
      proveedor: this.proveedor_directo,
      grupo: grupos.map(grupo => grupo._id),
      _id: ''
    };
    this.api.agregarFabricante(nuevoFabricante);

    if (this.proveedor_directo) {
      setTimeout(() => {
        const { nombre, p_contacto, p_direccion, p_rif } = this;
        let proveedor: Proveedores = {
          fabricantes: '',
          nombre,
          contactos: p_contacto,
          direccion: p_direccion,
          rif: p_rif,
        }
        this.proveedor_service.nuevoProveedor(proveedor)
        this.onCloseModal.emit();
        this.nombre = '';
        this.alias = '';
        this.pais = '';
        this.estado = '';
        this.grupo = '';
        this.proveedor_directo = false;

        this.p_nombre = ''
        this.p_telefono = ''
        this.p_correo = ''
        this.p_contacto = []
        this.p_direccion = ''
        this.p_rif = ''
        this.p_cargo = ''
        this.origenes = []
        this.grupos = []
      }, 1000)
    }
    this.onCloseModal.emit();
  }

  BuscarProveedor() {
    console.log(this.data)
    if (!this.proveedor_directo_abierto) {
      this.proveedor_directo_selected = this.proveedor_service.seleccionarUnProveedor(this.data.nombre);
      this.proveedor_directo_abierto = true;
    } else {
      this.proveedor_directo_abierto = false;
    }

  }

  editarFabricante() {
    this.api.editarFabricante(this.data)
    console.log(this.proveedor_directo_selected)
    if (this.proveedor_directo_selected) {
      setTimeout(() => {
        this.proveedor_service.editarProveedores(this.proveedor_directo_selected[0])
        this.onCloseModal.emit()
      }, 1000)
    }
    this.onCloseModal.emit()
  }


}
