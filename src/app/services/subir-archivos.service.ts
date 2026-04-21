import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class SubirArchivosService {

  constructor() { }

  async actualizarFoto(
    archivo:File,
    tipo:'analisis'|'producto'|'empleado'|'plan',
    id:string
  ) {
    try{
      
      const url = `https://192.168.0.22/api/upload/${tipo}/${id}`;
      const formData = new FormData(); 
      formData.append('archivo', archivo);

      const resp = await fetch( url ,{
        method:'PUT',
        body: formData
      });

      const data = await resp.json();
      return data.img;


    } catch(error){
      // console.log(error)
      return false;
    }

  }
}
