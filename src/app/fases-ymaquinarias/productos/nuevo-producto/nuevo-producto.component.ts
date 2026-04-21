import { Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Producto } from 'src/app/compras/models/modelos-compra';
import { ClientesService } from 'src/app/services/clientes.service';
import { MaquinasService } from 'src/app/services/maquinas.service';
import { MaterialesService } from 'src/app/services/materiales.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-nuevo-producto',
  standalone: false,templateUrl: './nuevo-producto.component.html',
  styleUrls: ['./nuevo-producto.component.scss']
})
export class NuevoProductoComponent implements OnInit{

  constructor(public clientes:ClientesService,
              public materiales:MaterialesService,
              public maquinas:MaquinasService){}
  @Input() nuevo:any;
  @Input() producto!:Producto
  @Output() onCloseModal = new EventEmitter()



  cards = Array(8).fill(0).map((x,i)=>i+1); // Genera 8 tarjetas numeradas del 1 al 8
  isModalActive = false;

  openModal() {
    this.isModalActive = true;
  }

  closeModal() {
    this.isModalActive = false;
  }


  sustrato_selected = '';
  maquina_selected = '';
  troqueladora_selected = '';
  guillotina_selected = '';
  pegadora_selected = '';
  tinta_selected = {
    tinta:'',
    cantidad:0
  }
  barniz_selected = {
    barniz:'',
    cantidad:0
  }

  seleccion_tinta = false;

  ngOnInit(): void {
    this.updateCarousel();
  }

currentPanel = 1;
panelWidth = 1100; // Largura de cada painel
totalPanels = 8; // Número total de painéi

almacenarElemento(tipo: string, elemento: any, propiedad: string) {
  if (elemento) {
    const existe = this.producto[propiedad].includes(elemento);
    if (!existe) {
      this.producto[propiedad].push(elemento);
      console.log(this.producto[propiedad]);
    }
    this[tipo] = '';
  }
}

AlmacenarBarniz(){
  if(this.barniz_selected){
  let existe = this.producto.barnices.includes(this.barniz_selected)
    if(!existe){
      this.producto.barnices.push(this.barniz_selected)
      console.log(this.producto.barnices)
    }
    this.barniz_selected = {
      barniz:'',
      cantidad:0
    }
  }
}
AlmacenaTinta(){
  if(this.tinta_selected){
    let existe = this.producto.tintas.includes(this.tinta_selected)
    if(!existe){
      this.producto.tintas.push(this.tinta_selected)
      console.log(this.producto.tintas)
    }
    this.tinta_selected = {
      tinta:'',
      cantidad:0
    }
  }
}
AlmacenarSustrato(){
  if(this.sustrato_selected){
    let existe = this.producto.sustrato.includes(this.sustrato_selected)
    if(!existe){
      this.producto.sustrato.push(this.sustrato_selected)
      console.log(this.producto.sustrato)
    }
    this.sustrato_selected = ''
  }
}

AlmacenarMaquina(){
  if(this.sustrato_selected){
    let existe = this.producto.maquinas.includes(this.maquina_selected)
    if(!existe){
      this.producto.maquinas.push(this.maquina_selected)
      console.log(this.producto.maquinas)
    }
    this.maquina_selected = ''
  }
}

AlmacenarTroqueladora(){
  if(this.troqueladora_selected){
    let existe = this.producto.troqueladora.includes(this.troqueladora_selected)
    if(!existe){
      this.producto.troqueladora.push(this.troqueladora_selected)
      console.log(this.producto.troqueladora)
    }
    this.troqueladora_selected = ''
  }
}

AlmacenarGuillotina(){
  if(this.guillotina_selected){
    let existe = this.producto.guillotina.includes(this.guillotina_selected)
    if(!existe){
      this.producto.guillotina.push(this.guillotina_selected)
      console.log(this.producto.guillotina)
    }
    this.guillotina_selected = ''
  }
}

AlmacenarPegadora(){
  if(this.pegadora_selected){
    let existe = this.producto.pegadora.includes(this.pegadora_selected)
    if(!existe){
      this.producto.pegadora.push(this.pegadora_selected)
      console.log(this.producto.pegadora)
    }
    this.pegadora_selected = ''
  }
}

Impresion_(maquina, fase_) {
  let incluye = maquina.fases.some(fase => fase.nombre === fase_);
  return incluye;
}
changePanel(direction) {
    this.currentPanel += direction;

    if (this.currentPanel < 1) {
        this.currentPanel = this.totalPanels;
    } else if (this.currentPanel > this.totalPanels) {
        this.currentPanel = 1;
    }

    this.updateCarousel();
}

updateCarousel() {
    let carousel:any = document.getElementById('carousel');
    let panelContainer:any = document.querySelector('.carousel-container');
    const translateValue = -this.panelWidth * (this.currentPanel - 1);
    carousel.style.transform = `translateX(${translateValue}px)`;
    panelContainer.style.width = `${this.panelWidth}px`; // Ajuste a largura do contêiner para mostrar apenas um painel
}

cerrar(){
  this.onCloseModal.emit()
}

  notificar(){
    if(!this.seleccion_tinta){
      Swal.fire({
        icon:'info',
        title:'Cuidado con el orden',
        text:'Para la creación del producto es necesario señalar las tintas en el orden en el que fueron codificados los colores, la "Cantidad" de tinta necesaria para este producto debe ser indicada por cada 1.000 hojas',
        confirmButtonText:'DE ACUERDO',
        confirmButtonColor:'#48c78e'
      })
      this.seleccion_tinta = true;
    }
  }

  GuardarProducto(){
    console.log(this.producto)
  }
}
