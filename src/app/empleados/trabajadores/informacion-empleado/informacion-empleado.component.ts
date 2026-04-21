import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TrabajadoresService } from 'src/app/services/trabajadores.service';
import { Cell, Columns, Img, Ol, PdfMakeWrapper, Stack, Table, Txt, Ul } from 'pdfmake-wrapper';
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import * as moment from 'moment';

@Component({
  selector: 'app-informacion-empleado',
  standalone: false,templateUrl: './informacion-empleado.component.html',
  styleUrls: ['./informacion-empleado.component.scss']
})
export class InformacionEmpleadoComponent {

  constructor(public empleados:TrabajadoresService){}

  @Input() informacion:any;
  @Input() _informacion:any;
  @Output() onCloseModal = new EventEmitter();

  cerrar(){
    this.onCloseModal.emit();
  }

  public historial = false;
  public info_trabajador = [];

  DescargarFichaEmpleado(informacion){

    

    // Inicializar arrays vacíos para cada campo
    const nombres:any = [];
    const direcciones:any = [];
    const telefonos:any = [];
    const ocupaciones:any = [];

    // Llenar los arrays con los valores correspondientes de cada objeto
    informacion.informacion_adicional.referencias.forEach(ref => {
      nombres.push(ref.nombre);
      direcciones.push(ref.direccion);
      telefonos.push(ref.telefono);
      ocupaciones.push(ref.ocupacion);
    });

    const parentesco:any = [];
    const nombre_carga:any = [];
    const nacimiento:any = [];

    informacion.informacion_adicional.carga_familiar.forEach(ref => {
      parentesco.push(ref.parentesco);
      nombre_carga.push(ref.nombre);
      nacimiento.push(moment(ref.fecha).format('DD/MM/YYYY'));
    });

    
    const emergencia_parentesco:any = []
    const emergencia_nombre:any = []
    const emergencia_direccion:any = []
    const emergencia_telefono:any = []

    informacion.informacion_adicional.emergencia.forEach(ref => {
      emergencia_parentesco.push(ref.parentesco);
      emergencia_nombre.push(ref.nombre);
      emergencia_direccion.push(ref.direccion);
      emergencia_telefono.push(ref.telefono);
    });


    const cursosFormateados = informacion.instruccion_academica.cursos.map(cursoObj => `${cursoObj.nombre} - ${cursoObj.periodo}`);

    async function GenerarPDF(){

      let fecha_nacimiento = moment(informacion.datos_personales.fecha_nac).add(1,'day').format('DD/MM/yyyy');

      const pdf = new PdfMakeWrapper();
      PdfMakeWrapper.setFonts(pdfFonts);
      pdf.pageOrientation('portrait');
      pdf.pageSize('A4');

      pdf.add(
        new Table([
          [
            new Cell(new Txt('DATOS PERSONALES').bold().alignment('center').end).fillColor('#000000').color('#FFFFFF').colSpan(6).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
          ],
          [
            new Cell(new Txt('').fontSize(1).end).border([false, false]).colSpan(6).end,
            new Cell(new Txt('').end).border([false, false]).end,
            new Cell(new Txt('').end).border([false, false]).end,
            new Cell(new Txt('').end).border([false, false]).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).border([false, false]).end,
          ],
          [
            new Cell(new Txt('Apellidos').bold().end).fillColor('#dbdbdb').colSpan(2).end,
            new Cell(new Txt(informacion.datos_personales.apellidos).end).end,
            new Cell(new Txt('Nombres').bold().end).fillColor('#dbdbdb').colSpan(2).end,
            new Cell(new Txt(informacion.datos_personales.nombres).end).end,
            new Cell(await new Img(`https://192.168.0.22/api/imagen/empleado/${informacion.datos_personales.foto}`).fit([163,200]).build()).colSpan(2).rowSpan(10).end,
            new Cell(new Txt('').bold().end).fillColor('#dbdbdb').end,
          ]
          ,
          [
            new Cell(new Txt(informacion.datos_personales.apellidos).end).colSpan(2).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt(informacion.datos_personales.nombres).end).colSpan(2).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Foto').bold().end).colSpan(2).fillColor('#dbdbdb').end,
            new Cell(new Txt('').bold().end).fillColor('#dbdbdb').end,
          ],
          [
            new Cell(new Txt('Sexo').bold().end).fillColor('#dbdbdb').end,
            new Cell(new Txt('Fecha Nac.').bold().end).fillColor('#dbdbdb').end,
            new Cell(new Txt('Cédula').bold().end).fillColor('#dbdbdb').end,
            new Cell(new Txt('Lugar Nac.').bold().end).fillColor('#dbdbdb').end,
            new Cell(new Txt('Foto').bold().end).colSpan(2).fillColor('#dbdbdb').end,
            new Cell(new Txt('').bold().end).fillColor('#dbdbdb').end,
          ]
          ,
          [
            new Cell(new Txt(informacion.datos_personales.sexo).end).end,
            new Cell(new Txt(fecha_nacimiento).end).end,
            new Cell(new Txt(informacion.datos_personales.nacimiento).end).end,
            new Cell(new Txt(informacion.datos_personales.cedula).end).end,
            new Cell(new Txt('Foto').bold().end).colSpan(2).fillColor('#dbdbdb').end,
            new Cell(new Txt('').bold().end).fillColor('#dbdbdb').end,
          ]
          ,
          [
            new Cell(new Txt('Nacionalidad').bold().end).fillColor('#dbdbdb').end,
            new Cell(new Txt('Licencia Nº').bold().end).fillColor('#dbdbdb').end,
            new Cell(new Txt('Grado').bold().end).fillColor('#dbdbdb').end,
            new Cell(new Txt('RIF').bold().end).fillColor('#dbdbdb').end,
            new Cell(new Txt('Foto').bold().end).colSpan(2).fillColor('#dbdbdb').end,
            new Cell(new Txt('').bold().end).fillColor('#dbdbdb').end,
          ],
          [
            new Cell(new Txt(informacion.datos_personales.nacionalidad).end).end,
            new Cell(new Txt(informacion.datos_personales.licencia).end).end,
            new Cell(new Txt(informacion.datos_personales.grado).end).end,
            new Cell(new Txt(informacion.datos_personales.rif).end).end,
            new Cell(new Txt('Foto').bold().end).colSpan(2).fillColor('#dbdbdb').end,
            new Cell(new Txt('').bold().end).fillColor('#dbdbdb').end,
        ],
        [
            new Cell(new Txt('Altura').bold().end).fillColor('#dbdbdb').end,
            new Cell(new Txt('Peso').bold().end).fillColor('#dbdbdb').end,
            new Cell(new Txt('Correo electrónico').bold().end).fillColor('#dbdbdb').colSpan(2).end,
            new Cell(new Txt('Correo electronico').bold().end).fillColor('#dbdbdb').end,
            new Cell(new Txt('Foto').bold().end).colSpan(2).fillColor('#dbdbdb').end,
            new Cell(new Txt('').bold().end).fillColor('#dbdbdb').end,
          ],
          [            
            new Cell(new Txt(informacion.datos_personales.altura).end).end,
            new Cell(new Txt(informacion.datos_personales.peso).end).end,
            new Cell(new Txt(informacion.datos_personales.email).end).colSpan(2).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Foto').bold().end).colSpan(2).fillColor('#dbdbdb').end,
            new Cell(new Txt('').bold().end).fillColor('#dbdbdb').end,
          ],
          [
            new Cell(new Txt('Teléfono').bold().end).fillColor('#dbdbdb').end,
            new Cell(new Txt('Celular').bold().end).fillColor('#dbdbdb').end,
            new Cell(new Txt('Estado').bold().end).colSpan(2).fillColor('#dbdbdb').end,
            new Cell(new Txt('').bold().end).fillColor('#dbdbdbz').end,
            new Cell(new Txt('Foto').bold().end).colSpan(2).fillColor('#dbdbdb').end,
            new Cell(new Txt('').bold().end).fillColor('#dbdbdb').end,
          ],
          [
            new Cell(new Txt(informacion.datos_personales.telefono).end).end,
            new Cell(new Txt(informacion.datos_personales.celular).end).end,
            new Cell(new Txt(informacion.datos_personales.estado).end).colSpan(2).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).colSpan(2).end,
            new Cell(new Txt('').end).end,
          ],
          [
            new Cell(new Txt('Instrucción').bold().end).colSpan(2).fillColor('#dbdbdb').end,
            new Cell(new Txt('').bold().end).fillColor('#dbdbdbz').end,
            new Cell(new Txt('Año').bold().end).colSpan(2).fillColor('#dbdbdb').end,
            new Cell(new Txt('').bold().end).fillColor('#dbdbdb').end,
            new Cell(new Txt('Titulo').bold().end).colSpan(2).fillColor('#dbdbdb').end,
            new Cell(new Txt('').bold().end).fillColor('#dbdbdb').end,
          ],
          [
            new Cell(new Txt(informacion.instruccion_academica.grado.instruccion).end).colSpan(2).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt(informacion.instruccion_academica.grado.ano).end).colSpan(2).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt(informacion.instruccion_academica.grado.titulo).end).colSpan(2).end,
            new Cell(new Txt('').end).end,
          ],
          [
            new Cell(new Txt('Municipio').bold().end).colSpan(2).fillColor('#dbdbdb').end,
            new Cell(new Txt('').bold().end).fillColor('#dbdbdbz').end,
            new Cell(new Txt('Parroquia').bold().end).colSpan(2).fillColor('#dbdbdb').end,
            new Cell(new Txt('').bold().end).fillColor('#dbdbdb').end,
            new Cell(new Txt('Sector/Urb.').bold().end).colSpan(2).fillColor('#dbdbdb').end,
            new Cell(new Txt('').bold().end).fillColor('#dbdbdb').end,
          ],
          [
            new Cell(new Txt(informacion.datos_personales.municipio).end).colSpan(2).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt(informacion.datos_personales.parroquia).end).colSpan(2).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt(informacion.datos_personales.sector).end).colSpan(2).end,
            new Cell(new Txt('').end).end,
          ],
          [
            new Cell(new Txt('Domicilio (Calle/Av.)').bold().end).colSpan(6).fillColor('#dbdbdb').end,
            new Cell(new Txt('').bold().end).fillColor('#dbdbdb').end,
            new Cell(new Txt('').bold().end).fillColor('#dbdbdb').end,
            new Cell(new Txt('').bold().end).fillColor('#dbdbdb').end,
            new Cell(new Txt('').bold().end).fillColor('#dbdbdb').end,
            new Cell(new Txt('').bold().end).fillColor('#dbdbdb').end,
          ],
          [
            new Cell(new Txt(informacion.datos_personales.sector).end).colSpan(6).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
          ],
          [
            new Cell(new Txt('').fontSize(1).end).border([false, false]).colSpan(6).end,
            new Cell(new Txt('').end).border([false, false]).end,
            new Cell(new Txt('').end).border([false, false]).end,
            new Cell(new Txt('').end).border([false, false]).end,
            new Cell(new Txt('').end).border([false, false]).end,
            new Cell(new Txt('').end).border([false, false]).end,
          ],
          [
            new Cell(new Txt('REFERENCIAS PERSONALES').bold().alignment('center').end).fillColor('#000000').color('#FFFFFF').colSpan(6).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
          ],
          [
            new Cell(new Txt('').fontSize(1).end).border([false, false]).colSpan(6).end,
            new Cell(new Txt('').end).border([false, false]).end,
            new Cell(new Txt('').end).border([false, false]).end,
            new Cell(new Txt('').end).border([false, false]).end,
            new Cell(new Txt('').end).border([false, false]).end,
            new Cell(new Txt('').end).border([false, false]).end,
          ],
          [
            new Cell(new Txt('Nombre').bold().end).fillColor('#dbdbdb').colSpan(2).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Dirección').bold().end).fillColor('#dbdbdb').end,
            new Cell(new Txt('Teléfono').bold().end).fillColor('#dbdbdb').end,
            new Cell(new Txt('Ocupación').bold().end).fillColor('#dbdbdb').colSpan(2).end,
            new Cell(new Txt('').end).end,
          ],
          [
            new Cell(new Stack(nombres).end).colSpan(2).end,
            new Cell(new Txt('').end).end,
            new Cell(new Stack(direcciones).end).end,
            new Cell(new Stack(telefonos).end).end,
            new Cell(new Stack(ocupaciones).end).colSpan(2).end,
            new Cell(new Txt('').end).end,
          ],
          [
            new Cell(new Txt('').fontSize(1).end).border([false, false]).colSpan(6).end,
            new Cell(new Txt('').end).border([false, false]).end,
            new Cell(new Txt('').end).border([false, false]).end,
            new Cell(new Txt('').end).border([false, false]).end,
            new Cell(new Txt('').end).border([false, false]).end,
            new Cell(new Txt('').end).border([false, false]).end,
          ],
          [
            new Cell(new Txt('CARGA FAMILIAR').bold().alignment('center').end).fillColor('#000000').color('#FFFFFF').colSpan(6).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
          ],
          [
            new Cell(new Txt('').fontSize(1).end).border([false, false]).colSpan(6).end,
            new Cell(new Txt('').end).border([false, false]).end,
            new Cell(new Txt('').end).border([false, false]).end,
            new Cell(new Txt('').end).border([false, false]).end,
            new Cell(new Txt('').end).border([false, false]).end,
            new Cell(new Txt('').end).border([false, false]).end,
          ],
          [
            new Cell(new Txt('Parentesco').bold().end).fillColor('#dbdbdb').colSpan(2).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Nombre').bold().end).colSpan(2).fillColor('#dbdbdb').end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Fecha de nacimiento').bold().end).colSpan(2).fillColor('#dbdbdb').end,
            new Cell(new Txt('').end).fillColor('#dbdbdb').end,
          ],
          [
            new Cell(new Stack(parentesco).end).colSpan(2).end,
            new Cell(new Txt('').end).end,
            new Cell(new Stack(nombre_carga).end).colSpan(2).end,
            new Cell(new Txt('').end).end,
            new Cell(new Stack(nacimiento).end).colSpan(2).end,
            new Cell(new Txt('').end).end,
          ],
          [
            new Cell(new Txt('').fontSize(1).end).border([false, false]).colSpan(6).end,
            new Cell(new Txt('').end).border([false, false]).end,
            new Cell(new Txt('').end).border([false, false]).end,
            new Cell(new Txt('').end).border([false, false]).end,
            new Cell(new Txt('').end).border([false, false]).end,
            new Cell(new Txt('').end).border([false, false]).end,
          ],
          [
            new Cell(new Txt('CONTACTO EN CASO DE EMERGENCIA').bold().alignment('center').end).fillColor('#000000').color('#FFFFFF').colSpan(6).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
          ],
          [
            new Cell(new Txt('').fontSize(1).end).border([false, false]).colSpan(6).end,
            new Cell(new Txt('').end).border([false, false]).end,
            new Cell(new Txt('').end).border([false, false]).end,
            new Cell(new Txt('').end).border([false, false]).end,
            new Cell(new Txt('').end).border([false, false]).end,
            new Cell(new Txt('').end).border([false, false]).end,
          ],
          [
            new Cell(new Txt('Parentesco').bold().end).fillColor('#dbdbdb').end,
            new Cell(new Txt('Nombre').bold().end).colSpan(2).fillColor('#dbdbdb').end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Dirección').bold().end).colSpan(2).fillColor('#dbdbdb').end,
            new Cell(new Txt('').end).fillColor('#dbdbdb').end,
            new Cell(new Txt('Teléfono').bold().end).fillColor('#dbdbdb').end,
          ],
          [
            new Cell(new Stack(emergencia_parentesco).end).end,
            new Cell(new Stack(emergencia_nombre).end).colSpan(2).end,
            new Cell(new Txt('').end).end,
            new Cell(new Stack(emergencia_direccion).end).colSpan(2).end,
            new Cell(new Txt('').end).end,
            new Cell(new Stack(emergencia_telefono).end).end,
          ],
          [
            new Cell(new Txt('').fontSize(1).end).border([false, false]).colSpan(6).end,
            new Cell(new Txt('').end).border([false, false]).end,
            new Cell(new Txt('').end).border([false, false]).end,
            new Cell(new Txt('').end).border([false, false]).end,
            new Cell(new Txt('').end).border([false, false]).end,
            new Cell(new Txt('').end).border([false, false]).end,
          ],
          [
            new Cell(new Txt('CURSOS REALIZADOS').bold().alignment('center').end).fillColor('#000000').color('#FFFFFF').colSpan(6).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
          ],
          [
            new Cell(new Txt('').fontSize(1).end).border([false, false]).colSpan(6).end,
            new Cell(new Txt('').end).border([false, false]).end,
            new Cell(new Txt('').end).border([false, false]).end,
            new Cell(new Txt('').end).border([false, false]).end,
            new Cell(new Txt('').end).border([false, false]).end,
            new Cell(new Txt('').end).border([false, false]).end,
          ],
          [
            new Cell(new Txt('Curso').bold().end).fillColor('#dbdbdb').colSpan(6).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
          ],
          [
            new Cell(new Stack(cursosFormateados).end).colSpan(6).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
          ],
        ]).widths(['16.6%','16.6%','16.6%','16.6%','16.6%','16.6%',]).end
      )

      pdf.create().download()
    }

    GenerarPDF()

  }

}
