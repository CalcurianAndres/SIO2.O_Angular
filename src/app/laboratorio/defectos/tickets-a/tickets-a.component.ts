import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-tickets-a',
  templateUrl: './tickets-a.component.html',
  styleUrls: ['./tickets-a.component.scss']
})
export class TicketsAComponent {



    @Input() ver:any;
    @Input() tickets:any;
    @Input() orden:any;
    @Output() onCloseModal = new EventEmitter()

    cerrar(){
      this.onCloseModal.emit()
    }

}
