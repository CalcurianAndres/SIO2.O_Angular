import { Injectable } from '@angular/core';
import { WebSocketService } from './web-socket.service';
import { Mensaje } from '../compras/models/modelos-compra';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class AnalisisService {

  public mensaje!: Mensaje;
  public AnalisisTintas;
  public TintasAprobadas = 0;
  public TintasRechazadas = 0;
  public TintaAnalizadaEnElAno;
  public TintaAnalizadaEnElMes;
  public AnalisisSustrato;
  public SustratoAprobado = 0;
  public SustratoRechazado = 0;
  public SustratoAnalizadaEnElAno;
  public SustratoAnalizadaEnElMes;
  public AnalisisCajas;
  public CajasAceptadas = 0;
  public CajasRechazadas = 0;
  public CajaAnalizadaEnElAno;
  public CajaAnalizadaEnElMes;
  public AnalisisPads;
  public PadsAprobados = 0;
  public PadsRechazados = 0;
  public PadsAnalizadaEnElAno;
  public PadsAnalizadaEnElMes;
  public AnalisisOtros;
  public OtrosAprobados = 0;
  public OtrosRechazados = 0;
  public OtrosAnalizadaEnElAno;
  public OtrosAnalizadaEnElMes;
  public AnalisisEnElAno = 0;
  public AnalisisEnElMes = 0;
  public analisisAnuales = 0;
  public analisisMensuales = 0;

  public lastFives:any = []
  constructor(private socket:WebSocketService) {
    // this.BuscarAnalisisTinta()
    this.BusquedaDeTodosLosAnalisis()
   }

   BusquedaDeTodosLosAnalisis() {
    // Inicializar contadores
    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth() + 1; // Los meses en JS son 0-indexados
    
    let todosLosAnalisis: any[] = [];
  
    const incrementarContadoresFecha = (fecha: Date) => {
      const date = new Date(fecha);
      if (date.getFullYear() === currentYear) {
        this.analisisAnuales++;
        if (date.getMonth() + 1 === currentMonth) {
          this.analisisMensuales++;
        }
      }
    };
  
    const agregarAnalisis = (analisis: any[]) => {
      todosLosAnalisis = todosLosAnalisis.concat(analisis);
    };
  
    this.socket.io.emit('CLIENTE:BuscarAnalisisTinta');
    this.socket.io.emit('CLIENTE:BuscarAnalisisSustrato');
    this.socket.io.emit('CLIENTE:BuscarAnalisisCajas');
    this.socket.io.emit('CLIENTE:BuscarAnalisisPads');
    this.socket.io.emit('CLIENTE:BuscarAnalisisOtros');

    this.socket.io.on('SERVIDOR:enviaMensaje', (data) => {
      this.mensaje = data
    });
  
    this.socket.io.on('SERVER:AnalisisTinta', async (AnalisisTintas_) => {
      this.AnalisisTintas = AnalisisTintas_;
      agregarAnalisis(AnalisisTintas_);
  
      AnalisisTintas_.forEach((tinta: any) => {
        incrementarContadoresFecha(tinta.updatedAt);
        if (tinta.resultado.resultado === 'APROBADO') {
          this.TintasAprobadas++;
        } else if (tinta.resultado.resultado === 'RECHAZADO') {
          this.TintasRechazadas++;
        }
      });
    });
  
    this.socket.io.on('SERVER:AnalisisSustrato', async (AnalisisSustratos) => {
      this.AnalisisSustrato = AnalisisSustratos;
      agregarAnalisis(AnalisisSustratos);
  
      AnalisisSustratos.forEach((sustrato: any) => {
        incrementarContadoresFecha(sustrato.updatedAt);
        if (sustrato.resultado.resultado === 'APROBADO') {
          this.SustratoAprobado++;
        } else if (sustrato.resultado.resultado === 'RECHAZADO') {
          this.SustratoRechazado++;
        }
      });
    });
  
    this.socket.io.on('SERVER:AnalisisCajas', async (AnalisisCajas) => {
      this.AnalisisCajas = AnalisisCajas;
      agregarAnalisis(AnalisisCajas);
  
      AnalisisCajas.forEach((cajas: any) => {
        incrementarContadoresFecha(cajas.updatedAt);
        if (cajas.resultado.resultado === 'APROBADO') {
          this.CajasAceptadas++;
        } else if (cajas.resultado.resultado === 'RECHAZADO') {
          this.CajasRechazadas++;
        }
      });
    });
  
    this.socket.io.on('SERVER:AnalisisPads', async (AnalisisPads) => {
      this.AnalisisPads = AnalisisPads;
      agregarAnalisis(AnalisisPads);
  
      AnalisisPads.forEach((pad: any) => {
        incrementarContadoresFecha(pad.updatedAt);
        if (pad.resultado.resultado === 'APROBADO') {
          this.PadsAprobados++;
        } else if (pad.resultado.resultado === 'RECHAZADO') {
          this.PadsRechazados++;
        }
      });
    });
  
    this.socket.io.on('SERVER:AnalisisOtros', async (AnalisisOtro) => {
      this.AnalisisOtros = AnalisisOtro;
      agregarAnalisis(AnalisisOtro);
  
      AnalisisOtro.forEach((otro: any) => {
        incrementarContadoresFecha(otro.updatedAt);
        if (otro.resultado.resultado === 'APROBADO') {
          this.OtrosAprobados++;
        } else if (otro.resultado.resultado === 'RECHAZADO') {
          this.OtrosRechazados++;
        }
      });
  
      // Ordenar todos los análisis por updatedAt en orden descendente y obtener los últimos 5
      const ultimosCincoAnalisis = todosLosAnalisis
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5);
  
        this.lastFives = ultimosCincoAnalisis;
        console.log(this.lastFives)
    });
  }
  


   BuscarAnalisis(targetId){
    // Buscar en el primer arreglo
const result1 = this.AnalisisTintas.find(item => item._id === targetId);

// Buscar en el segundo arreglo
const result2 = this.AnalisisSustrato.find(item => item._id === targetId);

// Buscar en el tercer arreglo
const result3 = this.AnalisisCajas.find(item => item._id === targetId);

// Buscar en el cuarto arreglo
const result4 = this.AnalisisPads.find(item => item._id === targetId);

// Buscar en el quinto arreglo
const result5 = this.AnalisisOtros.find(item => item._id === targetId);

// Verificar los resultados
if (result1) {
  return result1;
}
if (result2) {
  return result2;
}
if (result3) {
  return result3;
}
if (result4) {
  return result4;
}
if (result5) {
  return result5;
}

   }

   calcularAnualYMensual(){
    this.AnalisisEnElAno = (this.TintaAnalizadaEnElAno + this.SustratoAnalizadaEnElAno) + (this.CajaAnalizadaEnElAno + this.PadsAnalizadaEnElAno) + this.OtrosAnalizadaEnElAno;
    this.AnalisisEnElMes = (this.TintaAnalizadaEnElMes + this.SustratoAnalizadaEnElMes) + (this.CajaAnalizadaEnElMes + this.PadsAnalizadaEnElMes) + this.OtrosAnalizadaEnElMes;
   }

  BuscarAnalisisTinta(){
    this.AnalisisEnElAno = 0;
    this.AnalisisEnElMes = 0;

    this.socket.io.on('SERVIDOR:enviaMensaje', (data) => {
      this.mensaje = data
    });

    this.socket.io.emit('CLIENTE:BuscarAnalisisTinta');

    this.socket.io.on('SERVER:AnalisisTinta', async(AnalisisTinta)=>{
      this.AnalisisTintas = AnalisisTinta;

      // Obtener el año actual
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

// Filtrar los AnalisisTintas con resultado APROBADOS y RECHAZADOS en el año actual
const aprobados = this.AnalisisTintas.filter(analisis => 
    analisis.resultado.resultado === 'APROBADO' && new Date(analisis.createdAt).getFullYear() === year
);

const rechazados = this.AnalisisTintas.filter(analisis => 
    analisis.resultado.resultado === 'RECHAZADO' && new Date(analisis.createdAt).getFullYear() === year
);

const analisisMes = this.AnalisisTintas.filter(analisis => new Date(analisis.createdAt).getMonth() === month);

// Contar la cantidad de AnalisisTintas con resultado APROBADOS y RECHAZADOS
this.TintasAprobadas = aprobados.length;
this.TintasRechazadas = rechazados.length;
this.TintaAnalizadaEnElAno = aprobados.length + rechazados.length
this.TintaAnalizadaEnElMes =  analisisMes.length
this.calcularAnualYMensual()
    })

    this.socket.io.emit('CLIENTE:BuscarAnalisisSustrato');
    this.socket.io.on('SERVER:AnalisisSustrato', async(AnalisisSustrato)=>{
      this.AnalisisSustrato = AnalisisSustrato;

            // Obtener el año actual
            const currentDate = new Date();
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();

// Filtrar los AnalisisTintas con resultado APROBADOS y RECHAZADOS en el año actual
const aprobados = this.AnalisisSustrato.filter(analisis => 
    analisis.resultado.resultado === 'APROBADO' && new Date(analisis.createdAt).getFullYear() === year
);

const rechazados = this.AnalisisSustrato.filter(analisis => 
    analisis.resultado.resultado === 'RECHAZADO' && new Date(analisis.createdAt).getFullYear() === year
);

const analisisMes = this.AnalisisSustrato.filter(analisis => new Date(analisis.createdAt).getMonth() === month);

// Contar la cantidad de AnalisisTintas con resultado APROBADOS y RECHAZADOS
this.SustratoAprobado = aprobados.length;
this.SustratoRechazado = rechazados.length;
this.SustratoAnalizadaEnElAno = aprobados.length + rechazados.length
this.SustratoAnalizadaEnElMes = analisisMes.length
this.calcularAnualYMensual()
    })

    this.socket.io.emit('CLIENTE:BuscarAnalisisCajas');
    this.socket.io.on('SERVER:AnalisisCajas', async(AnalisisCajas)=>{
      this.AnalisisCajas = AnalisisCajas;

                  // Obtener el año actual
                  const currentDate = new Date();
                  const year = currentDate.getFullYear();
                  const month = currentDate.getMonth();

// Filtrar los AnalisisTintas con resultado APROBADOS y RECHAZADOS en el año actual
const aprobados = this.AnalisisCajas.filter(analisis => 
    analisis.resultado.resultado === 'APROBADO' && new Date(analisis.createdAt).getFullYear() === year
);

const rechazados = this.AnalisisCajas.filter(analisis => 
    analisis.resultado.resultado === 'RECHAZADO' && new Date(analisis.createdAt).getFullYear() === year
);

const analisisMes = this.AnalisisCajas.filter(analisis => new Date(analisis.createdAt).getMonth() === month);


// Contar la cantidad de AnalisisTintas con resultado APROBADOS y RECHAZADOS
this.CajasAceptadas = aprobados.length;
this.CajasRechazadas = rechazados.length;
this.CajaAnalizadaEnElAno = aprobados.length + rechazados.length
this.CajaAnalizadaEnElMes = analisisMes.length
this.calcularAnualYMensual()
    })

    this.socket.io.emit('CLIENTE:BuscarAnalisisPads');
    this.socket.io.on('SERVER:AnalisisPads', async(AnalisisPads)=>{
      this.AnalisisPads = AnalisisPads;
      
                      // Obtener el año actual
                      const currentDate = new Date();
                      const year = currentDate.getFullYear();
                      const month = currentDate.getMonth();

// Filtrar los AnalisisTintas con resultado APROBADOS y RECHAZADOS en el año actual
const aprobados = this.AnalisisPads.filter(analisis => 
    analisis.resultado.resultado === 'APROBADO' && new Date(analisis.createdAt).getFullYear() === year
);

const rechazados = this.AnalisisPads.filter(analisis => 
    analisis.resultado.resultado === 'RECHAZADO' && new Date(analisis.createdAt).getFullYear() === year
);

const analisisMes = this.AnalisisPads.filter(analisis => new Date(analisis.createdAt).getMonth() === month);


// Contar la cantidad de AnalisisTintas con resultado APROBADOS y RECHAZADOS
this.PadsAprobados = aprobados.length;
this.PadsRechazados = rechazados.length;
this.PadsAnalizadaEnElAno = aprobados.length + rechazados.length
this.PadsAnalizadaEnElMes = analisisMes.length
this.calcularAnualYMensual()
    })

    this.socket.io.emit('CLIENTE:BuscarAnalisisOtros');
    this.socket.io.on('SERVER:AnalisisOtros', async(AnalisisOtros)=>{
      this.AnalisisOtros = AnalisisOtros;
                            // Obtener el año actual
                            const currentDate = new Date();
                            const year = currentDate.getFullYear();
                            const month = currentDate.getMonth();

// Filtrar los AnalisisTintas con resultado APROBADOS y RECHAZADOS en el año actual
const aprobados = this.AnalisisOtros.filter(analisis => 
    analisis.resultado.resultado === 'APROBADO' && new Date(analisis.createdAt).getFullYear() === year
);

const rechazados = this.AnalisisOtros.filter(analisis => 
    analisis.resultado.resultado === 'RECHAZADO' && new Date(analisis.createdAt).getFullYear() === year
);

const analisisMes = this.AnalisisPads.filter(analisis => new Date(analisis.createdAt).getMonth() === month);


// Contar la cantidad de AnalisisTintas con resultado APROBADOS y RECHAZADOS
this.OtrosAprobados = aprobados.length;
this.OtrosRechazados = rechazados.length;
this.OtrosAnalizadaEnElAno = aprobados.length + rechazados.length
this.OtrosAnalizadaEnElMes = analisisMes.length
this.calcularAnualYMensual()
    })
  
  }

  buscarAnalisisPorID(id){
    return this.AnalisisTintas.find(x => x._id === id)
  } 

  buscarAnalisisSustratoPorID(id){
    return this.AnalisisSustrato.find(x => x._id === id)
  }

  buscarAnalisisCajasPorID(id){
    return this.AnalisisCajas.find(x => x._id === id)
  }

  buscarAnalisisPadsPorID(id){
    return this.AnalisisPads.find(x => x._id === id)
  }

  buscarAnalisisOtrosPorID(id){
    return this.AnalisisOtros.find(x => x._id === id)
  }

  EnvarAnalisis(data, recepcion, index){
    const Data = {
      data,
      recepcion,
      index
    }
    this.socket.io.emit('CLIENTE:AnalisisTinta', Data)
  }

  EnviarAnalisisPreparacion(data, recepcion, index){
    const Data = {
      data,
      recepcion,
      index
    }
    this.socket.io.emit('CLIENTE:AnalisisPreparacion', Data)
  }

  EnviarAnalisisSustrato(data, recepcion, index){
    const Data = {
      data,
      recepcion,
      index
    }
    this.socket.io.emit('CLIENTE:AnalisisSustrato', Data)
  }

  EnviarAnalisisCajas(data, recepcion, index){
    const Data = {
      data,
      recepcion,
      index
    }
    this.socket.io.emit('CLIENTE:AnalisisCajas', Data)
  }

  EnviarAnalisisPads(data, recepcion, index){
    const Data = {
      data,
      recepcion,
      index
    }
    this.socket.io.emit('CLIENTE:AnalisisPads', Data)
  }

  EnviarAnalisisOtros(data, recepcion, index){
    const Data = {
      data,
      recepcion,
      index
    }
    this.socket.io.emit('CLIENTE:AnalisisOtros', Data)
  }

  buscarAnalisisPorFechas(desde: any, hasta: any) {
    console.log(desde, '-', hasta);
    
    const analisisFiltrados = this.AnalisisTintas.filter((analisis) => {
        const fecha_moment = moment(analisis.createdAt).format('yyyy-MM-DD');
        const fecha = Date.parse(fecha_moment);
        console.log(fecha);
        return fecha >= desde && fecha <= hasta;
    });

    return analisisFiltrados;
}



}
