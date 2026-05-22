import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FabricantesService } from 'src/app/services/fabricantes.service';
import { Proveedores } from '../../models/modelos-compra';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-nuevo-proveedor',
  standalone: false,
  templateUrl: './nuevo-proveedor.component.html',
  styleUrls: ['./nuevo-proveedor.component.scss'],
})
export class NuevoProveedorComponent implements OnInit {
  @Input() nuevo!: boolean;
  @Input() editar!: boolean;
  @Input() proveedor!: Proveedores;
  @Input() api: any;
  @Input() cargando!: boolean;
  @Output() onCloseModal = new EventEmitter();
  @Output() onCloseModal_ = new EventEmitter();

  public proveedor_directo: any = false;
  public nombre: string = '';
  public direccion: string = '';
  public rif: string = '';
  public contacto_nombre: string = '';
  public contacto_numero: string = '';
  public contacto_email: string = '';
  public fabricante: any;
  public contactos: any = [];
  public fabricantes_array: any = [];
  public fabricantes_array_name: any = [];

  constructor(public fabricantes: FabricantesService) {}

  public editar_contacto: boolean[] = [];

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

  cerrar() {
    this.nombre = '';
    this.direccion = '';
    this.rif = '';
    this.contactos = [];
    this.onCloseModal.emit();
  }

  cerrar_() {
    this.nombre = '';
    this.direccion = '';
    this.rif = '';
    this.contactos = [];
    this.onCloseModal_.emit();
  }

  EliminarContacto(i: number) {
    this.contactos.splice(i, 1);
  }

  formatRif(event: any) {
    const regex = /^[JVGC]-?\d{0,8}-?\d{0,1}$/; // Expresión regular actualizada
    const newValue = event.target.value.toUpperCase();

    if (!regex.test(newValue)) {
      this.rif = newValue.substring(0, newValue.length - 1);
    } else {
      // Agregar guiones automáticamente
      let formattedValue = newValue.replace(/(\d{0})(\d{8})(\d{1})/, '$1-$2-$3');
      this.rif = formattedValue; // Establecer el valor formateado n el campo de input
    }
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  checkProveedor() {
    if (!this.proveedor_directo) {
      this.nombre = this.fabricantes.fabricantes[this.fabricante].nombre;
      (<HTMLInputElement>document.getElementById('nombre')).disabled = true;
    } else {
      this.nombre = '';
      (<HTMLInputElement>document.getElementById('nombre')).disabled = false;
    }
  }

  addFabricante() {
    if (!this.fabricantes_array.includes(this.fabricantes.fabricantes[this.fabricante]._id)) {
      this.fabricantes_array.push(this.fabricantes.fabricantes[this.fabricante]._id);
      this.fabricantes_array_name.push(this.fabricantes.fabricantes[this.fabricante].alias);
      this.fabricante = '';
    }
  }
  addFabricante_() {
    if (!this.proveedor.fabricantes.includes(this.fabricantes.fabricantes[this.fabricante])) {
      this.proveedor.fabricantes.push(this.fabricantes.fabricantes[this.fabricante]);
      this.fabricante = '';
    }
  }
  EliminarFabricante(i: number) {
    this.fabricantes_array.splice(i, 1);
    this.fabricantes_array_name.splice(i, 1);
  }

  fabricante_selected(e: any | null) {
    if (e.value != '#') {
      this.fabricante = e.value;
    }
  }

  NuevoContacto() {
    this.contactos.push({
      nombre: this.contacto_nombre,
      numero: this.contacto_numero,
      email: this.contacto_email,
    });
    this.contacto_email = '';
    this.contacto_nombre = '';
    this.contacto_numero = '';
  }

  NuevoContacto_() {
    this.proveedor.contactos.push({
      nombre: this.contacto_nombre,
      numero: this.contacto_numero,
      email: this.contacto_email,
    });
    this.contacto_email = '';
    this.contacto_nombre = '';
    this.contacto_numero = '';
  }

  GuardarProveedor() {
    let data: Proveedores = {
      fabricantes: this.fabricantes_array,
      nombre: this.nombre,
      direccion: this.direccion,
      rif: this.rif,
      contactos: this.contactos,
    };

    this.api.nuevoProveedor(data);
    this.cerrar();
  }

  EditarProveedor() {
    this.proveedor.fabricantes = this.proveedor.fabricantes.map((e: any) => e._id);
    this.api.editarProveedores(this.proveedor);
    this.cerrar();
  }
}
