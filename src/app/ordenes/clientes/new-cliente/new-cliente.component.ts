import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, AfterViewInit } from '@angular/core';
import { ClientesService } from 'src/app/services/clientes.service';
import Swal from 'sweetalert2';
import * as L from 'leaflet';

// Fix Leaflet default icon paths for Angular/webpack builds
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

@Component({
  selector: 'app-new-cliente',
  standalone: false,
  templateUrl: './new-cliente.component.html',
  styleUrls: ['./new-cliente.component.scss'],
})
export class NewClienteComponent implements OnChanges, AfterViewInit {
  constructor(public api: ClientesService) {}

  @Input() data: any;
  @Input() cliente: any;
  @Input() editar: any;
  @Output() onCloseModal = new EventEmitter();
  @Output() onGuardarCliente = new EventEmitter();

  public guardando = false;
  public mapa: L.Map | null = null;
  public marcador: L.Marker | null = null;
  public buscandoDireccion = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['cliente']?.currentValue === true || changes['editar']?.currentValue === true) {
      this.guardando = false;
      setTimeout(() => this.initMap(), 600);
    }
  }

  ngAfterViewInit() {
    setTimeout(() => this.initMap(), 600);
  }

  onAlmacenNombreChange() {
    if (this.Almacene_temporal.nombre?.trim()) {
      setTimeout(() => {
        if (!this.mapa) {
          this.initMap();
        } else {
          this.mapa.invalidateSize();
        }
      }, 150);
    }
  }

  private initMap() {
    if (this.mapa) return;
    const mapEl = document.getElementById('mapa-almacen');
    if (!mapEl) return;
    if (mapEl.clientWidth === 0 || mapEl.clientHeight === 0) {
      setTimeout(() => this.initMap(), 300);
      return;
    }

    this.mapa = L.map(mapEl, {
      center: [10.4806, -66.9036],
      zoom: 5,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    }).addTo(this.mapa);

    this.mapa.on('click', (e: L.LeafletMouseEvent) => {
      this.colocarPin(e.latlng.lat, e.latlng.lng);
    });
  }

  private colocarPin(lat: number, lng: number) {
    if (this.marcador) {
      this.marcador.setLatLng([lat, lng]);
    } else {
      this.marcador = L.marker([lat, lng], { draggable: true }).addTo(this.mapa!);
      this.marcador.on('dragend', () => {
        const pos = this.marcador!.getLatLng();
        this.Almacene_temporal.lat = parseFloat(pos.lat.toFixed(6));
        this.Almacene_temporal.lng = parseFloat(pos.lng.toFixed(6));
      });
    }
    this.Almacene_temporal.lat = parseFloat(lat.toFixed(6));
    this.Almacene_temporal.lng = parseFloat(lng.toFixed(6));
    this.mapa?.setView([lat, lng], this.mapa.getZoom() < 10 ? 10 : this.mapa.getZoom());
  }

  buscarEnMapa() {
    if (!this.Almacene_temporal.nombre?.trim()) return;
    this.buscandoDireccion = true;
    const q = encodeURIComponent(this.Almacene_temporal.nombre + ', Venezuela');
    fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=5`)
      .then((r) => r.json())
      .then((results) => {
        if (results?.length > 0) {
          const r = results[0];
          this.colocarPin(parseFloat(r.lat), parseFloat(r.lon));
        }
      })
      .catch(() => {})
      .finally(() => (this.buscandoDireccion = false));
  }

  public cliente_temporal: any = { nombre: '', titulo: '', cargo: '', correo: '', telefono: '' };
  public Almacene_temporal: any = { nombre: '', lat: null, lng: null };

  cerrar() {
    if (this.guardando) return;
    this.destruirMapa();
    this.onCloseModal.emit();
  }

  private destruirMapa() {
    if (this.mapa) {
      this.mapa.remove();
      this.mapa = null;
      this.marcador = null;
    }
  }

  addGuion() {
    if (this.data.rif?.length === 1) {
      this.data.rif = this.data.rif + '-';
    }
  }

  aceptarCliente() {
    if (!this.cliente_temporal.nombre?.trim()) return;
    this.data.contactos.push({ ...this.cliente_temporal });
    this.cliente_temporal = { nombre: '', titulo: 'Sr.', cargo: '', correo: '', telefono: '' };
  }

  aceptarAlmacen() {
    if (!this.Almacene_temporal.nombre?.trim()) return;
    this.data.almacenes.push({ ...this.Almacene_temporal });
    this.Almacene_temporal = { nombre: '', lat: null, lng: null };
    if (this.marcador) {
      this.marcador.remove();
      this.marcador = null;
    }
  }

  eliminarContacto(index: number) {
    this.data.contactos.splice(index, 1);
  }

  eliminarAlmacen(index: number) {
    this.data.almacenes.splice(index, 1);
  }

  seleccionarAlmacenParaEditar(almacen: any) {
    this.Almacene_temporal = { ...almacen };
    setTimeout(() => this.onAlmacenNombreChange(), 50);
    if (almacen.lat && almacen.lng) {
      setTimeout(() => this.colocarPin(almacen.lat, almacen.lng), 600);
    }
  }

  guardar() {
    this.guardando = true;
    this.api.GuardarCliente(this.data);
    this.onGuardarCliente.emit();
    setTimeout(() => {
      this.guardando = false;
      Swal.fire({
        icon: this.api.mensaje.icon,
        text: this.api.mensaje.mensaje,
        timer: 1500,
        timerProgressBar: true,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
      });
    }, 1000);
  }

  editarCliente() {
    this.guardando = true;
    this.api.EditarClientes(this.data);
    this.onGuardarCliente.emit();
    setTimeout(() => {
      this.guardando = false;
      Swal.fire({
        icon: this.api.mensaje.icon,
        text: this.api.mensaje.mensaje,
        timer: 1500,
        timerProgressBar: true,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
      });
    }, 1000);
  }
}
