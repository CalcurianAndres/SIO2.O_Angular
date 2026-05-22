import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DevolucionesService } from 'src/app/services/devoluciones.service';

@Component({
  selector: 'app-devoluciones-profile',
  templateUrl: './devoluciones-profile.component.html',
  styleUrls: ['./devoluciones-profile.component.scss'],
})
export class DevolucionesProfileComponent implements OnInit {
  public selected!: any;
  public loading = true;

  constructor(
    private route: ActivatedRoute,
    public devoluciones: DevolucionesService,
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      const id = this.route.snapshot.paramMap.get('id');
      this.selected = this.devoluciones.devoluciones.find((d: any) => d._id === id);
      this.loading = false;
    }, 2000);
  }
}
