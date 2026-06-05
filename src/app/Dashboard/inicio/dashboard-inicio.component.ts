import { Component, OnInit, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/login.service';
import { OproduccionService } from 'src/app/services/oproduccion.service';
import { AnalisisService } from 'src/app/services/analisis.service';
import { AlmacenService } from 'src/app/services/almacen.service';
import { ProveedoresService } from 'src/app/services/proveedores.service';
import { NotificationsService } from 'src/app/services/notifications.service';

@Component({
  selector: 'app-dashboard-inicio',
  standalone: false,
  templateUrl: './dashboard-inicio.component.html',
  styleUrls: ['./dashboard-inicio.component.scss'],
})
export class DashboardInicioComponent implements OnInit, OnDestroy {
  currentDate = new Date();
  circumference = 2 * Math.PI * 52;
  private intervalId: any;

  constructor(
    public login: LoginService,
    public produccion: OproduccionService,
    public analisis: AnalisisService,
    public almacen: AlmacenService,
    public proveedores: ProveedoresService,
    public notificaciones: NotificationsService,
    public router: Router,
    private title: Title,
  ) {}

  ngOnInit() {
    this.title.setTitle('Dashboard - SIO | Sistema Integral de Operación');
    this.intervalId = setInterval(() => {
      this.currentDate = new Date();
    }, 60000);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  get totalOP(): number {
    return this.produccion.orden?.filter((o: any) => o.status !== 'Completada' && o.status !== 'Cerrada')?.length || 0;
  }

  get totalAnalisisMes(): number {
    return this.analisis.analisisMensuales || 0;
  }

  get totalAprobados(): number {
    return (
      (this.analisis.TintasAprobadas || 0) +
      (this.analisis.SustratoAprobado || 0) +
      (this.analisis.CajasAceptadas || 0) +
      (this.analisis.PadsAprobados || 0) +
      (this.analisis.OtrosAprobados || 0)
    );
  }

  get totalRechazados(): number {
    return (
      (this.analisis.TintasRechazadas || 0) +
      (this.analisis.SustratoRechazado || 0) +
      (this.analisis.CajasRechazadas || 0) +
      (this.analisis.PadsRechazados || 0) +
      (this.analisis.OtrosRechazados || 0)
    );
  }

  get tasaAprobacion(): number {
    const total = this.totalAprobados + this.totalRechazados;
    return total > 0 ? Math.round((this.totalAprobados / total) * 100) : 0;
  }

  get totalMateriales(): number {
    return this.almacen.Almacen?.length || 0;
  }

  get totalProveedores(): number {
    return this.proveedores.proveedores?.length || 0;
  }

  get noAnalysisData(): boolean {
    return this.analysisCategories.every((c) => c.total === 0);
  }

  get analysisCategories(): any[] {
    const cats = [
      { name: 'Tintas', a: this.analisis.TintasAprobadas || 0, r: this.analisis.TintasRechazadas || 0 },
      { name: 'Sustratos', a: this.analisis.SustratoAprobado || 0, r: this.analisis.SustratoRechazado || 0 },
      { name: 'Cajas', a: this.analisis.CajasAceptadas || 0, r: this.analisis.CajasRechazadas || 0 },
      { name: 'Pads', a: this.analisis.PadsAprobados || 0, r: this.analisis.PadsRechazados || 0 },
      { name: 'Otros', a: this.analisis.OtrosAprobados || 0, r: this.analisis.OtrosRechazados || 0 },
    ];
    const maxTotal = Math.max(...cats.map((c) => c.a + c.r), 1);
    return cats.map((c) => ({
      name: c.name,
      aprobados: c.a,
      rechazados: c.r,
      total: c.a + c.r,
      aprobadosPct: (c.a / maxTotal) * 100 + '%',
      rechazadosPct: (c.r / maxTotal) * 100 + '%',
    }));
  }

  get ringDashArray(): string {
    return String(this.circumference);
  }

  get ringDashOffset(): string {
    return String(this.circumference - (this.circumference * this.tasaAprobacion) / 100);
  }

  get inventoryByGroup(): any[] {
    if (!this.almacen.Almacen) return [];
    const map = new Map<string, number>();
    this.almacen.Almacen.forEach((item: any) => {
      const name = item.material?.grupo?.nombre || 'Sin grupo';
      map.set(name, (map.get(name) || 0) + 1);
    });
    const items = Array.from(map.entries())
      .map(([nombre, count]) => ({ nombre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
    const maxCount = Math.max(...items.map((g) => g.count), 1);
    return items.map((g) => ({
      nombre: g.nombre,
      count: g.count,
      widthPct: (g.count / maxCount) * 100 + '%',
    }));
  }

  get recentNotifications(): any[] {
    return this.notificaciones.notificaciones?.slice(-5).reverse() || [];
  }
}
