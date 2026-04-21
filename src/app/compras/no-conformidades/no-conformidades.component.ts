import { Component } from '@angular/core';
import * as moment from 'moment';
import { Cell, Img, PdfMakeWrapper, Table, Txt } from 'pdfmake-wrapper';
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { RecepcionService } from 'src/app/services/recepcion.service';
import { SubirArchivosService } from 'src/app/services/subir-archivos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-no-conformidades',
  standalone: false,templateUrl: './no-conformidades.component.html',
  styleUrls: ['./no-conformidades.component.scss']
})
export class NoConformidadesComponent {

  constructor(public recepciones:RecepcionService,
              public subir:SubirArchivosService
  ){}

  public nueva = false;
  selectedFile: File | null = null;
  index_selected!:number;

  onFileSelected(event: Event, index:number) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.index_selected = index
    }
  }


  verPlan(plan){
    const url = `https://192.168.0.22/api/imagen/plan/${plan}`;
    
    // Create an anchor element
    const link = document.createElement('a');
    link.href = url;
    link.download = `plan_${plan}.pdf`; // Specify the default filename for the downloaded file
    
    // Append the link to the body (required for Firefox)
    document.body.appendChild(link);
    
    // Programmatically click the link to trigger the download
    link.click();
    
    // Remove the link from the document
    document.body.removeChild(link);
  }

  async onUpload(documento) {
    if (this.selectedFile) {
      const tipo = 'plan'; // Set the type as needed
      const id = `${documento.recepcion.documento.replace(/\s+/g, '')}_${documento.recepcion.OC.replace(/\s+/g, '')}`;

      const result = await this.subir.actualizarFoto(this.selectedFile, tipo, id);
      if (result) {

        console.log('Upload successful:', result);

        documento.status = 'Seguimiento';
        documento.plan = result
        this.recepciones.GuardarReclamos(documento);
    
        setTimeout(() => {
            Swal.fire({
                title: 'Se notificó a proveedor no conformidad',
                icon: 'success',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 5000,
                timerProgressBar: true
            });
          },1000)

      } else {
        console.error('Upload failed');
      }
    }
  }

  openOutlook() {
  const email = 'recipient@example.com';
  const subject = 'Asunto del correo';
  const body = 'Este es el cuerpo del correo';
  
  window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

  notificar(reclamo) {
    let email = '';
    const subject = `⚠️ No conformidad ❌ ${reclamo.recepcion.materiales[reclamo.index_producto][0].material.nombre} (${reclamo.recepcion.materiales[reclamo.index_producto][0].material.fabricante.alias})`;
    
    // Determine the current hour
    const currentHour = new Date().getHours();
    const greeting = currentHour < 12 ? 'Buenos días' : 'Buenas tardes';

    // Create a formal HTML body for the email
    const body = `
                ${greeting},
                Nos dirigimos a usted para notificarle sobre una no conformidad relacionada con el producto ${reclamo.recepcion.materiales[reclamo.index_producto][0].material.nombre} (${reclamo.recepcion.materiales[reclamo.index_producto][0].material.fabricante.alias}).

                Observación: ${reclamo.observacion}
                Por favor, no dude en ponerse en contacto con nosotros si necesita más información.
                Saludos.
    `;

    reclamo.recepcion.proveedor.contactos.forEach((contacto) => {
        email = email + `${contacto.email},`;
    });
    
    reclamo.status = 'Notificado';
    this.recepciones.GuardarReclamos(reclamo);
    
    setTimeout(() => {
        Swal.fire({
            title: 'Se notificó a proveedor no conformidad',
            icon: 'success',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 5000,
            timerProgressBar: true
        });

        // Open the default mail client
        window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }, 1000);
}

  ProductoNoConforme(recepcion, materiales, observacion){

    console.log(recepcion)
    let reception = moment(recepcion.recepcion).format('DD/MM/YYYY')
    
    const pdf = new PdfMakeWrapper();
    PdfMakeWrapper.setFonts(pdfFonts);
    pdf.pageOrientation('portrait');
    pdf.pageSize('A4');

    async function generarPDF(){
      pdf.add(
        new Table([
          [
            new Cell(await new Img('../../assets/poli_cintillo.png').width(60).margin([0, 5,0,0]).build()).alignment('center').rowSpan(4).end,
            new Cell(new Txt(`
            FORMATO DE NO CONFORMIDAD \n DEL MATERIAL RECIBIDO
            `).bold().end).alignment('center').fontSize(9).rowSpan(4).end,
            new Cell(new Txt('Código: FAL-002').end).fillColor('#dedede').fontSize(5).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('N° de Revisión: 1').end).fillColor('#dedede').fontSize(5).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Fecha de Revisión: 03/08/2023').end).fillColor('#dedede').fontSize(5).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Página: 1 de 1').end).fillColor('#dedede').fontSize(5).alignment('center').end,
          ],
        ]).widths(['25%','50%','25%']).end
      )


      pdf.add(
        pdf.ln(1)
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('').end).alignment('center').border([false,false]).end,
            new Cell(new Txt('Nº NO CONFORMIDAD').end).alignment('center').color('#FFFFFF').fillColor('#000000').fontSize(8).end,
          ]
        ]).widths(['80%','20%']).end
      )
      pdf.add(
        new Table([
          [
            new Cell(new Txt('').end).alignment('center').border([false,false]).end,
            new Cell(new Txt(`NCC-24-${observacion.numero}`).end).alignment('center').end,
          ]
        ]).widths(['80%','20%']).end
      )

      pdf.add(
        pdf.ln(1)
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('DETALLES DEL PRODUCTO').end).alignment('center').color('#FFFFFF').fillColor('#000000').fontSize(8).end,
          ]
        ]).widths(['100%']).end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('').end).end
          ]
        ]).layout('noBorders').widths(['100%']).end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('Proveedor').end).fillColor('#d3d3d3').end,
            new Cell(new Txt(`${recepcion.proveedor.nombre}`).end).end,
            new Cell(new Txt('Documento').end).fillColor('#d3d3d3').end,
            new Cell(new Txt(recepcion.documento).end).end
          ],
          [
            new Cell(new Txt('Producto').end).fillColor('#d3d3d3').end,
            new Cell(new Txt(`${materiales[0].material.nombre} (${materiales[0].material.fabricante.alias})`).end).end,
            new Cell(new Txt('Lote').end).fillColor('#d3d3d3').end,
            new Cell(new Txt(materiales[0].lote).end).end
          ],
          [
            new Cell(new Txt('Fecha').end).fillColor('#d3d3d3').end,
            new Cell(new Txt(reception).end).end,
            new Cell(new Txt('Orden Nº').end).fillColor('#d3d3d3').end,
            new Cell(new Txt(recepcion.OC).end).end
          ]
        ]).widths(['15%','35%','15%','35%']).end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('').end).end
          ]
        ]).layout('noBorders').widths(['100%']).end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('DETALLES DE LA NO CONFORMIDAD').end).alignment('center').color('#FFFFFF').fillColor('#000000').fontSize(8).end,
          ]
        ]).widths(['100%']).end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('').end).end
          ]
        ]).layout('noBorders').widths(['100%']).end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt(observacion.observacion).end).border([false, false]).end
          ]
        ]).widths(['100%']).end
      )


      pdf.create().download(`${materiales[0].material.nombre}(${materiales[0].material.fabricante.alias})_${materiales[0].lote}`)
    }
    generarPDF();
  }

  dias_desdeNotificacion(fecha) {
    // Parse the input date
    const fechaNotificacion:any = new Date(fecha);
    
    // Get today's date
    const hoy:any = new Date();

    // Calculate the difference in milliseconds
    const diferencia = hoy - fechaNotificacion;

    // Convert milliseconds to days
    const diasPasados = Math.floor(diferencia / (1000 * 60 * 60 * 24));

    return diasPasados;
}



}
