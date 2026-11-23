import { Routes } from '@angular/router';
import { Servicios } from './pages/servicios/servicios';
import { NuevaOrden } from './pages/nueva-orden/nueva-orden';
import { Ordenes } from './pages/ordenes/ordenes';
import { OrdenDetalle } from './pages/orden-detalle/orden-detalle';

export const routes: Routes = [
  { path: '', redirectTo: 'servicios', pathMatch: 'full' },
  { path: 'servicios', component: Servicios },
  { path: 'nueva-orden', component: NuevaOrden },
  { path: 'ordenes', component: Ordenes },
  { path: 'ordenes/:id', component: OrdenDetalle },
];