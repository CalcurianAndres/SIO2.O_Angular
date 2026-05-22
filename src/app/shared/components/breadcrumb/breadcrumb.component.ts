import { Component } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';

interface Breadcrumb {
  label: string;
  url: string;
}

const SEGMENT_MAP: Record<string, string> = {
  compras: 'Compras',
  grupos: 'Grupos',
  fabricantes: 'Fabricantes',
  proveedores: 'Proveedores',
  ordenes: 'Órdenes',
  ventas: 'Ventas',
  compra: 'Orden de Compra',
  clientes: 'Clientes',
  almacen: 'Almacén',
  inventario: 'Inventario',
  recepcion: 'Recepción',
  bobinas: 'Bobinas',
  'producto-terminado': 'Producto Terminado',
  laboratorio: 'Laboratorio',
  especificacion: 'Especificación',
  analisis: 'Análisis',
  defectos: 'Defectos',
  certificado: 'Certificados',
  fases: 'Fases',
  maquinas: 'Máquinas',
  categoria: 'Categoría',
  productos: 'Productos',
  tintas: 'Preparación de Tintas',
  produccion: 'Producción',
  'nueva-gestion': 'Nueva Gestión',
  empleados: 'Empleados',
  empresa: 'Empresa',
  departamentos: 'Departamentos',
  cargos: 'Cargos',
  horarios: 'Horarios',
  dashboard: 'Dashboard',
};

@Component({
  selector: 'app-breadcrumb',
  standalone: false,
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
})
export class BreadcrumbComponent {
  breadcrumbs: Breadcrumb[] = [];

  constructor(private router: Router) {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      this.breadcrumbs = this.buildBreadcrumbs(this.router.url);
    });
  }

  private buildBreadcrumbs(url: string): Breadcrumb[] {
    const segments = url.split('/').filter(Boolean);
    return segments.map((seg, i) => ({
      label: SEGMENT_MAP[seg] || seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
      url: '/' + segments.slice(0, i + 1).join('/'),
    }));
  }
}
