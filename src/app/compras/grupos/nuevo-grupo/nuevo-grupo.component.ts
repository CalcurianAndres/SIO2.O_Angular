import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-nuevo-grupo',
  standalone: false,templateUrl: './nuevo-grupo.component.html',
  styleUrls: ['./nuevo-grupo.component.scss']
})
export class NuevoGrupoComponent implements OnInit{
  @Input() api:any;
  @Input() nuevo:any;
  @Input() editar:any;
  @Input() data:any;
  @Input() cargando!:boolean;
  @Input() trato;
  @Input() otro;
  @Output() onCloseModal = new EventEmitter();
  @Output() onCloseModal_ = new EventEmitter();
  @Output() onLoading = new EventEmitter();

  nombre = "";
  parcial = "false";
  icono = "";

  public iconos_gallery = false
  public iconos_gallery_ = false

  ngOnInit(): void {
    var phrases = [
      'Casi termina...',
    ];
  
    // Function to change the random phrase
    function changeRandomPhrase() {
      var randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      document.getElementById('random-phrases')!.textContent = randomPhrase;
    }
  
    // Call the function every 1 second
    setInterval(changeRandomPhrase, 2000);
  }

  public nuevoGrupo = async()=>{
    this.onCloseModal.emit()
    let data = {
      nombre:this.nombre,
      parcial:this.parcial,
      icono:this.icono,
      trato:this.trato,
      otro:this.otro
    }
    await this.api.GuardarGrupo(data)

    this.nombre = "";
    this.parcial = 'false';
    this.icono = "";
    this.trato = false;

  }

  verTrato(e:any){
    this.trato = e.checked
  }

  verOtro(e:any){
    this.otro = e.checked
  }

  cerrar(){
    this.nombre = "";
    this.parcial = 'false';
    this.icono = "";

    this.onCloseModal.emit()

  }

  cerrar_(){
    this.nombre = "";
    this.parcial = 'false';
    this.icono = "";

    this.onCloseModal_.emit()

  }

  EditarGrupo(){
    this.data.otro = this.otro;
    this.data.trato = this.trato;
    this.api.EditarGrupo(this.data)
    this.onCloseModal.emit()
  }


  selectIcon(clase){
    this.icono = clase
    this.nuevo = true;
    this.iconos_gallery = false;
  }

  selectIcon_(clase){
    this.data.icono = clase
    this.editar = true;
    this.iconos_gallery_ = false;
  }

}
