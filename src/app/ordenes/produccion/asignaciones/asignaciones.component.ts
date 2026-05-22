import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OproduccionService } from 'src/app/services/oproduccion.service';

@Component({
  selector: 'app-asignaciones',
  standalone: false,
  templateUrl: './asignaciones.component.html',
  styleUrls: ['./asignaciones.component.scss'],
})
export class AsignacionesComponent implements OnInit {
  public selected!: any;
  public loading = true;

  constructor(
    private route: ActivatedRoute,
    public asignaciones: OproduccionService,
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      const id = this.route.snapshot.paramMap.get('id');
      this.selected = this.asignaciones.asignaciones.find((a: any) => a._id === id);
      this.loading = false;
    }, 2000);
  }
}
