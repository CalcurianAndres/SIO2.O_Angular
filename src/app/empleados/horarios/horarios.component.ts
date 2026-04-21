import { Component, OnInit } from '@angular/core';
import { HorariosService } from 'src/app/services/horarios.service';
import { OproduccionService } from 'src/app/services/oproduccion.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-horarios',
  standalone: false,templateUrl: './horarios.component.html',
  styleUrls: ['./horarios.component.scss']
})
export class HorariosComponent  {

  constructor(public api:HorariosService, 
              public order:OproduccionService
  ){
  
  }

  public nuevo:boolean = false;

  horario = {
    nombre:'',
    de:'',
    a:'',
    inicio:'',
    fin:''
  }

  horarios = [
    { nombre: 'Planta', de: '07:00', a: '15:40', inicio: 'Lunes', fin: 'Viernes', default: true },
    { nombre: 'Contabilidad', de: '8:00', a: '16:00', inicio: 'Lunes', fin: 'Viernes', default: false },
    { nombre: 'Especial', de: '18:00', a: '20:00', inicio: 'Martes', fin: 'Jueves', default: false },
  ]

  editar(horario){
    this.horario = horario;
    this.nuevo = true;
  }

  borrar(horario){

    Swal.fire({
      title: "¿Seguro que quieres eliminar este horario?",
      showCancelButton: true,
      confirmButtonText: "Confimar",
      confirmButtonColor:'#3ec487',
      cancelButtonText:'Cancelar'
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        this.api.eliminarHorario(horario)
        setTimeout(() => {
          Swal.fire({
            text:this.api.mensaje.mensaje,
            icon:this.api.mensaje.icon,
            timer:5000,
            showConfirmButton:false,
            toast:true,
            position:'top-end',
            timerProgressBar:true
          })
        }, 500);
      }
    });

  }
  
  setDefault(horarioSeleccionado) {
    this.api.horarios.forEach(horario => {
      horario.default = (horario === horarioSeleccionado);
    });
  
    // Emitir el evento para actualizar el servidor
    this.api.guardarHorarios(horarioSeleccionado)
  }  



  months: string[] = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  weekdays: string[] = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  currentYear: number = new Date().getFullYear();


  // Obtener los días en un mes, incluyendo el día de la semana en que comienza
  getDaysInMonth(month: number): any[] {
    const daysInMonth = new Date(this.currentYear, month + 1, 0).getDate();
    const firstDay = new Date(this.currentYear, month, 7).getDay(); // Día de la semana en que comienza el mes

    const daysArray = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      weekday: (firstDay + i) % 7 // Calcular el día de la semana correspondiente
    }));

    return daysArray;
  }

  // Función para saber si un día es no laboral
  isNonLaboral(month: number, day: number): boolean {
    const currentYear = new Date().getFullYear(); // Obtiene el año actual

    // Encuentra el calendario del año actual
    let calendario_actual = this.api.calendario.find(calendario => calendario.year === this.currentYear);

    // Verifica si se encontró un calendario y luego busca en los días
    if (calendario_actual) {
        return calendario_actual.dias.some(dia => 
            dia.month === month && // Recuerda que los meses en JavaScript son 0-indexados
            dia.day === day && 
            !dia.laboral
        );
    }

    // Si no se encuentra un calendario, retornar false (o manejarlo de otra manera)
    return false;
}

  // Función para obtener el motivo del día no laboral
  getMotivo(month: number, day: number): string {

    // Encuentra el calendario del año actual
    let calendario_actual = this.api.calendario.find(calendario => calendario.year === this.currentYear);

    // Verifica si se encontró un calendario
    if (calendario_actual) {
        const dia = calendario_actual.dias.find(dia => 
            dia.month === month && // Asegúrate de usar month + 1, ya que el modelo usa meses 1-indexados
            dia.day === day
        );
        return dia ? dia.motivo : ''; // Retorna el motivo si existe, de lo contrario retorna una cadena vacía
    }

    // Si no se encuentra un calendario, retornar una cadena vacía
    return '';
}

selectYear(year: number): void {
  this.currentYear = year;
  // Aquí puedes agregar lógica adicional para manejar el cambio de año
  console.log('Año seleccionado:', this.currentYear);
}

  // Función para seleccionar/deseleccionar un día
toggleDaySelection(month: number, day: number): void {

  const no_laboral = this.isNonLaboral(month, day)

    if(no_laboral){
      Swal.fire({
        title: '¿Desmarcar este día como no laboral?',
        text: 'Este día ya está marcado como no laboral. ¿Quieres volver a marcarlo como laboral?',
        showCancelButton: true,
        confirmButtonText: 'Sí, desmarcar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#48c78e',
        cancelButtonColor: '#f03a5f',
      }).then((result) => {
        if (result.isConfirmed) {
          this.removeNonWorkingDay(month, day);  // Llama a la función para eliminar el día no laboral
        }
      });

    }else{
      Swal.fire({
        title: '¿Marcar este día como no laboral?',
        input: 'text',
        inputPlaceholder: 'Escriba el motivo',
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor:'#48c78e',
        cancelButtonColor:'#f03a5f',
        preConfirm: (motivo) => {
          if (!motivo) {
            Swal.showValidationMessage('El motivo es obligatorio');
          }
          return motivo;
        }
      }).then((result) => {
        if (result.isConfirmed && result.value) {
          const motivo = result.value;
          this.saveNonWorkingDay(month, day, motivo);  // Llama a la función para guardar el día no laboral
        }
      });
    }

}

removeNonWorkingDay(month: number, day: number) {
  const nonWorkingDay = {
    month,
    day,
    year: this.currentYear,  // Asumiendo que tienes el año en el componente
    laboral: true  // Cambia el estado del día a laboral
  };

  // Emitimos el evento al servidor para actualizar el día como laboral
  this.api.guardarCalendario(nonWorkingDay);  // O una función específica para eliminar, según tu API

  // Alerta de éxito
  Swal.fire({
    icon: 'success',
    title: 'Día no laboral eliminado',
    text: `El día ${day}/${this.months[month]} ha sido marcado como laboral nuevamente.`,
    showConfirmButton: false,
    timer: 5000,
    toast: true,
    timerProgressBar: true,
    position: 'top-end'
  });
}

saveNonWorkingDay(month: number, day: number, motivo: string) {
  const nonWorkingDay = {
    month,
    day,
    year: this.currentYear,  // Asumiendo que tienes el año en el componente
    motivo,
    laboral: false
  };

  // Emitimos el evento al servidor para guardar el día no laboral
  this.api.guardarCalendario(nonWorkingDay);

  let color = 0;
let date = new Date(`${this.currentYear}-${month + 1}-${day}`);
let first = -1;

// Iteramos por cada orden
for (let orden of this.order.orden) {
  color++; // Contamos las órdenes
  
  // Iteramos por cada fase de la orden
  for (let i = 0; i < orden.fases.length; i++) {
    let fase = orden.fases[i];
    let inicio = new Date(fase.fases[0].fecha);
    let final = new Date(fase.fases[0].final);

    
    // Verificamos si la fecha está dentro del rango de la fase
    if (date >= inicio && date <= final) {
      // Si es la primera vez que encontramos una fase con el rango, ajustamos la fecha
      if (first === -1) {
        first = i; // Guardamos el índice de la primera fase encontrada
        // Si la fecha es igual o antes que la fecha de inicio, se ajusta la fecha de inicio
        console.log(orden.fases[i].fases[0].fecha)
        console.log(orden.fases[i].fases[0].final)
        if (date <= inicio) {
          // Asegúrate de no modificar la fecha original de 'inicio'
          const nuevaFechaInicio = new Date(inicio);
          nuevaFechaInicio.setDate(nuevaFechaInicio.getDate() + 1);
          orden.fases[i].fases[0].fecha = nuevaFechaInicio;
        } else {
          // Asegúrate de no modificar la fecha original de 'final'
          const nuevaFechaFinal = new Date(final);
          nuevaFechaFinal.setDate(nuevaFechaFinal.getDate() + 1);
          orden.fases[i].fases[0].final = nuevaFechaFinal;
          alert(nuevaFechaFinal)
        }

        console.log(orden.fases[i].fases[0].fecha)
        console.log(orden.fases[i].fases[0].final)
      } else {
        // Si ya encontramos una fase en el rango, continuamos con las fases siguientes
        if (i > first) {
          // Ajustamos las fechas de las fases siguientes
          orden.fases[i].fases[0].fecha = new Date(orden.fases[i].fases[0].fecha.setDate(orden.fases[i].fases[0].fecha.getDate() + 1));
          orden.fases[i].fases[0].final = new Date(orden.fases[i].fases[0].final.setDate(orden.fases[i].fases[0].final.getDate() + 1));
        }
      }
    }
  }
  
  // Llamamos al método EditarOrden para actualizar la orden en la base de datos
  console.log(orden)
  this.order.EditarOrden_(orden);
}

  // Alerta de éxito
  Swal.fire({
    icon: 'success',
    title: 'Día no laboral guardado',
    text: `El día ${day}/${this.months[month]} ha sido marcado como no laboral.`,
    showConfirmButton: false,
    timer: 5000,
    toast:true,
    timerProgressBar:true,
    position:'top-end'
  });
}

marcarDiaDeLaSemanaNoLaboral(diaSemana: any): void {
  diaSemana = Number(diaSemana)

  const calendario_actual = this.api.calendario.find(calendario => calendario.year === this.currentYear);

  // if (!calendario_actual) {
  //   // Si no existe un calendario para el año actual, se debe crear uno primero
  //   this.api.crearCalendario(this.currentYear); // Suponiendo que esta función exista
  //   return;
  // }

  // Verifica si los días de la semana ya están marcados
  const diasMarcados = calendario_actual.dias.some(dia => new Date(this.currentYear, dia.month - 1, dia.day).getDay() === diaSemana && !dia.laboral);

  if (diasMarcados) {
    console.log(`Los días ${diaSemana} ya están marcados como no laborales.`);
    return;
  }

  // Si no están marcados, los añadimos
  for (let month = 0; month < 12; month++) {
    const daysInMonth = new Date(this.currentYear, month + 1, 0).getDate(); // Días en el mes
    const firstDay = new Date(this.currentYear, month, 1).getDay(); // Primer día del mes

    for (let i = 0; i < daysInMonth; i++) {
      const dayOfWeek = (firstDay + i) % 7;

      if (dayOfWeek === diaSemana) { // Si coincide con el día de la semana proporcionado
        // Marcar el día como no laboral
        this.saveNonWorkingDay(month, i + 1, `Día de descanso semanal (día ${diaSemana})`);
      }
    }
  }

  console.log(`Se marcaron todos los días ${diaSemana} como no laborales.`);
}


}
interface Dia {
  month: number;
  day: number;
  motivo: string;
  laboral: boolean;
}