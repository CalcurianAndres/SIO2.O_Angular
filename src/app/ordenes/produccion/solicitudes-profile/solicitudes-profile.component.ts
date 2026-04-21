import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SolicitudesService } from 'src/app/services/solicitudes.service';

@Component({
  selector: 'app-solicitudes-profile',
  templateUrl: './solicitudes-profile.component.html',
  styleUrls: ['./solicitudes-profile.component.scss']
})
export class SolicitudesProfileComponent {


   public selected!:any
   public loading = true
  
    constructor(private route: ActivatedRoute,
                public solicitudes:SolicitudesService
    ){}
  
    ngOnInit(): void {
      setTimeout(() => {
        const id = this.route.snapshot.paramMap.get('id');
        this.selected = this.solicitudes.solicitudes.find((d:any)=> d._id === id)
        this.loading = false
      },2000);
    }

}
