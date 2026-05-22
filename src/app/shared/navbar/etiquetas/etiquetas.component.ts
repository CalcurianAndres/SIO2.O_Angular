import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PdfMakeWrapper } from 'pdfmake-wrapper';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import pdfFonts from '../../../../assets/fonts/custom';

@Component({
  selector: 'app-etiquetas',
  standalone: false,
  templateUrl: './etiquetas.component.html',
  styleUrls: ['./etiquetas.component.scss'],
})
export class EtiquetasComponent {
  @Input() Etiquetas: any;
  @Output() onCloseModal = new EventEmitter();

  cerrar() {
    this.onCloseModal.emit();
  }

  mostrarPdf() {
    PdfMakeWrapper.setFonts(pdfFonts, {
      Gilroy: {
        normal: 'Gilroy-Light.otf',
        bold: 'Gilroy-ExtraBold.otf',
        italics: 'Gilroy-ExtraBold.otf',
        bolditalics: 'Gilroy-ExtraBold.otf',
      },
      Roboto: {
        normal: 'Roboto-Light.ttf',
        bold: 'Roboto-Bold.ttf',
        italics: 'Roboto-Italic.ttf',
        bolditalics: 'Roboto-Italic.ttf',
      },
    });

    PdfMakeWrapper.useFont('Gilroy');

    const pdf = new PdfMakeWrapper();

    pdf.add('Contenido de la tarjeta');
    pdf.pageSize('A7'); // O tamaño personalizado
    pdf.pageOrientation('landscape'); // Aquí se cambia la orientación

    pdf.create().getBlob((pdfBlob: Blob) => {
      const url = URL.createObjectURL(pdfBlob);
      const iframe = document.getElementById('visor') as HTMLIFrameElement;
      iframe.src = url;
    });

    this.mostrarPdf_();
  }

  mostrarPdf_() {
    PdfMakeWrapper.setFonts(pdfFonts, {
      Gilroy: {
        normal: 'Gilroy-Light.otf',
        bold: 'Gilroy-ExtraBold.otf',
        italics: 'Gilroy-ExtraBold.otf',
        bolditalics: 'Gilroy-ExtraBold.otf',
      },
      Roboto: {
        normal: 'Roboto-Light.ttf',
        bold: 'Roboto-Bold.ttf',
        italics: 'Roboto-Italic.ttf',
        bolditalics: 'Roboto-Italic.ttf',
      },
    });

    PdfMakeWrapper.useFont('Gilroy');

    const pdf = new PdfMakeWrapper();

    pdf.add('Contenido de la tarjeta');
    pdf.pageSize('A7'); // O tamaño personalizado
    pdf.pageOrientation('landscape'); // Aquí se cambia la orientación

    pdf.create().getBlob((pdfBlob: Blob) => {
      const url = URL.createObjectURL(pdfBlob);
      const iframe = document.getElementById('visor2') as HTMLIFrameElement;
      iframe.src = url;
    });
  }
}
