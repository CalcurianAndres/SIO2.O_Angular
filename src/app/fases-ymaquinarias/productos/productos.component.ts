import { Component, OnInit } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { Cell, Columns, Img, Ol, PdfMakeWrapper, Stack, Table, Txt, Ul } from 'pdfmake-wrapper';
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { Producto, Producto_ } from 'src/app/compras/models/modelos-compra';
import { ClientesService } from 'src/app/services/clientes.service';
import { ProductosService } from 'src/app/services/productos.service';
import { DefectosService } from 'src/app/services/defectos.service';
import { FormulasService } from 'src/app/services/formulas.service';
// var _ = require('lodash');

// import { SwPush } from '@angular/service-worker';

@Component({
  selector: 'app-productos',
  standalone: false,templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.scss']
})
export class ProductosComponent implements OnInit{

  readonly VAPID_PUBLIC_KEY = "YOUR_SERVER_PUBLIC_KEY";

  constructor(public clientes:ClientesService,
              public productos_:ProductosService,
              public defects:DefectosService,
              public formulas:FormulasService
  ) {}

  ngOnInit(): void {
    this.cambiosDiferentes = this.detectarDiferencias(this.test);
    console.log(this.cambiosDiferentes)
  }


  public sustratos_nombres:string[] = []
  public tinta_nombres:string[]= []
  public barniz_nombres:string[] = []
  public impresoras_nombre:string[] = []
  public fuentes_nombres:string[] = []
  public troqueladora_nombres:string[] = []
  public guillotina_nombres:string[] = []
  public pegadora_nombres:string[] = []
  public pega_nombres:string[] = []
  public cajas_nombres:string[] = []
  public caja_nombre = '';

  public nuevo;
  public cliente;
  public editar = false;
  public productos:any = []
  public id_selected = ''

  public cambiosDiferentes
  public cambios = false;

  public data = {
    nombre:'',
    rif:'',
    codigo:'',
    direccion:'',
    contactos:[
    ],
    almacenes:[
    ]
  }

  public producto:Producto = {
    cliente:'',
    producto:'',
    codigo:'',
    codigo_cliente:'',
    tamano_desplegado:[],
    tamano_cerrado:[],
    diseno:'',
    sustrato:[],
    tintas:[],
    barnices:[],
    archivo_diseno:'',
    archivo_montaje:[],
    tipo_plancha:'',
    tiempo_exposicion:'',
    maquinas:[],
    tamano_sustrato_imprimir:[],
    area_efectiva:[],
    fuente:[],
    troqueladora:[],
    guillotina:[],
    pegadora:[],
    pegamento:[],
    embalaje:'',
    caja:[],
    unidades_por_caja:0,
    cantidad_por_paquetes:0,
    vista_aerea:'',
    vista_3d:'',
    tipo_paleta:'',
    tamano_paleta:'',
    cantidad_estibas:0,
    peso_cajas:'',
    paletizado:''
    
  }


  Producto:Producto_ = {
    identificacion:{
      cliente  :'',
      categoria:'',
      producto :'',
      codigo   :'',
      version  :'',
      codigo_cliente: ''
    },
    dimensiones:{
      desplegado:{
        ancho     :'',
        largo     :'',
        tolerancia: '',
      },
      cerrado:{
        ancho     :'',
        largo     :'',
        alto      :'',
        tolerancia:''
      },
      diseno:''
    },
    materia_prima:{
      sustrato:[],
      tintas:[],
      barnices:[],
    },
    pre_impresion:{
      diseno:'',
      montajes:'',
      nombre_montajes:[],
      tamano_sustrato:{
        montajes:[{ancho:'', largo:'', ejemplares:''},{ancho:'', largo:'', ejemplares:''}],
        margenes:[{inferior:'0', superior:'0',izquierdo:'0',derecho:'0'},{inferior:'0', superior:'0',izquierdo:'0',derecho:'0'}]
      },
      plancha:{
        tipo:'',
        marca:'',
        tiempo_exposicion:''
      },
      pelicula:[]
    },
    impresion:{
      impresoras:[],
      secuencia:[[]],
      pinzas:[[]],
      fuentes:[]
    },
    post_impresion:{
      otros:[],
      troqueladora:[],
      henidura:{alto:'', ancho:''},
      guillotina:[],
      pegadora:[],
      pegamento:[],
      caja:{
        nombre:'',
        cabida:[]
      },
      distribucion:{
        aerea:'',
        v3d:'',
        peso_cajas:'',
        estibas:'',
        paletizado:''
      }
    }
  }

  public cambios_todos:any = []
  public fechas_cambios:any = []
  public codigo_producto:string = '';
  Cambios_realizados(producto_id, producto){
    this.codigo_producto = `E-${producto.identificacion.cliente.codigo}-${producto.identificacion.codigo}-${producto.identificacion.version}`
    let cambios = this.productos_.buscarHistorialPorProducto(producto_id);
    

    for(let i=0;i<cambios.length;i++){
      this.cambios_todos.push(this.detectarDiferencias(cambios[i]))
      this.fechas_cambios.push(cambios[i].fechaCambio)

      if(i === cambios.length -1){
        console.log(this.cambios_todos)
        this.cambios = true;
      }
    }
    
  }


  public test = {
    producto: {
      $oid: "66eac4a10c16248fb81e30dd"
    },
    cambios: {
      identificacion_cliente: "De: 66e98997cc8a9a662a67f2c0 A: 66e98997cc8a9a662a67f2c0",
      identificacion_categoria: "De: 66e9e0297c8231c41dc30d29 A: 66e9e0297c8231c41dc30d29",
      identificacion_producto: "De: Manzanilla con Limón 20 bolsitas A: Est. Manzanilla con Limón 20 bolsitas",
      materia_prima_sustrato: "De: [\"66bf73e3605b8ca0df5681e4\"] A: [\"66bf73e3605b8ca0df5681e4\"]",
      materia_prima_tintas: "De: [{\"tinta\":\"66cde7d1ba0114d33760f23e\",\"cantidad\":\"0.15\",\"_id\":\"66e9e8637c8231c41dc30d8e\"},{\"tinta\":\"66cde879ba0114d33760f24a\",\"cantidad\":\"0.15\",\"_id\":\"66e9e8637c8231c41dc30d8f\"},{\"tinta\":\"66bf7743605b8ca0df568225\",\"cantidad\":\"0.10\",\"_id\":\"66e9e8637c8231c41dc30d90\"},{\"tinta\":\"66cde780ba0114d33760f232\",\"cantidad\":\"0.2\",\"_id\":\"66e9e8637c8231c41dc30d91\"}] A: [{\"tinta\":\"66cde7d1ba0114d33760f23e\",\"cantidad\":\"0.15\",\"_id\":\"66e9e8637c8231c41dc30d8e\"},{\"tinta\":\"66cde879ba0114d33760f24a\",\"cantidad\":\"0.15\",\"_id\":\"66e9e8637c8231c41dc30d8f\"},{\"tinta\":\"66bf7743605b8ca0df568225\",\"cantidad\":\"0.10\",\"_id\":\"66e9e8637c8231c41dc30d90\"},{\"tinta\":\"66cde780ba0114d33760f232\",\"cantidad\":\"0.2\",\"_id\":\"66e9e8637c8231c41dc30d91\"}]",
      materia_prima_barnices: "De: [{\"barniz\":\"66bf7a19605b8ca0df56824b\",\"cantidad\":\"0.5\",\"_id\":\"66e9e8637c8231c41dc30d92\"}] A: [{\"barniz\":\"66bf7a19605b8ca0df56824b\",\"cantidad\":\"0.5\",\"_id\":\"66e9e8637c8231c41dc30d92\"}]",
      pre_impresion_tamano_sustrato: "De: {\"montajes\":[{\"ancho\":\"70\",\"largo\":\"83\",\"ejemplares\":\"16\",\"_id\":\"66e9e8637c8231c41dc30d93\"},{\"ancho\":\"\",\"largo\":\"\",\"ejemplares\":\"\",\"_id\":\"66e9e8637c8231c41dc30d94\"}],\"margenes\":[{\"inferior\":\"1.5\",\"superior\":\"3\",\"izquierdo\":\"1.5\",\"derecho\":\"1.5\",\"_id\":\"66e9e8637c8231c41dc30d95\"},{\"inferior\":\"0\",\"superior\":\"0\",\"izquierdo\":\"0\",\"derecho\":\"0\",\"_id\":\"66e9e8637c8231c41dc30d96\"}]} A: {\"montajes\":[{\"ancho\":\"70\",\"largo\":\"83\",\"ejemplares\":\"16\",\"_id\":\"66e9e8637c8231c41dc30d93\"},{\"ancho\":\"\",\"largo\":\"\",\"ejemplares\":\"\",\"_id\":\"66e9e8637c8231c41dc30d94\"}],\"margenes\":[{\"inferior\":\"1.5\",\"superior\":\"3\",\"izquierdo\":\"1.5\",\"derecho\":\"1.5\",\"_id\":\"66e9e8637c8231c41dc30d95\"},{\"inferior\":\"0\",\"superior\":\"0\",\"izquierdo\":\"0\",\"derecho\":\"0\",\"_id\":\"66e9e8637c8231c41dc30d96\"}]}",
      impresion_impresoras: "De: [\"66e99fcc8f52c9992854dbf2\",\"66e99ffd8f52c9992854dbf7\"] A: [\"66e99fcc8f52c9992854dbf2\",\"66e99ffd8f52c9992854dbf7\"]",
      impresion_fuentes: "De: [\"66e9aafe8f52c9992854dd20\"] A: [{\"_id\":\"66e9aafe8f52c9992854dd20\",\"borrado\":false,\"calibre\":\"\",\"codigo\":\"\",\"color\":\"\",\"rgb\":\"\",\"modelo\":\"001\",\"cinta\":\"\",\"fabricante\":{\"_id\":\"66bf6f23605b8ca0df56816d\",\"borrado\":false,\"proveedor\":true,\"nombre\":\"Fabrica de Tintas Olin, C.A.\",\"alias\":\"Olin\",\"origenes\":[{\"pais\":\"Venezuela\",\"estado\":\"Miranda\",\"_id\":\"66bf6f23605b8ca0df56816e\"}],\"grupo\":[\"66bf583c605b8ca0df5680d3\",\"66bf586f605b8ca0df5680d7\",\"66bf5b25605b8ca0df5680f1\",\"66e9aaae8f52c9992854dd02\"],\"createdAt\":\"2024-08-16T15:24:19.695Z\",\"updatedAt\":\"2024-09-17T16:14:25.046Z\",\"__v\":0},\"gramaje\":\"\",\"grupo\":{\"_id\":\"66e9aaae8f52c9992854dd02\",\"borrado\":false,\"nombre\":\"Solución de fuentes\",\"parcial\":false,\"icono\":\"fas fa-eye-dropper\",\"trato\":false,\"otro\":false,\"createdAt\":\"2024-09-17T16:13:34.332Z\",\"updatedAt\":\"2024-09-17T16:13:51.417Z\",\"__v\":0},\"nombre\":\"Muestra\",\"origen\":\"\",\"serie\":\"Apache\",\"createdAt\":\"2024-09-17T16:14:54.829Z\",\"updatedAt\":\"2024-09-17T17:29:31.283Z\",\"__v\":0,\"especificacion2\":{\"_id\":\"66e9bc7b8f52c9992854ddca\",\"especificacion\":{\"apariencia\":\"Liquida\",\"ph_m\":\"3\",\"ph_M\":\"4\"},\"createdAt\":\"2024-09-17T17:29:31.274Z\",\"updatedAt\":\"2024-09-17T17:29:31.274Z\",\"__v\":0}}]",
      post_impresion_troqueladora: "De: [\"66e9a25f8f52c9992854dc06\"] A: [\"66e9a25f8f52c9992854dc06\"]",
      post_impresion_guillotina: "De: [\"66e9a33c8f52c9992854dc15\"] A: [\"66e9a33c8f52c9992854dc15\"]",
      post_impresion_pegadora: "De: [\"66e9a50d8f52c9992854dc2e\"] A: [\"66e9a50d8f52c9992854dc2e\"]"
    },
    fechaCambio: {
      $date: "2024-09-18T12:37:50.815Z"
    }
  }

  // En tu archivo .ts (componente de Angular)
  detectarDiferencias(obj) {
    const cambios = obj.cambios;
    const diferencias = {};
  
    for (const key in cambios) {
      const valor = cambios[key];
      const deMatch = valor.match(/De:\s*(.*?)\s*A:/);
      const aMatch = valor.match(/A:\s*(.*)$/);
  
      // Compara los valores "De:" y "A:", y solo guarda la diferencia si son distintos
      if (deMatch && aMatch && deMatch[1] !== aMatch[1]) {
        diferencias[key] = { De: deMatch[1], A: aMatch[1] };
      }
    }
  
    return diferencias;
  }

  BuscarProductos(clienteID){
    this.productos = this.productos_.buscarPorClientes(clienteID);
    this.id_selected = clienteID
  }
  

  nuevoProducto(){
    this.nuevo = true;
  }

  nuevoCliente(){
    this.cliente = true;
  }

  cerrar(){
    this.nuevo = false;
    this.cliente = false;
    this.editar = false;

    let textoSinFormatear = ''

    function formatStringUnique(input: string): string {
      // Reemplaza todos los '.' y '_' con espacios
      let formattedString = input.replace(/[.]/g, ' ');
    
      // Divide la cadena en palabras y elimina las palabras repetidas
      const words = formattedString.split(' ');
      const uniqueWords = words.filter((word, index) => words.indexOf(word) === index);
    
      // Une las palabras únicas de nuevo en una cadena
      formattedString = uniqueWords.join(' ');
    
      return formattedString;
    }
    
    const ahora = new Date();
    const dia = ahora.getDate().toString().padStart(2, '0'); // Obtener el día con ceros a la izquierda si es necesario
    const mes = (ahora.getMonth() + 1).toString().padStart(2, '0'); // Obtener el mes (se suma 1 ya que los meses van de 0 a 11)
    const año = ahora.getFullYear();
    const fecha = `${dia}-${mes}-${año}`;
    const hora = ahora.toTimeString().split(' ')[0]; // Obtener la hora en formato HH:MM:SS
    function formatChangesDynamically(changes: any): string {
      let message = `Actualizacion: ${fecha} - ${hora}\n`;
    
      const processChange = (key: string, value: any) => {
        if (typeof value === 'object' && value !== null) {
          if ('original' in value && 'nuevo' in value) {
            message += `- La ruta: ${formatStringUnique(key)} cambió.\n  Anterior: ${value.original}\n Nuevo: ${value.nuevo}\n\n`;
          } else {
            Object.entries(value).forEach(([nestedKey, nestedValue]) => {
              processChange(`${key}.${nestedKey}`, nestedValue);
            });
          }
        }
      };
    
      Object.entries(changes).forEach(([key, value]) => {
        processChange(key, value);
      });
    
      return message;
    }

    const userFriendlyMessage = formatChangesDynamically(textoSinFormatear);
    console.log(userFriendlyMessage);

    this.Producto = {
      identificacion:{
        cliente  :'',
        categoria:'',
        producto :'',
        codigo   :'',
        version  :'',
        codigo_cliente:''
      },
      dimensiones:{
        desplegado:{
          ancho     :'',
          largo     :'',
          tolerancia: '',
        },
        cerrado:{
          ancho     :'',
          largo     :'',
          alto      :'',
          tolerancia:''
        },
        diseno:''
      },
      materia_prima:{
        sustrato:[],
        tintas:[],
        barnices:[],
      },
      pre_impresion:{
        diseno:'',
        montajes:'',
        nombre_montajes:[],
        tamano_sustrato:{
          montajes:[{ancho:'', largo:'', ejemplares:''}],
          margenes:[{inferior:'', superior:'',izquierdo:'',derecho:''}]
        },
        plancha:{
          tipo:'',
          marca:'',
          tiempo_exposicion:''
        },
        pelicula:[]
      },
      impresion:{
        impresoras:[],
        secuencia:[[]],
        pinzas:[[]],
        fuentes:[]
      },
      post_impresion:{
        otros:[],
        troqueladora:[],
        henidura:{alto:'', ancho:''},
        guillotina:[],
        pegadora:[],
        pegamento:[],
        caja:{
          nombre:'',
          cabida:[]
        },
        distribucion:{
          aerea:'',
          v3d:'',
          peso_cajas:'',
          estibas:'',
          paletizado:''
        }
      }
    }
    this.BuscarProductos(this.id_selected)
  }

  GuardarCiente(){
    this.data = {
      nombre:'',
      rif:'',
      codigo:'',
      direccion:'',
      contactos:[
      ],
      almacenes:[
      ]
    }
    this.nuevo = false;
    this.cliente = false;
    this.editar = false;

  }

  filas(){
    return Math.ceil(this.clientes.clientes.length / 5);
  }

  EditarCliente(cliente){
    this.data = cliente
    this.editar = true;
  }


  DescargarPDF(producto:any){

    let defecto_ = this.defects.buscarPorClienteYCategoria(producto.identificacion.cliente._id, producto.identificacion.categoria._id)
    let formulas___:any = []
    for (let i = 0; i < producto.materia_prima.tintas.length; i++) {
      let color = producto.materia_prima.tintas[i].tinta.color;
      
      switch (color) {
          case 'A':
              color = 'Amarillo';
              break;
          case 'C':
              color = 'Cyan';
              break;
          case 'M':
              color = 'Magenta';
              break;
          case 'K':
              color = 'Negro';
              break;
          default:



          let codigoTinta = producto.materia_prima.tintas[i].tinta.codigo;

          // Filtrar las fórmulas que coinciden con el código de tinta buscado
          let formulasEncontradas = this.formulas.BuscarFormulas(codigoTinta)

          console.log(formulasEncontradas)

          let agrupadoPorPantone = {};

// Suponiendo que 'resultados' es tu arreglo de fórmulas original
let formulas_ = formulasEncontradas.reduce((agrupadoPorPantone, { pantone, formula }) => {
  // Convertir la fórmula a un arreglo de texto 'material - cantidad'
  let formulaTexto = formula.map(f => `${f.material.nombre} - ${f.cantidad}kg`);
  
  // Verificar si el pantone ya está en el objeto agrupado
  if (!agrupadoPorPantone[pantone]) {
    agrupadoPorPantone[pantone] = [];
  }
  
  // Agregar el arreglo de texto al arreglo correspondiente al pantone
  agrupadoPorPantone[pantone].push(formulaTexto);
  
  return agrupadoPorPantone;
}, {});

formulas___ = Object.entries(formulas_).map(([color, formulas]) => ({ color, formulas }));
console.log(formulas___);

// Ahora 'formulas_' tiene la estructura deseada

        

//           // Agrupar las fórmulas por pantones iguales
//           let pantonesIguales = formulasEncontradas.reduce((acc, cur) => {
//               if (acc[cur.pantone]) {
//                   acc[cur.pantone].formulas.push(...cur.formula);
//               } else {
//                   acc[cur.pantone] = { color: cur.pantone, formulas: cur.formula };
//               }
//               return acc;
//           }, {});
          
//           // Obtener el resultado como un array de valores
//           let resultado = Object.values(pantonesIguales);
          
//           console.log(resultado);

// formulas_ = resultado

          break;
      }
    }

    async function generarEspecificacion(){
      const pdf = new PdfMakeWrapper();
      PdfMakeWrapper.setFonts(pdfFonts);
      pdf.pageOrientation('portrait');
      pdf.pageSize('A4');

      let Sustratos:any = [];
      let Sustratos_:any = [];
      let barnices:any = []
      let colores:any = []
      for(let i=0;i<1;i++){
        Sustratos.push(`${producto.materia_prima.sustrato[i].nombre} ${producto.materia_prima.sustrato[i].gramaje}g ${producto.materia_prima.sustrato[i].calibre}pt`)
      }
      for(let i=0;i<producto.materia_prima.barnices.length;i++){
        barnices.push(`${producto.materia_prima.barnices[i].barniz.nombre} - ${producto.materia_prima.barnices[i].cantidad}kg.`)
      }


      for(let i=0;i<producto.materia_prima.sustrato.length;i++){
        Sustratos_.push(`${producto.materia_prima.sustrato[i].nombre} (${producto.materia_prima.sustrato[i].fabricante.alias}) ${producto.materia_prima.sustrato[i].gramaje}g ${producto.materia_prima.sustrato[i].calibre}pt ${producto.materia_prima.sustrato[i].origen}`)
      }

      let peliculas:any = []
      let peliculasB:any = []

// for (let i = 0; i < producto.materia_prima.tintas.length; i++) {
//     let color = producto.materia_prima.tintas[i].tinta.color;
    
//     switch (color) {
//         case 'A':
//             color = 'Amarillo';
//             break;
//         case 'C':
//             color = 'Cyan';
//             break;
//         case 'M':
//             color = 'Magenta';
//             break;
//         case 'K':
//             color = 'Negro';
//             break;
//         default:
//             color = producto.materia_prima.tintas[i].tinta.codigo;
//     }

//     let existe = colores.findIndex(x => x.color === color);
    
//     if (existe === -1) {
//         colores.push({ color, tintas: [{tinta:producto.materia_prima.tintas[i].tinta, cantidad:producto.materia_prima.tintas[i].cantidad}] });
//     } else {
//         colores[existe].tintas.push({tinta:producto.materia_prima.tintas[i].tinta, cantidad:producto.materia_prima.tintas[i].cantidad});
//     }
    
//     console.log(colores);
// }

const colorNumero = {
  'Negro': 1,
  'Cyan': 2,
  'Magenta': 3,
  'Amarillo': 4
};

let numero = 5; // Número inicial para colores no especificados

colores.forEach((color, index) => {
  if (colorNumero[color.color]) {
      peliculas.push(`Pelicula Nº${index+1}: ${color.color}:${producto.identificacion.cliente.codigo}-${producto.identificacion.codigo}-${producto.identificacion.version}-A-${colorNumero[color.color]}`)
      if(producto.pre_impresion.montajes > 1){
      peliculasB.push(`Pelicula Nº${index+1}: ${color.color}:${producto.identificacion.cliente.codigo}-${producto.identificacion.codigo}-${producto.identificacion.version}-B-${colorNumero[color.color]}`)

      }
    } else {
    peliculas.push(`Pelicula Nº${index+1}: ${color.color}:${producto.identificacion.cliente.codigo}-${producto.identificacion.codigo}-${producto.identificacion.version}-A-${numero}`)
    if(producto.pre_impresion.montajes > 1){
    peliculasB.push(`Pelicula Nº${index+1}: ${color.color}:${producto.identificacion.cliente.codigo}-${producto.identificacion.codigo}-${producto.identificacion.version}-B-${numero}`)
      }
      numero++;
  }
});


let area_efectiva:any
let area_efectivaB:any

let areaTotal = Number(producto.pre_impresion.tamano_sustrato.montajes[0].ancho) * Number(producto.pre_impresion.tamano_sustrato.montajes[0].largo)
let AnchoEfectivo = Number(producto.pre_impresion.tamano_sustrato.montajes[0].ancho) - (Number(producto.pre_impresion.tamano_sustrato.margenes[0].superior) + Number(producto.pre_impresion.tamano_sustrato.margenes[0].inferior))
let AltoEfectivo = Number(producto.pre_impresion.tamano_sustrato.montajes[0].largo) - (Number(producto.pre_impresion.tamano_sustrato.margenes[0].izquierdo) + Number(producto.pre_impresion.tamano_sustrato.margenes[0].derecho))
area_efectiva = AnchoEfectivo * AltoEfectivo;
let area_Desperdicio = areaTotal - area_efectiva
const porcentajePerdida = (area_Desperdicio / areaTotal) * 100;

let areaTotalB = Number(producto.pre_impresion.tamano_sustrato.montajes[1].ancho) * Number(producto.pre_impresion.tamano_sustrato.montajes[1].largo)
let AnchoEfectivoB = Number(producto.pre_impresion.tamano_sustrato.montajes[1].ancho) - (Number(producto.pre_impresion.tamano_sustrato.margenes[1].superior) + Number(producto.pre_impresion.tamano_sustrato.margenes[1].inferior))
let AltoEfectivoB = Number(producto.pre_impresion.tamano_sustrato.montajes[1].largo) - (Number(producto.pre_impresion.tamano_sustrato.margenes[1].izquierdo) + Number(producto.pre_impresion.tamano_sustrato.margenes[1].derecho))
area_efectivaB = AnchoEfectivoB * AltoEfectivoB;
let area_DesperdicioB = areaTotalB - area_efectivaB;
const porcentajePerdidaB = (area_DesperdicioB / areaTotalB) * 100;


let impresoras:any = []
let troqueladoras:any = []
let guillotinas:any = []
let pegadoras:any = []

for(let i=0; i<producto.impresion.impresoras.length;i++){
  impresoras.push(producto.impresion.impresoras[i].nombre)
  console.log(producto.impresion.impresoras[i].nombre)
}
for(let i=0; i<producto.post_impresion.troqueladora.length;i++){
  troqueladoras.push(producto.post_impresion.troqueladora[i].nombre)
}
for(let i=0; i<producto.post_impresion.guillotina.length;i++){
  guillotinas.push(producto.post_impresion.guillotina[i].nombre)
}
for(let i=0; i<producto.post_impresion.pegadora.length;i++){
  pegadoras.push(producto.post_impresion.pegadora[i].nombre)
}


// Obtener la última fuente
const ultimaFuente = producto.impresion.fuentes[producto.impresion.fuentes.length - 1];

// Obtener la última especificación de la última fuente
const ultimaEspecificacion = ultimaFuente.especificacion2.especificacion;

// Obtener las propiedades de la última especificación
const propiedadesUltimaEspecificacion = Object.keys(ultimaEspecificacion);

// Obtener la última propiedad de la última especificación
const ultimaPropiedad = propiedadesUltimaEspecificacion[propiedadesUltimaEspecificacion.length - 1];

// let especificacionFuente = this.espe

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
            new Cell(new Txt(`E-${producto.identificacion.cliente.codigo}-${producto.identificacion.codigo}-${producto.identificacion.version}`).bold().end).fontSize(15).alignment('center').end,
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
            new Cell(new Txt(`${producto.identificacion.cliente.nombre}`).end).border([false]).end,
          ],
          [
            new Cell(new Txt('1.2 Producto').end).fillColor('#dedede').bold().border([false]).end,
            new Cell(new Txt(`${producto.identificacion.producto}`).end).border([false]).end,
          ],
          [
            new Cell(new Txt('1.3 Código del producto').end).fillColor('#dedede').bold().border([false]).end,
            new Cell(new Txt(`${producto.identificacion.cliente.codigo}-${producto.identificacion.codigo}-${producto.identificacion.version}`).end).border([false]).end,
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
            new Cell(new Txt(`${producto.dimensiones.desplegado.ancho} x ${producto.dimensiones.desplegado.largo} ± ${producto.dimensiones.desplegado.tolerancia}`).end).border([false]).end,
          ],
          [
            new Cell(new Txt('2.1 Tamaño del producto cerrado (mm)').end).fillColor('#dedede').bold().border([false]).end,
            new Cell(new Txt(`${producto.dimensiones.cerrado.ancho} x ${producto.dimensiones.cerrado.largo} x ${producto.dimensiones.cerrado.alto} ± ${producto.dimensiones.cerrado.tolerancia}`).end).border([false]).end,
          ]
        ]).widths(['55%','45%']).end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('2.3 Diseño del producto').end).fillColor('#dedede').bold().border([false]).end,
          ],
          [
            new Cell(await new Img(`https://192.168.0.22/api/imagen/producto/${producto.dimensiones.diseno}`).width(400).margin([0, 15]).build()).alignment('center').border([false]).pageBreak('after').end,
          ]
        ]).widths(['100%']).end
      )

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

      for(let i=0;i<producto.materia_prima.sustrato.length;i++){

       pdf.add(
         new Table([
           [
             new Cell(new Txt(producto.materia_prima.sustrato[i].fabricante.alias).end).bold().border([false]).alignment('center').end,
             new Cell(new Txt(producto.materia_prima.sustrato[i].origen).end).fontSize(8).bold().border([false]).alignment('center').end,
             new Cell(
               new Table([
                 [
                   new Cell(new Txt(producto.materia_prima.sustrato[i].especificacion.calibre.pt.min).end).border([false]).alignment('center').end,
                   new Cell(new Txt(producto.materia_prima.sustrato[i].especificacion.calibre.pt.nom).end).border([false]).alignment('center').end,
                   new Cell(new Txt(producto.materia_prima.sustrato[i].especificacion.calibre.pt.max).end).border([false]).alignment('center').end
                 ]
               ]).widths(['33.3%','33.3%','33.3%']).end
               ).bold().border([false]).end,
             new Cell(
               new Table([
                 [
                   new Cell(new Txt(producto.materia_prima.sustrato[i].especificacion.gramaje.min).end).border([false]).alignment('center').end,
                   new Cell(new Txt(producto.materia_prima.sustrato[i].especificacion.gramaje.nom).end).border([false]).alignment('center').end,
                   new Cell(new Txt(producto.materia_prima.sustrato[i].especificacion.gramaje.max).end).border([false]).alignment('center').end
                 ]
               ]).widths(['33.3%','33.3%','33.3%']).end
             ).bold().border([false]).end,
           ]
         ]).widths(['20%','19%','30%','30%']).margin([5,0,0,0]).end
       )

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

      for(let i=0;i<producto.pre_impresion.pelicula.length;i++){

        if(producto.pre_impresion.pelicula[i].color != 'Amarillo' && producto.pre_impresion.pelicula[i].color != 'Cyan' && producto.pre_impresion.pelicula[i].color != 'Magenta' && producto.pre_impresion.pelicula[i].color != 'Negro'){
          pdf.add(
            new Table([
              [
                new Cell(new Txt(producto.pre_impresion.pelicula[i].color).end).decoration('underline').decorationStyle('dotted').linkToPage(9).bold().fillColor('#c9c9c9').border([false]).end,
              ]
            ]).widths(['100%']).end
          )
        }else{
          pdf.add(
            new Table([
              [
                new Cell(new Txt(producto.pre_impresion.pelicula[i].color).end).bold().fillColor('#c9c9c9').border([false]).end,
              ]
            ]).widths(['100%']).end
          )
        }
        for(let n=0;n<producto.pre_impresion.pelicula[i].tintas.length;n++){
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
                new Cell(new Txt(producto.pre_impresion.pelicula[i].tintas[n].tinta.nombre).end).border([false]).end,
                new Cell(new Txt(producto.pre_impresion.pelicula[i].tintas[n].tinta.serie).end).border([false]).end,
                new Cell(new Txt(producto.pre_impresion.pelicula[i].tintas[n].tinta.fabricante.alias).end).border([false]).end,
                new Cell(new Txt(producto.pre_impresion.pelicula[i].tintas[n].cantidad).end).border([false]).end,
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
        new Ul(barnices).end
      )

      if(producto.pre_impresion.montajes === '2'){
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
              new Cell(new Txt(producto.pre_impresion.diseno).end).border([false]).end
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
                    new Txt(`M-${producto.identificacion.cliente.codigo}-${producto.identificacion.codigo}-${producto.identificacion.version}-A`).end,
                    new Txt('').end,
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
                    new Txt(producto.pre_impresion.nombre_montajes[0]).end,
                    new Txt(producto.pre_impresion.nombre_montajes[1]).end,
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
                    new Ul(peliculas).end,
                    new Ul(peliculasB).end
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
                    new Txt(`${producto.pre_impresion.tamano_sustrato.montajes[0].ancho} x ${producto.pre_impresion.tamano_sustrato.montajes[0].largo} cm`).end,
                    new Txt(`${producto.pre_impresion.tamano_sustrato.montajes[1].ancho} x ${producto.pre_impresion.tamano_sustrato.montajes[1].largo} cm`).end
                  ]
                ).end
              ).border([false]).end
            ],
            [
              new Cell(
                new Columns(
                  [
                    new Txt(`${producto.pre_impresion.tamano_sustrato.montajes[0].ejemplares} Ejemplares`).end,
                    new Txt(`${producto.pre_impresion.tamano_sustrato.montajes[1].ejemplares} Ejemplares`).end,
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
                    new Txt(`${producto.pre_impresion.tamano_sustrato.margenes[0].inferior} x ${producto.pre_impresion.tamano_sustrato.margenes[0].superior} x ${producto.pre_impresion.tamano_sustrato.margenes[0].derecho} x ${producto.pre_impresion.tamano_sustrato.margenes[0].izquierdo}`).end,
                    new Txt(`${producto.pre_impresion.tamano_sustrato.margenes[1].inferior} x ${producto.pre_impresion.tamano_sustrato.margenes[1].superior} x ${producto.pre_impresion.tamano_sustrato.margenes[1].derecho} x ${producto.pre_impresion.tamano_sustrato.margenes[1].izquierdo}`).end,
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
                    new Txt(area_efectiva).end,
                    new Txt(area_efectivaB).end
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
                    new Txt((porcentajePerdida.toFixed(2)).toString()).end,
                    new Txt((porcentajePerdidaB.toFixed(2)).toString()).end
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
                    new Cell(new Txt(producto.pre_impresion.plancha.tipo).end).border([false]).end,
                    new Cell(new Txt(producto.pre_impresion.plancha.marca).end).border([false]).end,
                    new Cell(new Txt(producto.pre_impresion.plancha.tiempo_exposicion).end).border([false]).end
                  ]
                ]).widths(['45%','25%','30%']).end
              ).border([false]).end
            ]
          ]).widths(['100%']).end
        )
      }else{
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
              new Cell(new Txt(producto.pre_impresion.diseno).end).border([false]).end
            ],
            [
              new Cell(new Txt('4.2 Código del montaje').end).fillColor('#dedede').bold().border([false,false,false,false]).end,
            ],
            [
              new Cell(
                new Columns(
                  [
                    new Txt('Montaje A').bold().end,
                    new Txt('').bold().end
                  ]
                ).end
              ).border([false]).end
            ],
            [
              new Cell(
                new Columns(
                  [
                    new Txt(`M-${producto.identificacion.cliente.codigo}-${producto.identificacion.codigo}-${producto.identificacion.version}-A`).end,
                    new Txt('').end,
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
                    new Txt(producto.pre_impresion.nombre_montajes[0]).end,
                    new Txt('').end,
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
                    new Ul(peliculas).end,
                    new Ul([]).end
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
                    new Txt(`${producto.pre_impresion.tamano_sustrato.montajes[0].ancho} x ${producto.pre_impresion.tamano_sustrato.montajes[0].largo} cm`).end,
                    new Txt(``).end
                  ]
                ).end
              ).border([false]).end
            ],
            [
              new Cell(
                new Columns(
                  [
                    new Txt(`${producto.pre_impresion.tamano_sustrato.montajes[0].ejemplares} Ejemplares`).end,
                    new Txt(``).end,
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
                    new Txt(`${producto.pre_impresion.tamano_sustrato.margenes[0].inferior} x ${producto.pre_impresion.tamano_sustrato.margenes[0].superior} x ${producto.pre_impresion.tamano_sustrato.margenes[0].derecho} x ${producto.pre_impresion.tamano_sustrato.margenes[0].izquierdo}`).end,
                    new Txt(``).end,
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
                    new Txt(area_efectiva).end,
                    new Txt('').end
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
                    new Txt((porcentajePerdida.toFixed(2)).toString()).end,
                    new Txt('').end
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
                    new Cell(new Txt(producto.pre_impresion.plancha.tipo).end).border([false]).end,
                    new Cell(new Txt(producto.pre_impresion.plancha.marca).end).border([false]).end,
                    new Cell(new Txt(producto.pre_impresion.plancha.tiempo_exposicion).end).border([false]).end
                  ]
                ]).widths(['45%','25%','30%']).end
              ).border([false]).end
            ]
          ]).widths(['100%']).end
        )
      }



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
                  new Txt('').end,
                  new Txt('').end
                ],
              ).end
            ).border([false]).end
          ],
          [
            new Cell(
              new Columns(
                [
                  new Ol(producto.impresion.secuencia[0]).end,
                  // new Ol(producto.impresion.secuencia[1]).end
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
                  new Cell(new Txt(producto.impresion.fuentes[0].fabricante.alias).end).border([false]).end,
                  new Cell(new Txt(producto.impresion.fuentes[0].nombre).end).border([false]).end,
                  new Cell(new Ul([`pH: ${producto.impresion.fuentes[0].especificacion2.especificacion.ph_m} - ${producto.impresion.fuentes[0].especificacion2.especificacion.ph_M}`, `${ultimaPropiedad}: ${ultimaEspecificacion[ultimaPropiedad]}`]).end).border([false]).end
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
            new Cell(new Ul(troqueladoras).end).border([false]).end,
          ],
          [
            new Cell(new Txt('6.2 Canal de hendidura').end).fillColor('#dedede').bold().border([false,false,false,false]).end,
          ],
          [
            new Cell(new Txt(`${producto.post_impresion.henidura.alto} x ${producto.post_impresion.henidura.ancho} mm`).end).border([false]).end,
          ],
          [
            new Cell(new Txt('6.3 Guillotina(s) aprobada(s)').end).fillColor('#dedede').bold().border([false,false,false,false]).end,
          ],
          [
            new Cell(new Ul(guillotinas).end).border([false]).end,
          ],
          [
            new Cell(new Txt('6.4 Pegadora(s) aprobada(s)').end).fillColor('#dedede').bold().border([false,false,false,false]).end,
          ],
          [
            new Cell(new Ul(pegadoras).end).border([false]).end,
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
            new Cell(new Txt(producto.post_impresion.caja.nombre).end).border([false]).end,
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

      for(let i=0;i<Sustratos_.length;i++){
             pdf.add(
               new Table([
                 [
                   new Cell(new Txt(`${Sustratos_[i]}`).end).bold().border([false]).end,
                   new Cell(new Txt(`${producto.post_impresion.caja.cabida[i]}`).end).bold().border([false]).end
                 ]
               ]).widths(['60%','40%',]).end
             )
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
                  new Cell(await new Img(`https://192.168.0.22/api/imagen/producto/${producto.post_impresion.distribucion.aerea}`).width(250).margin([0, 15]).build()).alignment('center').border([false]).end,
                  new Cell(await new Img(`https://192.168.0.22/api/imagen/producto/${producto.post_impresion.distribucion.v3d}`).width(250).margin([0, 15]).build()).alignment('center').border([false]).end,
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
            new Cell(new Txt(producto.post_impresion.distribucion.peso_cajas).end).border([false]).end,
            new Cell(new Txt(producto.post_impresion.distribucion.estibas).end).border([false]).end
          ],
        ]).widths(['50%','50%']).end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('Peletizado aprobado').end).fillColor('#f1f1f1').bold().border([false,false,false,false]).end,
          ],
          [
            new Cell(await new Img(`https://192.168.0.22/api/imagen/producto/${producto.post_impresion.distribucion.paletizado}`).width(250).margin([0, 15]).build()).alignment('center').border([false]).end,
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
            new Cell(new Txt(`7.1 Defectos menores AQL ${defecto_.defectos.menores.aql}%`).bold().end).bold().fillColor('#f1f1f1').border([false]).end,
          ],
          [
            new Cell(new Ul(defecto_.defectos.menores.defectos).end).border([false]).end,
          ],
          [
            new Cell(new Txt(`7.2 Defectos máyores AQL ${defecto_.defectos.mayores.aql}%`).bold().end).bold().fillColor('#f1f1f1').border([false]).end,
          ],
          [
            new Cell(new Ul(defecto_.defectos.mayores.defectos).end).border([false]).end,
          ],
          [
            new Cell(new Txt(`7.2 Defectos crítios AQL ${defecto_.defectos.criticos.aql}%`).bold().end).bold().fillColor('#f1f1f1').border([false]).end,
          ],
          [
            new Cell(new Ul(defecto_.defectos.criticos.defectos).end).border([false]).end,
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
      
    for(let i=0;i<formulas___.length;i++){
      pdf.add(
        new Table([
          [
            new Cell(new Txt(formulas___[i].color).bold().end).fillColor('#f1f1f1').border([false]).end
          ]
        ]).widths(['100%']).end
      )
      for(let n=0;n<formulas___[i].formulas.length;n++){
        pdf.add(
          new Table([
            [
              new Cell(new Txt(`Fórmula ${n+1}`).bold().end).border([false]).end
            ],
            [
              new Cell(new Ul(formulas___[i].formulas[n]).end).border([false]).end
              // new Cell(new Ul(formulas_[i].formulas[n]).end).border([false]).end
            ]
          ]).widths(['100%']).end
        )
      }
    }

      pdf.create().download()
    }
    generarEspecificacion()
  }
  



  Cambios(){
    const producto = {
      "_id": {
        "$oid": "6627e5d6361182a67688aa9b"
      },
      "borrado": false,
      "identificacion": {
        "cliente": {
          "$oid": "65c68c77fb6842b60425f730"
        },
        "categoria": {
          "$oid": "66032bf4066fd3f378f7a693"
        },
        "producto": "producto test",
        "codigo": "02",
        "version": "1"
      },
      "dimensiones": {
        "desplegado": {
          "ancho": "30",
          "largo": "20",
          "tolerancia": "1"
        },
        "cerrado": {
          "ancho": "20",
          "largo": "30",
          "alto": "2",
          "tolerancia": "1"
        },
        "diseno": "PRODUCTO_23_4_2024_12_42_39_172.png"
      },
      "materia_prima": {
        "sustrato": [
          {
            "$oid": "655ca516758cdd519b4b7ec8"
          },
          {
            "$oid": "655cc50d71209352589bf75d"
          }
        ],
        "tintas": [
          {
            "tinta": {
              "$oid": "661fe13cbe729ad3f96a7b43"
            },
            "cantidad": "0.5",
            "_id": {
              "$oid": "6627e5d6361182a67688aa9c"
            }
          },
          {
            "tinta": {
              "$oid": "661fe156be729ad3f96a7b4e"
            },
            "cantidad": "0.5",
            "_id": {
              "$oid": "6627e5d6361182a67688aa9d"
            }
          },
          {
            "tinta": {
              "$oid": "661fe1f8be729ad3f96a7b90"
            },
            "cantidad": "0.2",
            "_id": {
              "$oid": "6627e5d6361182a67688aa9e"
            }
          },
          {
            "tinta": {
              "$oid": "661ee3680be7c3b860010b89"
            },
            "cantidad": "0.2",
            "_id": {
              "$oid": "6627e5d6361182a67688aa9f"
            }
          },
          {
            "tinta": {
              "$oid": "661fe17ebe729ad3f96a7b59"
            },
            "cantidad": "0.01",
            "_id": {
              "$oid": "6627e5d6361182a67688aaa0"
            }
          }
        ],
        "barnices": [
          {
            "barniz": {
              "$oid": "65cce514ee8d817da3f9c4dd"
            },
            "cantidad": "0.02",
            "_id": {
              "$oid": "6627e5d6361182a67688aaa1"
            }
          }
        ]
      },
      "pre_impresion": {
        "diseno": "archivo.ai",
        "montajes": "2",
        "nombre_montajes": [
          "a.ai",
          "b.ai"
        ],
        "tamano_sustrato": {
          "montajes": [
            {
              "ancho": "10",
              "largo": "20",
              "ejemplares": "15",
              "_id": {
                "$oid": "6627e5d6361182a67688aaa2"
              }
            },
            {
              "ancho": "10",
              "largo": "30",
              "ejemplares": "25",
              "_id": {
                "$oid": "6627e5d6361182a67688aaa3"
              }
            }
          ],
          "margenes": [
            {
              "inferior": "2",
              "superior": "2",
              "izquierdo": "2",
              "derecho": "2",
              "_id": {
                "$oid": "6627e5d6361182a67688aaa4"
              }
            },
            {
              "inferior": "2",
              "superior": "2",
              "izquierdo": "2",
              "derecho": "2",
              "_id": {
                "$oid": "6627e5d6361182a67688aaa5"
              }
            }
          ]
        },
        "plancha": {
          "tipo": "Ptipo",
          "marca": "Pmarca",
          "tiempo_exposicion": "2"
        }
      },
      "impresion": {
        "impresoras": [
          {
            "$oid": "65c3cd8a778e45ce5e42afee"
          },
          {
            "$oid": "65fdda3b9660e8c2b5983406"
          }
        ],
        "secuencia": [
          [
            "Amarillo",
            "Negro",
            "233",
            "Cyan"
          ],
          [
            "233",
            "Negro",
            "Cyan",
            "Amarillo"
          ]
        ],
        "pinzas": [
          [],
          [
            ""
          ]
        ],
        "fuentes": [
          {
            "$oid": "65fb49d675ce10e38628d56b"
          }
        ]
      },
      "post_impresion": {
        "troqueladora": [
          {
            "$oid": "65c3d178778e45ce5e42b017"
          },
          {
            "$oid": "65cd0c4cff7d2d252682c084"
          }
        ],
        "henidura": {
          "alto": "30",
          "ancho": "60"
        },
        "guillotina": [
          {
            "$oid": "65cd10b0ff7d2d252682c2d6"
          }
        ],
        "pegadora": [
          {
            "$oid": "65c3d178778e45ce5e42b017"
          }
        ],
        "pegamento": [
          {
            "pega": {
              "$oid": "65cd0de1ff7d2d252682c107"
            },
            "cantidad": "0.5",
            "_id": {
              "$oid": "6627e5d6361182a67688aaa6"
            }
          }
        ],
        "caja": {
          "nombre": "",
          "cabida": [
            "300",
            "250"
          ]
        },
        "distribucion": {
          "aerea": "EMBALAJE_AEREO_23_4_2024_12_45_50_177.png",
          "v3d": "EMBALAJE_3D_23_4_2024_12_46_1_380.png",
          "peso_cajas": "30",
          "estibas": "7",
          "paletizado": "PELETIZADO_23_4_2024_12_46_13_621.png"
        }
      },
      "createdAt": {
        "$date": "2024-04-23T16:46:14.921Z"
      },
      "updatedAt": {
        "$date": "2024-04-23T16:46:14.921Z"
      },
      "__v": 0
    }

    const productos2 = {
      "_id": {
        "$oid": "6627e5d6361182a67688aa9b"
      },
      "borrado": false,
      "identificacion": {
        "cliente": {
          "$oid": "65c68c77fb6842b60425f730"
        },
        "categoria": {
          "$oid": "66032bf4066fd3f378f7a693"
        },
        "producto": "producto test",
        "codigo": "02",
        "version": "1"
      },
      "dimensiones": {
        "desplegado": {
          "ancho": "30",
          "largo": "20",
          "tolerancia": "1"
        },
        "cerrado": {
          "ancho": "20",
          "largo": "30",
          "alto": "2",
          "tolerancia": "1"
        },
        "diseno": "PRODUCTO_23_4_2024_12_42_39_172.png"
      },
      "materia_prima": {
        "sustrato": [
          {
            "$oid": "655ca516758cdd519b4b7ec8"
          },
          {
            "$oid": "655cc50d71209352589bf75d"
          }
        ],
        "tintas": [
          {
            "tinta": {
              "$oid": "661fe13cbe729ad3f96a7b43"
            },
            "cantidad": "0.5",
            "_id": {
              "$oid": "6627e5d6361182a67688aa9c"
            }
          },
          {
            "tinta": {
              "$oid": "661fe156be729ad3f96a7b4e"
            },
            "cantidad": "0.5",
            "_id": {
              "$oid": "6627e5d6361182a67688aa9d"
            }
          },
          {
            "tinta": {
              "$oid": "661fe1f8be729ad3f96a7b90"
            },
            "cantidad": "0.2",
            "_id": {
              "$oid": "6627e5d6361182a67688aa9e"
            }
          },
          {
            "tinta": {
              "$oid": "661ee3680be7c3b860010b89"
            },
            "cantidad": "0.2",
            "_id": {
              "$oid": "6627e5d6361182a67688aa9f"
            }
          },
          {
            "tinta": {
              "$oid": "661fe17ebe729ad3f96a7b59"
            },
            "cantidad": "0.01",
            "_id": {
              "$oid": "6627e5d6361182a67688aaa0"
            }
          }
        ],
        "barnices": [
          {
            "barniz": {
              "$oid": "65cce514ee8d817da3f9c4dd"
            },
            "cantidad": "0.2",
            "_id": {
              "$oid": "6627e5d6361182a67688aaa1"
            }
          }
        ]
      },
      "pre_impresion": {
        "diseno": "archivo.ai",
        "montajes": "2",
        "nombre_montajes": [
          "a.ai",
          "b.ai"
        ],
        "tamano_sustrato": {
          "montajes": [
            {
              "ancho": "10",
              "largo": "20",
              "ejemplares": "15",
              "_id": {
                "$oid": "6627e5d6361182a67688aaa2"
              }
            },
            {
              "ancho": "10",
              "largo": "30",
              "ejemplares": "25",
              "_id": {
                "$oid": "6627e5d6361182a67688aaa3"
              }
            }
          ],
          "margenes": [
            {
              "inferior": "2",
              "superior": "2",
              "izquierdo": "2",
              "derecho": "2",
              "_id": {
                "$oid": "6627e5d6361182a67688aaa4"
              }
            },
            {
              "inferior": "2",
              "superior": "2",
              "izquierdo": "2",
              "derecho": "2",
              "_id": {
                "$oid": "6627e5d6361182a67688aaa5"
              }
            }
          ]
        },
        "plancha": {
          "tipo": "Ptipo",
          "marca": "Pmarca",
          "tiempo_exposicion": "2"
        }
      },
      "impresion": {
        "impresoras": [
          {
            "$oid": "65c3cd8a778e45ce5e42afee"
          },
          {
            "$oid": "65fdda3b9660e8c2b5983406"
          }
        ],
        "secuencia": [
          [
            "Amarillo",
            "Negro",
            "233",
            "Cyan"
          ],
          [
            "233",
            "Negro",
            "Cyan",
            "Amarillo"
          ]
        ],
        "pinzas": [
          [],
          [
            ""
          ]
        ],
        "fuentes": [
          {
            "$oid": "65fb49d675ce10e38628d56b"
          }
        ]
      },
      "post_impresion": {
        "troqueladora": [
          {
            "$oid": "65c3d178778e45ce5e42b017"
          },
          {
            "$oid": "65cd0c4cff7d2d252682c084"
          }
        ],
        "henidura": {
          "alto": "30",
          "ancho": "60"
        },
        "guillotina": [
          {
            "$oid": "65cd10b0ff7d2d252682c2d6"
          }
        ],
        "pegadora": [
          {
            "$oid": "65c3d178778e45ce5e42b017"
          }
        ],
        "pegamento": [
          {
            "pega": {
              "$oid": "65cd0de1ff7d2d252682c107"
            },
            "cantidad": "0.5",
            "_id": {
              "$oid": "6627e5d6361182a67688aaa6"
            }
          }
        ],
        "caja": {
          "nombre": "",
          "cabida": [
            "300",
            "250"
          ]
        },
        "distribucion": {
          "aerea": "EMBALAJE_AEREO_23_4_2024_12_45_50_177.png",
          "v3d": "EMBALAJE_3D_23_4_2024_12_46_1_380.png",
          "peso_cajas": "30",
          "estibas": "6",
          "paletizado": "PELETIZADO_23_4_2024_12_46_13_621.png"
        }
      },
      "createdAt": {
        "$date": "2024-04-23T16:46:14.921Z"
      },
      "updatedAt": {
        "$date": "2024-04-23T16:46:14.921Z"
      },
      "__v": 0
    }
    // Ejemplo de uso:
    const json1 = { nombre: "Copilot", version: "1.0" };
    const json2 = { nombre: "Copilot", version: "1.1" };
  
    let textoSinFormatear = ''

    function formatStringUnique(input: string): string {
      // Reemplaza todos los '.' y '_' con espacios
      let formattedString = input.replace(/[.]/g, ' ');
    
      // Divide la cadena en palabras y elimina las palabras repetidas
      const words = formattedString.split(' ');
      const uniqueWords = words.filter((word, index) => words.indexOf(word) === index);
    
      // Une las palabras únicas de nuevo en una cadena
      formattedString = uniqueWords.join(' ');
    
      return formattedString;
    }
    
    const ahora = new Date();
    const dia = ahora.getDate().toString().padStart(2, '0'); // Obtener el día con ceros a la izquierda si es necesario
    const mes = (ahora.getMonth() + 1).toString().padStart(2, '0'); // Obtener el mes (se suma 1 ya que los meses van de 0 a 11)
    const año = ahora.getFullYear();
    const fecha = `${dia}-${mes}-${año}`;
    const hora = ahora.toTimeString().split(' ')[0]; // Obtener la hora en formato HH:MM:SS
    function formatChangesDynamically(changes: any): string {
      let message = `Actualizacion: ${fecha} - ${hora}\n`;
    
      const processChange = (key: string, value: any) => {
        if (typeof value === 'object' && value !== null) {
          if ('original' in value && 'nuevo' in value) {
            message += `- La ruta: ${formatStringUnique(key)} cambió.\n  Anterior: ${value.original}\n Nuevo: ${value.nuevo}\n\n`;
          } else {
            Object.entries(value).forEach(([nestedKey, nestedValue]) => {
              processChange(`${key}.${nestedKey}`, nestedValue);
            });
          }
        }
      };
    
      Object.entries(changes).forEach(([key, value]) => {
        processChange(key, value);
      });
    
      return message;
    }

    const userFriendlyMessage = formatChangesDynamically(textoSinFormatear);
    console.log(userFriendlyMessage);
  }

  EditarProducto(producto:any){
    console.log(producto)
    this.Producto = producto;
    let cliente:any = this.Producto.identificacion.cliente
    let categoria:any = this.Producto.identificacion.categoria
    this.Producto.identificacion.cliente = cliente._id
    this.Producto.identificacion.categoria = categoria._id
    // Actualizar los sustratos y almacenar los nombres en sustratos_nombres
    this.sustratos_nombres = this.Producto.materia_prima.sustrato.map((sustrato: any) => {
      return sustrato.nombre;
    });
    this.Producto.materia_prima.sustrato = this.Producto.materia_prima.sustrato.map((sustrato: any) => {
        return sustrato._id;
    });
    this.tinta_nombres = this.Producto.materia_prima.tintas.map((tintas: any) => {
      return tintas.tinta.nombre;
    });
    for(let i=0;i<this.Producto.materia_prima.tintas.length;i++){
      let tinta:any = this.Producto.materia_prima.tintas[i]
      this.Producto.materia_prima.tintas[i].tinta = tinta.tinta._id
    }
    this.barniz_nombres = this.Producto.materia_prima.barnices.map((barnices: any) => {
      return barnices.barniz.nombre;
    });
    for(let i=0;i<this.Producto.materia_prima.barnices.length;i++){
      let barniz:any = this.Producto.materia_prima.barnices[i]
      this.Producto.materia_prima.barnices[i].barniz = barniz.barniz._id
    }
    this.impresoras_nombre = this.Producto.impresion.impresoras.map((impresoras: any) => {
      return impresoras.nombre;
    });
    this.Producto.impresion.impresoras = this.Producto.impresion.impresoras.map((impresoras: any) => {
      return impresoras._id;
    });
    
    for(let i=0;i<this.Producto.impresion.fuentes.length;i++){
      let fuente:any = this.Producto.impresion.fuentes[i]
      this.fuentes_nombres.push(fuente.nombre)
      this.Producto.impresion.fuentes[i] = fuente._id
    }

    this.troqueladora_nombres = this.Producto.post_impresion.troqueladora.map((troqueladoras: any) => {
      return troqueladoras.nombre;
    });

    this.Producto.post_impresion.troqueladora = this.Producto.post_impresion.troqueladora.map((troqueladoras: any) => {
      return troqueladoras._id;
    });

    this.guillotina_nombres = this.Producto.post_impresion.guillotina.map((guillotinas: any) => {
      return guillotinas.nombre;
    });

    this.Producto.post_impresion.guillotina = this.Producto.post_impresion.guillotina.map((guillotinas: any) => {
      return guillotinas._id;
    });

    this.pegadora_nombres = this.Producto.post_impresion.pegadora.map((pegadoras: any) => {
      return pegadoras.nombre;
    });

    this.Producto.post_impresion.pegadora = this.Producto.post_impresion.pegadora.map((pegadoras: any) => {
      return pegadoras._id;
    });

    this.pega_nombres = this.Producto.post_impresion.pegamento.map((pegamentos: any) => {
      return pegamentos.pega.nombre;
    });

    for(let i=0;i<this.Producto.post_impresion.pegamento.length;i++){
      let pega:any = this.Producto.post_impresion.pegamento[i]
      this.Producto.post_impresion.pegamento[i].pega = pega.pega._id
    }
  
    console.log(this.Producto)
    this.nuevo = true;
  }

  

}
