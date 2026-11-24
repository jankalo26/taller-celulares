import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TallerDb } from '../../services/taller-db';
import { EstadoOrden, Orden } from '../../models/modelos';

@Component({
  selector: 'app-orden-detalle',
  imports: [RouterLink, DatePipe, CurrencyPipe, NgClass],
  templateUrl: './orden-detalle.html',
})
export class OrdenDetalle {
  private db = inject(TallerDb);
  private ruta = inject(ActivatedRoute);

  orden = signal<Orden | null>(null);
  cargando = signal(true);
  mensaje = signal('');
  mensajeError = signal('');

  constructor() {
    this.cargar();
  }

  async cargar() {
    const id = Number(this.ruta.snapshot.paramMap.get('id'));
    if (Number.isInteger(id) && id > 0) {
      this.orden.set((await this.db.obtenerOrden(id)) ?? null);
    }
    this.cargando.set(false);
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

  async entregar() {
    this.mensaje.set('');
    this.mensajeError.set('');

    // Se vuelve a leer la orden para evitar repetir la acción.
    const actual = await this.db.obtenerOrden(this.orden()!.id);
    if (!actual || actual.estado !== 'Pendiente') {
      this.mensajeError.set('Esta orden ya fue procesada y no se puede modificar.');
      this.orden.set(actual ?? null);
      return;
    }

    const actualizada: Orden = { ...actual, estado: 'Entregada' };
    await this.db.actualizarOrden(actualizada);
    this.orden.set(actualizada);
    this.mensaje.set('El equipo fue entregado al cliente. La orden quedó como Entregada.');
  }

  async cancelar() {
    this.mensaje.set('');
    this.mensajeError.set('');

    const actual = await this.db.obtenerOrden(this.orden()!.id);
    if (!actual || actual.estado !== 'Pendiente') {
      this.mensajeError.set('Esta orden ya fue procesada y no se puede modificar.');
      this.orden.set(actual ?? null);
      return;
    }

    const actualizada: Orden = { ...actual, estado: 'Cancelada' };
    await this.db.actualizarOrden(actualizada);

    // Consecuencia visible: el repuesto vuelve al stock.
    const servicio = await this.db.obtenerServicio(actual.servicioId);
    if (servicio) {
      const nuevoStock = servicio.repuestos + 1;
      await this.db.actualizarServicio({ ...servicio, repuestos: nuevoStock });
      this.mensaje.set(
        `Orden cancelada. Se devolvió 1 repuesto al stock de "${servicio.nombre}" (disponibles: ${nuevoStock}).`,
      );
    } else {
      this.mensaje.set('Orden cancelada.');
    }
    this.orden.set(actualizada);
  }
}