import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Producto, Producto_ } from 'src/app/compras/models/modelos-compra';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ClientesService } from 'src/app/services/clientes.service';
import { MaterialesService } from 'src/app/services/materiales.service';
import { MaquinasService } from 'src/app/services/maquinas.service';
import Swal from 'sweetalert2';
import { SubirArchivosService } from 'src/app/services/subir-archivos.service';
import { CategoriasService } from 'src/app/services/categorias.service';
import * as pdfFonts from "pdfmake/build/vfs_fonts";
// import pdfFonts from '../../../../assets/fonts';
import * as moment from 'moment';
import { Cell, Columns, Img, Ol, PdfMakeWrapper, Stack, Table, Txt, Ul } from 'pdfmake-wrapper';
import { ProductosService } from 'src/app/services/productos.service';

@Component({
  selector: 'app-new-producto',
  standalone: false,templateUrl: './new-producto.component.html',
  styleUrls: ['./new-producto.component.scss']
})
export class NewProductoComponent {


  constructor(public clientes:ClientesService,
              public materiales:MaterialesService,
              public maquinas:MaquinasService,
              public categoria:CategoriasService,
              public uploadImage:SubirArchivosService,
              public api:ProductosService){
                this.crearModelo()
  }

  secuencia = ['Amarillo', 'Azul', 'Rojo', 'Negro'];

  drop(event: CdkDragDrop<string[]>, i:number) {
    moveItemInArray(this.producto.impresion.secuencia[i], event.previousIndex, event.currentIndex);
  }

  numeroIncrementalBase = 5; // Siempre empieza en 5 para secuencias desconocidas
  numeroPorSecuencia = new Map<string, number>([
    ['cyan', 2],
    ['negro', 1],
    ['magenta', 3],
    ['amarillo', 4]
  ]);


  public otros_selectec = ''
  
  getNumeroPorSecuencia(secuencias: string[], secuencia: string): number {
    // Resetea el número incremental y mapa
    let numeroIncremental = this.numeroIncrementalBase;
  
    // Map temporal para los valores de las secuencias dinámicas
    const numeroSecuenciasMap = new Map<string, number>();
  
    // Recorre todas las secuencias para recalcular los números
    for (const sec of secuencias) {
      const secLower = sec.toLowerCase();
  
      if (this.numeroPorSecuencia.has(secLower)) {
        // Si es una secuencia predefinida (cyan, negro, etc.), la usa
        numeroSecuenciasMap.set(sec, this.numeroPorSecuencia.get(secLower)!);
      } else {
        // Si no es predefinida, asigna el siguiente número incremental
        if (!numeroSecuenciasMap.has(sec)) {
          numeroSecuenciasMap.set(sec, numeroIncremental++);
        }
      }
    }
  
    return numeroSecuenciasMap.get(secuencia)!;
  }


  @Input() nuevo:any;
  @Input() producto!:Producto_
  @Input() sustratos_nombres:any
  @Input() tinta_nombres:any
  @Input() barniz_nombres:any
  @Input() impresoras_nombre:any
  @Input() fuentes_nombres:any
  @Input() troqueladora_nombres:any
  @Input() guillotina_nombres:any
  @Input() pegadora_nombres:any
  @Input() pega_nombres:any
  @Input() cajas_nombres:any
  @Input() caja_nombre:any;
  @Output() onCloseModal = new EventEmitter()

  public loading = false;

  sustrato_selected = '';
  maquina_selected = '';
  troqueladora_selected = '';
  guillotina_selected = '';
  pegadora_selected = '';
  solucion_selected = '';
  caja_selected = ''; 
  tinta_selected = {
    tinta:'',
    cantidad:0
  }
  barniz_selected = {
    barniz:'',
    cantidad:0
  }
  pegamento_selected = {
    pega:'',
    cantidad:0
  }

  seleccion_tinta = false;

  


  style: any = {};
  longitud = 0
  altura = 0
  ejemplares = 0
  margenTop = 0
  margenRight = 0
  margenBottom = 0
  margenLeft = 0

  B_style: any = {};
  B_longitud = 0
  B_altura = 0
  B_ejemplares = 0
  B_margenTop = 0
  B_margenRight = 0
  B_margenBottom = 0
  B_margenLeft = 0

  Producto_imag = 'no-image';
  Embalaje_Aereo = 'no-image';
  Embalaje_3d = 'no-image';
  paletizado = 'no-image';

  cards = [
    {title: 'Identificación del producto', content: 'Contenido 1'},
    {title: 'Dimensiones del producto', content: 'Contenido 1'},
    {title: 'Materia prima', content: 'Contenido 1'},
    {title: 'Películas del producto', content: 'Contentido'},
    {title: 'Pre-impresión', content: 'Contenido 1'},
    {title: 'Impresión', content: 'Contenido 1'},
    {title: 'Post-impresión', content: 'Contenido 1'},
    {title: 'Post-impresión', content: 'Contenido 1'},
    {title: 'Post-impresión', content: 'Contenido 1'},
    // Agrega más tarjetas según sea necesario
  ];
  currentIndex = 0;

  detalle:boolean = false;

  detalles = {
    modal_sustrato:false,
    modal_tintas:false,
    modal_barniz:false,
    modal_impresora:false,
    modal_fuente:false,
    modal_troqueladora:false,
    modal_guillotina:false,
    modal_pegadora:false,
    modal_pega:false,
    modal_caja:false
  }

  cerrarDetalles(){
    this.detalle = false;
    this.detalles = {
      modal_sustrato:false,
      modal_tintas:false,
      modal_barniz:false,
      modal_impresora:false,
      modal_fuente:false,
      modal_troqueladora:false,
      modal_guillotina:false,
      modal_pegadora:false,
      modal_pega:false,
      modal_caja:false
    }
  }

  openImage(imageName,imageAlt){
    Swal.fire({
      showConfirmButton:false,
      imageUrl: `https://192.168.0.22/api/imagen/producto/${imageName}`,
      imageAlt: imageAlt
    });
  }

  
  subirImagen(e,n){
    let image = (e.target).files[0]
    let tipo = ''
    switch(n){
      case 0:
        tipo = 'PRODUCTO'
      break;
      case 1:
        tipo = 'EMBALAJE_AEREO'
      break;
      case 2:
        tipo = 'EMBALAJE_3D'
      break;
      case 3:
        tipo = 'PELETIZADO'
      break;
    }

    this.uploadImage.actualizarFoto(image, 'producto', tipo)
      .then(img =>{

          switch(n){
            case 0:
              this.Producto_imag = img;
              this.producto.dimensiones.diseno = img;
            break;
            case 1:
              this.Embalaje_Aereo = img;
              this.producto.post_impresion.distribucion.aerea  = img
            break;
            case 2:
              this.Embalaje_3d = img;
              this.producto.post_impresion.distribucion.v3d  = img
            break;
            case 3:
              this.paletizado = img;
              this.producto.post_impresion.distribucion.paletizado  = img
            break;
          }
      })
  }  

  public index_tinta;
  showDetail(tipo, index?){
    console.log('Mostrar Detalles')
    this.detalle = true;
    if(tipo in this.detalles){
      this.detalles[tipo] = true
      this.index_tinta = index;
    }
  }

  cerrar(){
    this.onCloseModal.emit()
  }

  guardar(){
    this.loading = true;
    this.producto.pre_impresion.pelicula = this.SecuenciaDeColores;
    this.api.GuardarProducto(this.producto)
    setTimeout(() => {
      Swal.fire({
        text:this.api.mensaje.mensaje,
        icon:this.api.mensaje.icon,
        toast:true,
        position:'top-end',
        timer:5000,
        timerProgressBar:true,
        showConfirmButton:false
      })
      this.loading = false
      this.onCloseModal.emit();
    }, 1000);
  }

  crearModelo(){
  }
  //   this.style = {
  //     'width': `200px`,
  //     'height': `130px`,
  //     'background': 'rgb(161, 242, 216);',
  //     'display': 'grid',
  //     'grid-template-columns': `repeat(${Math.sqrt(this.ejemplares)}, 1fr)`,
  //     'grid-template-rows': `repeat(${Math.sqrt(this.ejemplares)}, 1fr)`,
  //     'margin': `${Number(this.producto.pre_impresion.tamano_sustrato.margenes[0].superior) * 2}px ${Number(this.producto.pre_impresion.tamano_sustrato.margenes[0].derecho) * 2}px ${Number(this.producto.pre_impresion.tamano_sustrato.margenes[0].inferior) * 2}px ${Number(this.producto.pre_impresion.tamano_sustrato.margenes[0].izquierdo) * 2}px`,
  //   }

  //   this.B_style = {
  //     'width': `200px`,
  //     'height': `130px`,
  //     'background': 'rgb(161, 242, 216);',
  //     'display': 'grid',
  //     'grid-template-columns': `repeat(${Math.sqrt(this.B_ejemplares)}, 1fr)`,
  //     'grid-template-rows': `repeat(${Math.sqrt(this.B_ejemplares)}, 1fr)`,
  //     'margin': `${Number(this.producto.pre_impresion.tamano_sustrato.margenes[1].superior) * 2}px ${Number(this.producto.pre_impresion.tamano_sustrato.margenes[1].derecho) * 2}px ${Number(this.producto.pre_impresion.tamano_sustrato.margenes[1].inferior) * 2}px ${Number(this.producto.pre_impresion.tamano_sustrato.margenes[1].izquierdo) * 2}px`,
  //   }
  // }

  previous() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  next() {
    if (this.currentIndex < this.cards.length - 1) {
      this.currentIndex++;
    }
  }

  notificar(){
    if(!this.seleccion_tinta){
      Swal.fire({
        icon:'info',
        title:'Cuidado con el orden',
        text:'El registro de la tintas se debe realizar en el orden en que fueron coodificadas las peliculas',
        confirmButtonText:'DE ACUERDO',
        confirmButtonColor:'#48c78e'
      })
      this.seleccion_tinta = true;
    }
  }

  add_sustrato(){
    let splited = this.sustrato_selected.split('&')

    // Verificar si el sustrato seleccionado no existe en el array antes de agregarlo
    if (!this.producto.materia_prima.sustrato.includes(splited[0])) {
        this.producto.materia_prima.sustrato.push(splited[0]);
        this.sustratos_nombres.push(splited[1])
    } else {
        // Si el sustrato ya existe, puedes mostrar un mensaje de error o simplemente no hacer nada
        console.log('El sustrato ya está en la lista.');
    }

    // Reiniciar la variable sustrato_selected
    this.sustrato_selected = '';
  }

  maquina_impresora(){
    let splited = this.maquina_selected.split('&')
    if (!this.producto.impresion.impresoras.includes(splited[0])) {
      this.producto.impresion.impresoras.push(splited[0]);
      this.impresoras_nombre.push(splited[1])
      if (this.producto.impresion.impresoras.length > 1) {
        console.log(this.producto.impresion.secuencia[0])
        let colores__ = this.producto.impresion.secuencia[0].slice();
        this.producto.impresion.secuencia.push(colores__);
    }
    }
    console.log(this.producto.impresion.secuencia)
    this.maquina_selected = ''
  }

  maquina_troqueladora(){
    let splited = this.troqueladora_selected.split('&')
    if (!this.producto.post_impresion.troqueladora.includes(splited[0])) {
      this.producto.post_impresion.troqueladora.push(splited[0]);
      this.troqueladora_nombres.push(splited[1])
    }

    this.troqueladora_selected = ''
  }

  maquina_guillotina(){
    let splited = this.guillotina_selected.split('&')
    if (!this.producto.post_impresion.guillotina.includes(splited[0])) {
      this.producto.post_impresion.guillotina.push(splited[0]);
      this.guillotina_nombres.push(splited[1])
    }

    this.guillotina_selected = ''
  }

  maquina_pegadora(){
    let splited = this.pegadora_selected.split('&')
    if (!this.producto.post_impresion.pegadora.includes(splited[0])) {
      this.producto.post_impresion.pegadora.push(splited[0]);
      this.pegadora_nombres.push(splited[1])
    }

    this.pegadora_selected = ''
  }

  otros_nombre:any = [] 
  otros_(){
    let splited = this.otros_selectec.split('&')
    if (!this.producto.post_impresion.otros.includes(splited[0])) {
      this.producto.post_impresion.otros.push(splited[0]);
      this.otros_nombre.push(splited[1])
    }

    this.otros_selectec = ''
  }

  Solucion_fuente(){
    let splited = this.solucion_selected.split('&')
    if (!this.producto.impresion.fuentes.includes(splited[0])) {
      this.producto.impresion.fuentes.push(splited[0]);
      this.fuentes_nombres.push(splited[1])
    }

    this.solucion_selected = ''
  }

  add_tinta(){
    let splited = this.tinta_selected.tinta.split('&')
    // Verificar si la tinta seleccionada no existe en el array antes de agregarla
    const tintaExistente = this.producto.materia_prima.tintas.find(tinta => tinta.tinta === splited[0]);

    if (!tintaExistente) {
        this.producto.materia_prima.tintas.push({ tinta: splited[0], cantidad: this.tinta_selected.cantidad });
        this.tinta_nombres.push(splited[1])
    } else {
        // Si la tinta ya existe, puedes mostrar un mensaje de error o simplemente no hacer nada
        console.log('La tinta ya está en la lista.');
  }

  switch (splited[2]) {
    case 'A':
        splited[2] = 'Amarillo';
        break;
    case 'C':
        splited[2] = 'Cyan';
        break;
    case 'M':
        splited[2] = 'Magenta';
        break;
    case 'K':
        splited[2] = 'Negro';
        break;
    default:
        splited[2] = splited[3];
}

    let colorExiste = this.producto.impresion.secuencia[0].find(x => x === splited[2])
    if(!colorExiste){
      this.producto.impresion.secuencia[0].push(splited[2])
    }

  // Reiniciar las propiedades de la variable tinta_selected
  this.tinta_selected.cantidad = 0;
  this.tinta_selected.tinta = '';
  }


  public SecuenciaDeColores:any = []
  onCheckboxChange(event: Event, color:string, index): void {
    const inputElement = event.target as HTMLInputElement; // Convierte el target en un elemento de tipo input
    const isChecked = inputElement.checked; // Verifica si el checkbox está seleccionado o no
    console.log('Checkbox is checked:', isChecked); // Imprime true o false
    if(isChecked){
      if(!this.SecuenciaDeColores[index]){
        this.SecuenciaDeColores[index] = {color:color}
        this.producto.impresion.secuencia[0][index] = color
        console.log( this.producto.impresion.secuencia)
      }
    }else{
      // Si el checkbox no está marcado, elimina el color
      const index = this.SecuenciaDeColores.findIndex(s => s.color === color);
      console.log(index)
      if (index > -1) {
        this.SecuenciaDeColores.splice(index, 1); // Elimina el color del array
        this.producto.impresion.secuencia.splice(index, 1); // Elimina el color del array
        this.producto.impresion.secuencia[0].splice(index, 1);
        console.log(this.SecuenciaDeColores)
      }
    }
  }

  BuscarEnSecuencia(color: string): boolean {
    if (color.length > 0) {
      return this.SecuenciaDeColores.some(s => s && s.color === color);
      // "some" devuelve true si encuentra un elemento que cumple con la condición
    } else {
      return false;
    }
  }

  AnadirPantone(event: any): void {
    const index = +event.target.dataset.index; // Obtén el índice del Pantone desde el atributo data-index
    const color = event.target.value;

    if(color){
      if (this.SecuenciaDeColores[index]) {
        // Si ya existe un Pantone en esa posición, actualízalo
        this.SecuenciaDeColores[index].color = color;
        this.producto.impresion.secuencia[0][index] = color
      } else {
        // Si no existe, añade uno nuevo
        this.SecuenciaDeColores[index] = { color: color };
        this.producto.impresion.secuencia[0][index] = color
      }
    }else{
      this.SecuenciaDeColores[index] = undefined
    }
  
  }


  AddTintas(color, cantidad,index){
    console.log(color)
    let colores = color.split('&')

    if(!this.SecuenciaDeColores[index].tintas){
      this.SecuenciaDeColores[index].tintas = []
    }

    this.SecuenciaDeColores[index].tintas.push(
      {
        tinta:colores[0],
        nombre:colores[1],
        cantidad:cantidad
      }
    )

    console.log(this.SecuenciaDeColores)
  }



  borrarSecuencia(i){
    Swal.fire({
      title: "¿Seguro que quieres eliminar este color de la secuencia?",
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "Eliminar",
      denyButtonText: `Mantener`,
      confirmButtonColor:'#f03a5f',
      denyButtonColor:'#48c78e'
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        this.producto.impresion.secuencia[0].splice(i, 1)
      } else if (result.isDenied) {
        // Swal.fire("Changes are not saved", "", "info");
        return
      }
    });
  }

  add_barniz(){
    let splited = this.barniz_selected.barniz.split('&');
    // Verificar si la tinta seleccionada no existe en el array antes de agregarla
    const barnizExistente = this.producto.materia_prima.barnices.find(barniz => barniz.barniz === splited[0]);

    if (!barnizExistente) {
        this.producto.materia_prima.barnices.push({ barniz: splited[0], cantidad: this.barniz_selected.cantidad });
        this.barniz_nombres.push(splited[1])
    } else {
        // Si la tinta ya existe, puedes mostrar un mensaje de error o simplemente no hacer nada
        console.log('El barniz ya está en la lista.');
  }
    // Reiniciar las propiedades de la variable tinta_selected
    this.barniz_selected.cantidad = 0;
    this.barniz_selected.barniz = '';
  }

  convert(n){
    return String.fromCharCode(65 + n)
  }

  add_pegamento(){

    let splited = this.pegamento_selected.pega.split('&')
    // Verificar si la tinta seleccionada no existe en el array antes de agregarla
    const pegamentoExistente = this.producto.post_impresion.pegamento.find(pegamento => pegamento.pega === splited[0]);

    if (!pegamentoExistente) {
        this.producto.post_impresion.pegamento.push({ pega: splited[0], cantidad: this.pegamento_selected.cantidad });
        this.pega_nombres.push(splited[1])
    } else {
        // Si la tinta ya existe, puedes mostrar un mensaje de error o simplemente no hacer nada
        console.log('El pegamento ya está en la lista.');
  }
    // Reiniciar las propiedades de la variable tinta_selected
    this.pegamento_selected.cantidad = 0;
    this.pegamento_selected.pega = '';
  }

  add_caja(){
    let splited = this.caja_selected.split('&')
    this.producto.post_impresion.caja.nombre = splited[1];
    this.caja_nombre = splited[1]
  }

  Impresion_(maquina, fase_) {
    let incluye
    if(fase_ === 'Otro'){
      incluye = maquina.fases.some(fase => fase.nombre != 'Impresión' && fase.nombre != 'Impresion 2 pase' && fase.nombre != 'Barnizar'
        && fase.nombre != 'Troquelado' && fase.nombre != 'Cortado' && fase.nombre != 'Pegado' 
      );
    }else{
      incluye = maquina.fases.some(fase => fase.nombre === fase_);
    }
    return incluye;
  }

  especificacion(){
    let data = '';


    async function generarPDF(){

      let Sustratos = ['Cartón Rev. Gris']
      let tintas = ['Barniz S/Impreción (Olin) 0.5kg', 'Barniz S/Impresión (Huber) 0.5kg']
      let capacidad = [100, 95, 100, 95]
      
      let Carton = [
        {
          marca:'MCM',
          ubicacion:[{
            molino:'M1',
            especificacion:{
              calibre:[[15.5, 16, 16.5],[18.5,19,19.5]],
              gramaje:[[250,300,320],[320, 350,365]],
            }
          },{
            molino:'M2',
            especificacion:{
              calibre:[[15, 16, 17],[18,19,20]],
              gramaje:[[230,300,330],[330, 350,360]],
            }
          }]
        },
        {
          marca:'Papirus',
          ubicacion:[{
            molino:'M1',
            especificacion:{
              calibre:[[15.9, 16.2, 17.1],[18.5,19.2,19.9]],
              gramaje:[[230,310,328],[325, 351,366]],
            }
          }]
        },
        {
          marca:'Vitabianco',
          ubicacion:[{
            molino:'M1',
            especificacion:{
              calibre:[[15.8, 16.1, 17.8],[18.3,19.2,19.1]],
              gramaje:[[230,310,328],[323, 348,365.2]],
            }
          }]
        }
      ]

      let Colores = [
        {
          color:'Amarillo',
          tinta:['Amarillo Proceso', 'Amarillo Cofre', 'Amarillo Proceso'],
          serie:['Apache', 'Resista', 'Ecoprint'],
          marca:['Olín','Huber','M.A'],
          consumo:[0.5, 0.5, 0.9]
        },
        {
          color:'Cyan',
          tinta:['Azul Proceso', 'Azul Cofre', 'Azul Proceso'],
          serie:['Apache', 'Ecoprint', 'Resista'],
          marca:['Olín','M.A','Huber'],
          consumo:[0.3, 0.3, 0.2]
        },
        {
          color:'P-222',
          tinta:['Vinotinto', 'Vinotinto',],
          serie:['Apache', 'Resista'],
          marca:['Olín','Huber'],
          consumo:[1.2, 1.2],
          preparacion:tintas
        },
      ]


      let formulas = [
        ['- Rojo proceso (Olin) 0.5kg', '- Amarillo proceso Apache (Olin) 0.3kg', '- Negro intenso (Olin) 0.1kg'],
        ['- Rojo proceso (Huber) 0.7kg', '- Amarillo proceso Apache (Olin) 0.2kg', '- Negro proceso Apache (Olin) 0.1kg']
      ]

      let formulas_ = [{
        color:'Rojo Fuego',
        formulas: [
          ['Rojo proceso (Olin) 0.5kg', 'Amarillo proceso Apache (Olin) 0.3kg', 'Negro intenso (Olin) 0.1kg'],
          ['Rojo proceso (Huber) 0.7kg', 'Amarillo proceso Apache (Olin) 0.2kg', 'Negro proceso Apache (Olin) 0.1kg']
        ]
      },
      {
        color:'P-222',
        formulas: [
          ['Rojo proceso (Olin) 0.5kg', 'Amarillo proceso Apache (Olin) 0.3kg', 'Negro intenso (Olin) 0.1kg'],
          ['Rojo proceso (Huber) 0.7kg', 'Amarillo proceso Apache (Olin) 0.2kg', 'Negro proceso Apache (Olin) 0.1kg']
        ]
      }]
      let rojoFuego1 = ['- Rojo proceso (Olin) 0.5kg', '- Amarillo proceso Apache (Olin) 0.3kg', '- Negro intenso (Olin) 0.1kg']
      let rojoFuego2 = ['- Rojo proceso (Huber) 0.7kg', '- Amarillo proceso Apache (Olin) 0.2kg', '- Negro proceso Apache (Olin) 0.1kg']

      let PeliculasA = ['Pelicula N°1: Cyan:AH-001-1- A -2','Pelicula N°2: Magenta:AH-001-1- A -3','Pelicula N°3: Negro:AH-001-1- A -1','Pelicula N°4: Amarillo:AH-001-1- A -4']
      let PeliculasB = ['Pelicula N°1: Cyan:AH-001-1- B -2','Pelicula N°2: Magenta:AH-001-1- B -3','Pelicula N°3: Negro:AH-001-1- B -1','Pelicula N°4: Amarillo:AH-001-1- B -4']
      let impresoras = ['Roland 700 - (13)', 'Roland Rekord (4C) - (14)']
      let impresoras_ = ['Roland 700', 'Roland Rekord (4C)']

      const pdf = new PdfMakeWrapper();
      PdfMakeWrapper.setFonts(pdfFonts);
      pdf.pageOrientation('portrait');
      pdf.pageSize('A4');

      pdf.add(
        new Table([
          [
            new Cell(await new Img('../../assets/poli_cintillo.png').width(85).margin([0, 10,0,0]).build()).alignment('center').rowSpan(4).end,
            new Cell(new Txt(`FORMATO 
            ESPECIFICACIÓN DE 
            PRODUCTO`).bold().end).alignment('center').margin([0, 10,0,0]).fontSize(13).rowSpan(4).end,
            new Cell(new Txt('Código: FRP-007').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('N° de Revisión: 1').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Fecha: 20/06/2023').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Página: 2 de 2').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
        ]).widths(['25%','50%','25%']).end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end
          ]
        ]).widths(['100%']).end
      )



      pdf.add(
        new Table([
          [
            new Cell(new Txt('').end).border([false]).end,
            new Cell(new Txt('Código de especificación').bold().end).fillColor('#000000').color('#FFFFFF').alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).border([false]).end,
            new Cell(new Txt(`E-AA-000-0-00`).bold().end).fontSize(15).alignment('center').end,
          ],
        ]).widths(['70%','30%']).end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end
          ]
        ]).widths(['100%']).end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('1. Identificación del producto').bold().end).bold().color('#FFFFFF').fillColor('#000000').colSpan(2).end,
            new Cell(new Txt('').end).end,
          ],
          [
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end,
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end
          ],
          [
            new Cell(new Txt('1.1 Cliente').end).fillColor('#dedede').bold().border([false]).end,
            new Cell(new Txt('Alimentos Heinz, C.A').end).border([false]).end,
          ],
          [
            new Cell(new Txt('1.2 Producto').end).fillColor('#dedede').bold().border([false]).end,
            new Cell(new Txt('Est. Gelatina Sonrissa Uva 66g').end).border([false]).end,
          ],
          [
            new Cell(new Txt('1.3 Código del producto').end).fillColor('#dedede').bold().border([false]).end,
            new Cell(new Txt('AH-001-1').end).border([false]).end,
          ]
        ]).widths(['30%','70%']).end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end
          ]
        ]).widths(['100%']).end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('2. Dimensiones del producto').bold().end).bold().color('#FFFFFF').fillColor('#000000').colSpan(2).end,
            new Cell(new Txt('').end).end,
          ],
          [
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end,
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end
          ],
          [
            new Cell(new Txt('2.1 Tamaño del producto desplegado (mm)').end).fillColor('#dedede').bold().border([false]).end,
            new Cell(new Txt('225.5 x 150.5 ± 1').end).border([false]).end,
          ],
          [
            new Cell(new Txt('2.1 Tamaño del producto cerrado (mm)').end).fillColor('#dedede').bold().border([false]).end,
            new Cell(new Txt('79 x 100 x 29 ± 1').end).border([false]).end,
          ]
        ]).widths(['55%','45%']).end
      )

      // pdf.add(
      //   new Table([
      //     [
      //       new Cell(new Txt(' ').end).border([false]).fontSize(1).end
      //     ]
      //   ]).widths(['100%']).end
      // )

      // PRODUCTO_2_4_2024_15_34_19_84.png

      pdf.add(
        new Table([
          [
            new Cell(new Txt('2.3 Diseño del producto').end).fillColor('#dedede').bold().border([false]).end,
  
          ],
          [
            new Cell(await new Img('https://192.168.0.22/api/imagen/producto/PRODUCTO_2_4_2024_15_42_39_494.png').width(450).margin([0, 15]).build()).alignment('center').border([false]).pageBreak('after').end,
          ]
        ]).widths(['100%']).end
      )


      // PAGINA 2 ******************************************
      pdf.add(
        new Table([
          [
            new Cell(await new Img('../../assets/poli_cintillo.png').width(85).margin([0, 10,0,0]).build()).alignment('center').rowSpan(4).end,
            new Cell(new Txt(`FORMATO 
            ESPECIFICACIÓN DE 
            PRODUCTO`).bold().end).alignment('center').margin([0, 10,0,0]).fontSize(13).rowSpan(4).end,
            new Cell(new Txt('Código: FRP-007').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('N° de Revisión: 1').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Fecha: 20/06/2023').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Página: 2 de 2').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
        ]).widths(['25%','50%','25%']).end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end
          ]
        ]).widths(['100%']).end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('3. Materia prima').bold().end).bold().color('#FFFFFF').fillColor('#000000').end,
          ],
          [
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end,
          ],
          [
            new Cell(new Txt('3.1 Tipo de sustrato a utilizar').end).fillColor('#dedede').bold().border([false]).end,
          ],
          [
            new Cell(new Stack(Sustratos).end).border([false]).end,
          ],
          [
            new Cell(new Txt('3.2 Propiedades').end).fillColor('#dedede').bold().border([false]).end,
          ],
          [
            new Cell(
              new Table([
                [
                  new Cell(new Txt('Marca').end).alignment('center').fillColor('#f1f1f1').rowSpan(2).margin([0,10,0,0]).bold().border([false]).end,
                  new Cell(new Txt('Ubicación').end).alignment('center').fillColor('#f1f1f1').rowSpan(2).margin([0,10,0,0]).bold().border([false]).end,
                  new Cell(new Txt('Calibre (pt)').end).alignment('center').fillColor('#f1f1f1').bold().border([false]).end,
                  new Cell(new Txt('Gramaje (g/m²)').end).alignment('center').fillColor('#f1f1f1').bold().border([false]).end,
                ],
                [
                  new Cell(new Txt('').end).fillColor('#f1f1f1').bold().border([false]).end,
                  new Cell(new Txt('').end).fillColor('#f1f1f1').bold().border([false]).end,
                  new Cell(new Table([
                    [
                      new Cell(new Txt('Mín.').end).alignment('center').border([false]).end,
                      new Cell(new Txt('Nóm.').end).alignment('center').border([false]).end,
                      new Cell(new Txt('Máx.').end).alignment('center').border([false]).end
                    ]
                  ]).widths(['33.3%','33.3%','33.3%']).end).fillColor('#c9c9c9').bold().border([false]).end,
                  new Cell(new Table([
                    [
                      new Cell(new Txt('Mín.').end).alignment('center').border([false]).end,
                      new Cell(new Txt('Nóm.').end).alignment('center').border([false]).end,
                      new Cell(new Txt('Máx.').end).alignment('center').border([false]).end
                    ]
                  ]).widths(['33.3%','33.3%','33.3%']).end).fillColor('#c9c9c9').bold().border([false]).end,
                ]
              ]).widths(['20%','20%','30%','30%']).end
            ).border([false]).end
          ],
        ]).widths(['100%']).end
      )
      for(let i=0;i<Carton.length;i++){
        for(let n=0;n<Carton[i].ubicacion.length;n++){
          for(let c=0;c<Carton[i].ubicacion[n].especificacion.calibre.length;c++){
            pdf.add(
              new Table([
                [
                  new Cell(new Txt(Carton[i].marca).end).bold().border([false]).alignment('center').end,
                  new Cell(new Txt(Carton[i].ubicacion[n].molino).end).bold().border([false]).alignment('center').end,
                  new Cell(
                    new Table([
                      [
                        new Cell(new Txt(Carton[i].ubicacion[n].especificacion.calibre[c][0].toString()).end).border([false]).alignment('center').end,
                        new Cell(new Txt(Carton[i].ubicacion[n].especificacion.calibre[c][1].toString()).end).border([false]).alignment('center').end,
                        new Cell(new Txt(Carton[i].ubicacion[n].especificacion.calibre[c][2].toString()).end).border([false]).alignment('center').end
                      ]
                    ]).widths(['33.3%','33.3%','33.3%']).end
                    ).bold().border([false]).end,
                  new Cell(
                    new Table([
                      [
                        new Cell(new Txt(Carton[i].ubicacion[n].especificacion.gramaje[c][0].toString()).end).border([false]).alignment('center').end,
                        new Cell(new Txt(Carton[i].ubicacion[n].especificacion.gramaje[c][1].toString()).end).border([false]).alignment('center').end,
                        new Cell(new Txt(Carton[i].ubicacion[n].especificacion.gramaje[c][2].toString()).end).border([false]).alignment('center').end
                      ]
                    ]).widths(['33.3%','33.3%','33.3%']).end
                  ).bold().border([false]).end,
                ]
              ]).widths(['20%','19%','30%','30%']).margin([5,0,0,0]).end
            )
          }
        }
      }
      // PAGINA 3 ***************************************
      pdf.add(
        new Table([
          [
            new Cell(await new Img('../../assets/poli_cintillo.png').width(85).margin([0, 10,0,0]).build()).alignment('center').rowSpan(4).end,
            new Cell(new Txt(`FORMATO 
            ESPECIFICACIÓN DE 
            PRODUCTO`).bold().end).alignment('center').margin([0, 10,0,0]).fontSize(13).rowSpan(4).end,
            new Cell(new Txt('Código: FRP-007').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('N° de Revisión: 1').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Fecha: 20/06/2023').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Página: 2 de 2').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
        ]).widths(['25%','50%','25%']).pageBreak('before').end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end
          ]
        ]).widths(['100%']).end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('3.4 Tintas aprobadas').end).colSpan(5).fillColor('#dedede').bold().border([false,false,false,false]).end,
            new Cell(new Txt('Color').end).fillColor('#c9c9c9').border([false]).end,
            new Cell(new Txt('Color').end).fillColor('#c9c9c9').border([false]).end,
            new Cell(new Txt('Color').end).fillColor('#c9c9c9').border([false]).end,
            new Cell(new Txt('Color').end).fillColor('#c9c9c9').border([false]).end,
          ],
        ]).widths(['20%','20%','20%','20%','20%']).end
      )

      pdf.add('\n')

      for(let i=0;i<Colores.length;i++){
          if(Colores[i].preparacion){
            pdf.add(
              new Table([
                [
                  new Cell(new Txt(Colores[i].color).end).decoration('underline').decorationStyle('dotted').linkToPage(9).bold().fillColor('#c9c9c9').border([false]).end,
                ]
              ]).widths(['100%']).end
            )
          }else{
            pdf.add(
              new Table([
                [
                  new Cell(new Txt(Colores[i].color).end).bold().fillColor('#c9c9c9').border([false]).end,
                ]
              ]).widths(['100%']).end
            )
          }
        for(let n=0;n<Colores[i].tinta.length;n++){
          if(n === 0){
            pdf.add(
              new Table([
                [
                  new Cell(new Txt('Nombre').end).bold().fillColor('#f1f1f1').border([false]).end,
                  new Cell(new Txt('Serie').end).bold().fillColor('#f1f1f1').border([false]).end,
                  new Cell(new Txt('Marca').end).bold().fillColor('#f1f1f1').border([false]).end,
                  new Cell(new Txt('Consumo (kg)').end).bold().fillColor('#f1f1f1').border([false]).end
                ],
              ]).widths(['25%','25%','25%','25%']).end
            )
          }
          pdf.add(
            new Table([
              [
                new Cell(new Txt(Colores[i].tinta[n]).end).border([false]).end,
                new Cell(new Txt(Colores[i].serie[n]).end).border([false]).end,
                new Cell(new Txt(Colores[i].marca[n]).end).border([false]).end,
                new Cell(new Txt(Colores[i].consumo[n].toString()).end).border([false]).end,
              ]
            ]).widths(['25%','25%','25%','25%']).end
          )
        }
      }

      // PAGINA 4 ******************************
      pdf.add(
        new Table([
          [
            new Cell(await new Img('../../assets/poli_cintillo.png').width(85).margin([0, 10,0,0]).build()).alignment('center').rowSpan(4).end,
            new Cell(new Txt(`FORMATO 
            ESPECIFICACIÓN DE 
            PRODUCTO`).bold().end).alignment('center').margin([0, 10,0,0]).fontSize(13).rowSpan(4).end,
            new Cell(new Txt('Código: FRP-007').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('N° de Revisión: 1').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Fecha: 20/06/2023').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Página: 2 de 2').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
        ]).widths(['25%','50%','25%']).pageBreak('before').end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end
          ]
        ]).widths(['100%']).end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('3.5 Barnices aprobados').end).colSpan(5).fillColor('#dedede').bold().border([false,false,false,false]).end,
            new Cell(new Txt('Color').end).fillColor('#c9c9c9').border([false]).end,
            new Cell(new Txt('Color').end).fillColor('#c9c9c9').border([false]).end,
            new Cell(new Txt('Color').end).fillColor('#c9c9c9').border([false]).end,
            new Cell(new Txt('Color').end).fillColor('#c9c9c9').border([false]).end,
          ],
        ]).widths(['20%','20%','20%','20%','20%']).end
      )

      pdf.add(
        new Ul(tintas).end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end,
          ],
          [
            new Cell(new Txt('4. Pre-impresión').bold().end).bold().color('#FFFFFF').fillColor('#000000').end,
          ],
          [
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end,
          ],
          [
            new Cell(new Txt('4.1 Nombre del archivo del diseño del producto').end).fillColor('#dedede').bold().border([false,false,false,false]).end,
          ],
          [
            new Cell(new Txt('AD-AH-001-1_17012023.ai').end).border([false]).end
          ],
          [
            new Cell(new Txt('4.2 Código del montaje').end).fillColor('#dedede').bold().border([false,false,false,false]).end,
          ],
          [
            new Cell(
              new Columns(
                [
                  new Txt('Montaje A').bold().end,
                  new Txt('Montaje B').bold().end
                ]
              ).end
            ).border([false]).end
          ],
          [
            new Cell(
              new Columns(
                [
                  new Txt('M-AH-001-1-A').end,
                  new Txt('M-AH-001-1-B').end
                ]
              ).end
            ).border([false]).end
          ],
          [
            new Cell(new Txt('4.3 Nombre del archivo del montaje del producto').end).fillColor('#dedede').bold().border([false,false,false,false]).end,
          ],
          [
            new Cell(
              new Columns(
                [
                  new Txt('M-AH-001-1-A_14062023.ai').end,
                  new Txt('M-AH-001-1-B_28062023.ai').end
                ]
              ).end
            ).border([false]).end
          ],
          [
            new Cell(new Txt('4.4 Código de películas').end).fillColor('#dedede').bold().border([false,false,false,false]).end,
          ],
          [
            new Cell(
              new Columns(
                [
                  new Ul(PeliculasA).end,
                  new Ul(PeliculasB).end
                ]
              ).end
            ).border([false]).end
          ],
          
          [
            new Cell(new Txt('4.5 Tamaño de sustrato a imprimir / Cantidad de ejemplares').end).fillColor('#dedede').bold().border([false,false,false,false]).end,
          ],
          [
            new Cell(
              new Columns(
                [
                  new Txt('95 x 70 cm').end,
                  new Txt('64 x 93 cm').end
                ]
              ).end
            ).border([false]).end
          ],
          [
            new Cell(
              new Columns(
                [
                  new Txt('18 Ejemplares').end,
                  new Txt('16 Ejemplares').end
                ]
              ).end
            ).border([false]).end
          ],
          [
            new Cell(new Txt('4.6 Márgenes (Inf. Sup. Der. Izq.)').end).fillColor('#dedede').bold().border([false,false,false,false]).end,
          ],
          [
            new Cell(
              new Columns(
                [
                  new Txt('1.5cm x 1cm x 1cm x 1cm').end,
                  new Txt('1.5cm x 1cm x 1cm x 1cm').end
                ]
              ).end
            ).border([false]).end
          ],
          [
            new Cell(new Txt('4.7 Área efectiva de impresión (cm²):').end).fillColor('#dedede').bold().border([false,false,false,false]).end,
          ],
          [
            new Cell(
              new Columns(
                [
                  new Txt('6262').end,
                  new Txt('5452.1').end
                ]
              ).end
            ).border([false]).end
          ],
          [
            new Cell(new Txt('4.8 Porcentaje de desperdicio (%):').end).fillColor('#dedede').bold().border([false,false,false,false]).end,
          ],
          [
            new Cell(
              new Columns(
                [
                  new Txt('6.20').end,
                  new Txt('9.17').end
                ]
              ).end
            ).border([false]).end
          ],
          [
            new Cell(new Txt('4.9 Plancha').end).fillColor('#dedede').bold().border([false,false,false,false]).end,
          ],
          [
            new Cell(
              new Table([
                [
                  new Cell(new Txt('Tipo').bold().end).fillColor('#f1f1f1').border([false]).end,
                  new Cell(new Txt('Marca').bold().end).fillColor('#f1f1f1').border([false]).end,
                  new Cell(new Txt('Tiempo de exposición (s)').bold().end).fillColor('#f1f1f1').border([false]).end
                ],
                [
                  new Cell(new Txt('Positiva').end).border([false]).end,
                  new Cell(new Txt('N/D').end).border([false]).end,
                  new Cell(new Txt('30 (54,79)').end).border([false]).end
                ]
              ]).widths(['45%','25%','30%']).end
            ).border([false]).end
          ]

        ]).widths(['100%']).end
      )

      // PAGINA 4 **************************************
      pdf.add(
        new Table([
          [
            new Cell(await new Img('../../assets/poli_cintillo.png').width(85).margin([0, 10,0,0]).build()).alignment('center').rowSpan(4).end,
            new Cell(new Txt(`FORMATO 
            ESPECIFICACIÓN DE 
            PRODUCTO`).bold().end).alignment('center').margin([0, 10,0,0]).fontSize(13).rowSpan(4).end,
            new Cell(new Txt('Código: FRP-007').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('N° de Revisión: 1').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Fecha: 20/06/2023').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Página: 2 de 2').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
        ]).widths(['25%','50%','25%']).pageBreak('before').end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end
          ]
        ]).widths(['100%']).end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('5. Impresión').bold().end).bold().color('#FFFFFF').fillColor('#000000').end,
          ],
          [
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end,
          ],
          [
            new Cell(new Txt('5.1 Impresora(s) aprobada(s) - (tamaño de pinza de impresión (mm))').end).fillColor('#dedede').bold().border([false,false,false,false]).end,
          ],
          [
            new Cell(new Ul(impresoras).end).border([false]).end
          ],
          [
            new Cell(new Txt('5.2 Secuencia de colores en máquina').end).fillColor('#dedede').bold().border([false,false,false,false]).end,
          ],
          [
            new Cell(
              new Columns(
                [
                  new Txt(impresoras_[0]).end,
                  new Txt(impresoras_[1]).end
                ],
              ).end
            ).border([false]).end
          ],
          [
            new Cell(
              new Columns(
                [
                  new Ol(['negro','cyan','magenta','amarillo']).end,
                  new Ol(['negro','magenta','cyan','amarillo']).end
                ],
              ).end
            ).border([false]).end
          ],
          [
            new Cell(new Txt('5.3 Solución de fuentes').end).fillColor('#dedede').bold().border([false,false,false,false]).end,
          ],
          [
            new Cell(
              new Table([
                [
                  new Cell(new Txt('Fabricante').bold().end).fillColor('#f1f1f1').border([false]).end,
                  new Cell(new Txt('Descripción').bold().end).fillColor('#f1f1f1').border([false]).end,
                  new Cell(new Txt('Especificación').bold().end).fillColor('#f1f1f1').border([false]).end
                ],
                [
                  new Cell(new Txt('Sun Chemical').end).border([false]).end,
                  new Cell(new Txt('Rycoline 567').end).border([false]).end,
                  new Cell(new Ul(['pH: 4,4 - 5,5', 'Conductividad: 1.500 - 3.500 μS/cm']).end).border([false]).end
                ]
              ]).widths(['33%','33%','34%']).end
            ).border([false]).end
          ],
          [
            new Cell(new Txt('6. Post-impresión').bold().end).bold().color('#FFFFFF').fillColor('#000000').end,
          ],
          [
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end,
          ],
          [
            new Cell(new Txt('6.1 Troqueladora(s) aprobada(s)').end).fillColor('#dedede').bold().border([false,false,false,false]).end,
          ],
          [
            new Cell(new Ul(['Bobst Novacut 106']).end).border([false]).end,
          ],
          [
            new Cell(new Txt('6.2 Canal de hendidura').end).fillColor('#dedede').bold().border([false,false,false,false]).end,
          ],
          [
            new Cell(new Txt('104 x 725 mm').end).border([false]).end,
          ],
          [
            new Cell(new Txt('6.3 Guillotina(s) aprobada(s)').end).fillColor('#dedede').bold().border([false,false,false,false]).end,
          ],
          [
            new Cell(new Ul(['No aplica']).end).border([false]).end,
          ],
          [
            new Cell(new Txt('6.4 Pegadora(s) aprobada(s)').end).fillColor('#dedede').bold().border([false,false,false,false]).end,
          ],
          [
            new Cell(new Ul(['No aplica']).end).border([false]).end,
          ],
          [
            new Cell(new Txt('6.5 Pegamento(s) aprobado(s)').end).fillColor('#dedede').bold().border([false,false,false,false]).end,
          ],
          [
            new Cell(new Ul(['Pega Alta Viscocidad 104 HV 15P', 'Pega Alta Viscocidad 104 HV 15P']).end).border([false]).end,
          ]
        ]).widths(['100%']).end
      )
        // PAGINA 6 ************************************
        pdf.add(
          new Table([
            [
              new Cell(await new Img('../../assets/poli_cintillo.png').width(85).margin([0, 10,0,0]).build()).alignment('center').rowSpan(4).end,
              new Cell(new Txt(`FORMATO 
              ESPECIFICACIÓN DE 
              PRODUCTO`).bold().end).alignment('center').margin([0, 10,0,0]).fontSize(13).rowSpan(4).end,
              new Cell(new Txt('Código: FRP-007').end).fillColor('#dedede').fontSize(9).alignment('center').end,
            ],
            [
              new Cell(new Txt('').end).end,
              new Cell(new Txt('').end).end,
              new Cell(new Txt('N° de Revisión: 1').end).fillColor('#dedede').fontSize(9).alignment('center').end,
            ],
            [
              new Cell(new Txt('').end).end,
              new Cell(new Txt('').end).end,
              new Cell(new Txt('Fecha: 20/06/2023').end).fillColor('#dedede').fontSize(9).alignment('center').end,
            ],
            [
              new Cell(new Txt('').end).end,
              new Cell(new Txt('').end).end,
              new Cell(new Txt('Página: 2 de 2').end).fillColor('#dedede').fontSize(9).alignment('center').end,
            ],
          ]).widths(['25%','50%','25%']).pageBreak('before').end
        )
  
        pdf.add(
          new Table([
            [
              new Cell(new Txt(' ').end).border([false]).fontSize(1).end
            ]
          ]).widths(['100%']).end
        )
        
      pdf.add(
        new Table([
          [
            new Cell(new Txt('6.6 Cajas de embalaje').end).fillColor('#dedede').bold().border([false,false,false,false]).end,
          ],
          [
            new Cell(new Txt('Caja Nº 9').end).border([false]).end,
          ],
        ]).widths(['100%']).end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('Descripción').end).fillColor('#f1f1f1').bold().border([false]).end,
            new Cell(new Txt('Capacidad (Und)').end).fillColor('#f1f1f1').bold().border([false]).end
          ]
        ]).widths(['60%','40%',]).end
      )

      for(let i=0;i<Carton.length;i++){
        for(let n=0;n<Carton[i].ubicacion.length;n++){
          for(let c=0;c<Carton[i].ubicacion[n].especificacion.calibre.length;c++){
            pdf.add(
              new Table([
                [
                  new Cell(new Txt(`Cartón Rev. Gris (${Carton[i].marca})`).end).bold().border([false]).end,
                  new Cell(new Txt(`${capacidad[c].toString()}`).end).bold().border([false]).end
                ]
              ]).widths(['60%','40%',]).end
            )
          }
        }
      }


      // PAGINA 7 **********************************************

      pdf.add(
        new Table([
          [
            new Cell(await new Img('../../assets/poli_cintillo.png').width(85).margin([0, 10,0,0]).build()).alignment('center').rowSpan(4).end,
            new Cell(new Txt(`FORMATO 
            ESPECIFICACIÓN DE 
            PRODUCTO`).bold().end).alignment('center').margin([0, 10,0,0]).fontSize(13).rowSpan(4).end,
            new Cell(new Txt('Código: FRP-007').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('N° de Revisión: 1').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Fecha: 20/06/2023').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Página: 2 de 2').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
        ]).widths(['25%','50%','25%']).pageBreak('before').end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end
          ]
        ]).widths(['100%']).end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('6.7 Distribucion del producto').end).fillColor('#dedede').bold().border([false,false,false,false]).end,
          ],
          [
            new Cell(
              new Columns(
                [
                  new Txt('Vista aerea').end,
                  new Txt('Vista 3D').end
                ],
              ).end
            ).fillColor('#f1f1f1').border([false]).end
          ],
        ]).widths(['100%']).end
      )

      pdf.add(
        new Table([
          [
            new Cell(
              new Columns(
                [
                  new Cell(await new Img('https://192.168.0.23:8080/api/imagen/aereo/62266c741c1b1805b8ad24a0-434.png').width(250).margin([0, 15]).build()).alignment('center').border([false]).end,
                  new Cell(await new Img('https://192.168.0.23:8080/api/imagen/distribucion/62266c741c1b1805b8ad24a0-478.png').width(250).margin([0, 15]).build()).alignment('center').border([false]).end,
                ],
              ).end
            ).border([false]).end
          ],
        ]).widths(['100%']).end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('Peso de caja (kg)').end).fillColor('#f1f1f1').bold().border([false,false,false,false]).end,
            new Cell(new Txt('Cantidad de estibas').end).fillColor('#f1f1f1').bold().border([false,false,false,false]).end
          ],
          [
            new Cell(new Txt('20').end).border([false]).end,
            new Cell(new Txt('5').end).border([false]).end
          ],
        ]).widths(['50%','50%']).end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('Peletizado aprobado').end).fillColor('#f1f1f1').bold().border([false,false,false,false]).end,
          ],
          [
            new Cell(await new Img('https://192.168.0.23:8080/api/imagen/despacho/62266c741c1b1805b8ad24a0-959.png').width(250).margin([0, 15]).build()).alignment('center').border([false]).end,
          ]

        ]).widths(['100%']).end
      )

      // PAGINA 8 **************************************************************
      pdf.add(
        new Table([
          [
            new Cell(await new Img('../../assets/poli_cintillo.png').width(85).margin([0, 10,0,0]).build()).alignment('center').rowSpan(4).end,
            new Cell(new Txt(`FORMATO 
            ESPECIFICACIÓN DE 
            PRODUCTO`).bold().end).alignment('center').margin([0, 10,0,0]).fontSize(13).rowSpan(4).end,
            new Cell(new Txt('Código: FRP-007').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('N° de Revisión: 1').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Fecha: 20/06/2023').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Página: 2 de 2').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
        ]).widths(['25%','50%','25%']).pageBreak('before').end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end
          ]
        ]).widths(['100%']).end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('7. Clasificación de defectos').bold().end).bold().color('#FFFFFF').fillColor('#000000').end,
          ],
          [
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end
          ],
          [
            new Cell(new Txt('7.1 Defectos críticos AQL 1,5%').bold().end).bold().fillColor('#f1f1f1').border([false]).end,
          ],
          [
            new Cell(new Ul(['Fuera de dimensiones','Rayas','Cartón roto, maltratado, fuera de norma','Arqueado','Despegado lateral','Litografía borrosa','Mal corte y/o desperdicios en el estuche']).end).border([false]).end,
          ],
          [
            new Cell(new Txt('7.1 Defectos máyores AQL 1,5%').bold().end).bold().fillColor('#f1f1f1').border([false]).end,
          ],
          [
            new Cell(new Ul(['Fuera de dimensiones','Rayas','Cartón roto, maltratado, fuera de norma','Arqueado','Despegado lateral','Litografía borrosa','Mal corte y/o desperdicios en el estuche']).end).border([false]).end,
          ],
          [
            new Cell(new Txt('7.1 Defectos menores AQL 1,5%').bold().end).bold().fillColor('#f1f1f1').border([false]).end,
          ],
          [
            new Cell(new Ul(['Fuera de dimensiones','Rayas','Cartón roto, maltratado, fuera de norma','Arqueado','Despegado lateral','Litografía borrosa','Mal corte y/o desperdicios en el estuche']).end).border([false]).end,
          ],
        ]).widths(['100%']).end
      )

      // PAGINA 9*********************************+
      pdf.add(
        new Table([
          [
            new Cell(await new Img('../../assets/poli_cintillo.png').width(85).margin([0, 10,0,0]).build()).alignment('center').rowSpan(4).end,
            new Cell(new Txt(`FORMATO 
            ESPECIFICACIÓN DE 
            PRODUCTO`).bold().end).alignment('center').margin([0, 10,0,0]).fontSize(13).rowSpan(4).end,
            new Cell(new Txt('Código: FRP-007').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('N° de Revisión: 1').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Fecha: 20/06/2023').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Página: 2 de 2').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
        ]).widths(['25%','50%','25%']).pageBreak('before').end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end
          ],
          [
            new Cell(new Txt('8. Preparación colores pantone usados').bold().end).bold().color('#FFFFFF').fillColor('#000000').end,
          ],
          [
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end
          ],
        ]).widths(['100%']).end
      )
      
      for(let i=0;i<formulas_.length;i++){
        pdf.add(
          new Table([
            [
              new Cell(new Txt(formulas_[i].color).bold().end).fillColor('#f1f1f1').border([false]).end
            ]
          ]).widths(['100%']).end
        )
        for(let n=0;n<formulas_[i].formulas.length;n++){
          pdf.add(
            new Table([
              [
                new Cell(new Txt(`Fórmula ${n+1}`).bold().end).border([false]).end
              ],
              [
                new Cell(new Ul(formulas_[i].formulas[n]).end).border([false]).end
              ]
            ]).widths(['100%']).end
          )
        }
      }

      pdf.create().download(`TEST`)
    }

    generarPDF()
  }


}
