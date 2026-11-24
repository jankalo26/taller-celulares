import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TallerDb } from '../../services/taller-db';
import { NuevaOrden as DatosOrden, Servicio } from '../../models/modelos';

@Component({
  selector: 'app-nueva-orden',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './nueva-orden.html',
})
export class NuevaOrden {
  private fb = inject(FormBuilder);
  private db = inject(TallerDb);
  private ruta = inject(ActivatedRoute);

  servicios = signal<Servicio[]>([]);
  mensajeError = signal('');
  ordenCreada = signal<number | null>(null);

  form = this.fb.group({
    cliente: ['', [Validators.required, Validators.minLength(3)]],
    telefono: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    marca: ['', Validators.required],
    modelo: ['', Validators.required],
    servicioId: [null as number | null, Validators.required],
    falla: ['', [Validators.required, Validators.minLength(10)]],
  });

  constructor() {
    this.cargarServicios();
  }

  async cargarServicios() {
    this.servicios.set(await this.db.obtenerServicios());

    const idUrl = Number(this.ruta.snapshot.queryParamMap.get('servicio'));
    const elegido = this.servicios().find((s) => s.id === idUrl);
    if (elegido && elegido.repuestos > 0) {
      this.form.patchValue({ servicioId: elegido.id });
    }
  }

  invalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }

  async guardar() {
    this.mensajeError.set('');
    this.ordenCreada.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();

    // Regla del tema: se vuelve a consultar el servicio para validar las existencias reales.
    const servicio = await this.db.obtenerServicio(v.servicioId!);
    if (!servicio) {
      this.mensajeError.set('El servicio seleccionado ya no existe.');
      return;
    }
    if (servicio.repuestos < 1) {
      this.mensajeError.set('No hay repuestos disponibles para este servicio.');
      await this.cargarServicios();
      return;
    }

    const orden: DatosOrden = {
      cliente: v.cliente!.trim(),
      telefono: v.telefono!,
      marca: v.marca!.trim(),
      modelo: v.modelo!.trim(),
      servicioId: servicio.id,
      servicioNombre: servicio.nombre,
      precio: servicio.precio,
      falla: v.falla!.trim(),
      fecha: new Date().toISOString(),
      estado: 'Pendiente',
    };

    const id = await this.db.guardarOrden(orden);
    await this.db.actualizarServicio({ ...servicio, repuestos: servicio.repuestos - 1 });

    this.ordenCreada.set(id);
    this.form.reset();
    this.servicios.set(await this.db.obtenerServicios());
  }
}