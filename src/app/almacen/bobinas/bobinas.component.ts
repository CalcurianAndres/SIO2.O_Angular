import { Component } from '@angular/core';
import { BobinasService } from 'src/app/services/bobinas.service';

@Component({
  selector: 'app-bobinas',
  templateUrl: './bobinas.component.html',
  styleUrls: ['./bobinas.component.scss']
})
export class BobinasComponent {

  public clicked: any = [];
  public convertidora = false;
  public bobina = false

  constructor(public api:BobinasService){

  }

  // Función para mostrar u ocultar información adicional en una sección
showInfo(i) {
  if (!this.clicked[i]) {
    this.clicked[i] = true; // Si no se ha hecho clic previamente, muestra la información adicional
  } else {
    this.clicked[i] = false; // Si ya se hizo clic, oculta la información adicional
  }
}

}
