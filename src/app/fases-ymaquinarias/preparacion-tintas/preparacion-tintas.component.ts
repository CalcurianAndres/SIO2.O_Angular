import { Component } from '@angular/core';
import { FormulasService } from 'src/app/services/formulas.service';
import { MaterialesService } from 'src/app/services/materiales.service';

@Component({
  selector: 'app-preparacion-tintas',
  standalone: false,templateUrl: './preparacion-tintas.component.html',
  styleUrls: ['./preparacion-tintas.component.scss']
})
export class PreparacionTintasComponent {

  constructor(public materiales:MaterialesService,
              public formulas:FormulasService
  ){}

  public nuevo = false;
  public formulas_:any = []
  public _seBusco = false;
  public name = ''
  public formular:any = []
  public preparacion:any = ''
  public id:any = ''

  MostrarInfo(pantone, name ){
    this._seBusco = false
    this.name = name
    this.formulas_ = pantone
    this.formulas_ = this.formulas.BuscarFormulas(pantone)
    this.preparacion = pantone
    setTimeout(() => {
      this._seBusco = true
    }, 1000);
  }

  cerrar(){
    this.nuevo = false;
  }

  updateFormulas_(e){
    setTimeout(() => {
      this.formulas_ = this.formulas.BuscarFormulas(e)
    }, 1000);
  }

  editar(formula){
    this.id = formula._id;
    // material:splited[0],
    //   nombre:splited[1],
    //   marca:splited[2],
    
    let data:any = []
    console.log(formula)
    for(let i=0;i<formula.formula.length;i++){
      data.push({
        material:formula.formula[i].material._id,
        nombre:formula.formula[i].material.nombre,
        marca:formula.formula[i].material.marca,
        cantidad:formula.formula[i].cantidad
      })

      if(i == formula.formula.length -1){

        this.formular = data;
        this.preparacion = formula.pantone;
        this.nuevo = true
      }
    }

  }
  




}
