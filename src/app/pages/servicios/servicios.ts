import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TallerDb } from '../../services/taller-db';
import { Servicio } from '../../models/modelos';
import { ServicioCard } from '../../components/servicio-card/servicio-card';

@Component({
  selector: 'app-servicios',
  imports: [ServicioCard],
  templateUrl: './servicios.html',
})
export class Servicios {
  private db = inject(TallerDb);
  private router = inject(Router);

  servicios = signal<Servicio[]>([]);
  cargando = signal(true);
  texto = signal('');
  categoria = signal('');

  categorias = computed(() =>
    [...new Set(this.servicios().map((s) => s.categoria))].sort(),
  );

  filtrados = computed(() => {
    const texto = this.texto().trim().toLowerCase();
    const categoria = this.categoria();
    return this.servicios().filter(
      (s) =>
        (!categoria || s.categoria === categoria) &&
        (!texto ||
          s.nombre.toLowerCase().includes(texto) ||
          s.descripcion.toLowerCase().includes(texto)),
    );
  });

  constructor() {
    this.cargar();
  }

  async cargar() {
    this.servicios.set(await this.db.obtenerServicios());
    this.cargando.set(false);
  }

  alSolicitar(servicio: Servicio) {
    this.router.navigate(['/nueva-orden'], { queryParams: { servicio: servicio.id } });
  }
}