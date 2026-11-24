import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TallerDb } from '../../services/taller-db';
import { EstadoOrden, Orden } from '../../models/modelos';

@Component({
  selector: 'app-ordenes',
  imports: [RouterLink, DatePipe, CurrencyPipe, NgClass],
  templateUrl: './ordenes.html',
})
export class Ordenes {
  private db = inject(TallerDb);

  ordenes = signal<Orden[]>([]);
  cargando = signal(true);
  estado = signal<EstadoOrden | ''>('');

  estados: EstadoOrden[] = ['Pendiente', 'Entregada', 'Cancelada'];

  filtradas = computed(() => {
    const estado = this.estado();
    return this.ordenes()
      .filter((o) => !estado || o.estado === estado)
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  });

  constructor() {
    this.cargar();
  }

  async cargar() {
    this.ordenes.set(await this.db.obtenerOrdenes());
    this.cargando.set(false);
  }

  alCambiarEstado(valor: string) {
    this.estado.set(valor as EstadoOrden | '');
  }

  claseEstado(estado: EstadoOrden): string {
    switch (estado) {
      case 'Pendiente':
        return 'bg-warning text-dark';
      case 'Entregada':
        return 'bg-success';
      default:
        return 'bg-danger';
    }
  }
}