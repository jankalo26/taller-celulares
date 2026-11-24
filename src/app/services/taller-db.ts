import { Injectable } from '@angular/core';
import { NuevaOrden, NuevoServicio, Orden, Servicio } from '../models/modelos';

const DB_NOMBRE = 'taller-celulares';
const DB_VERSION = 1;

const SERVICIOS_INICIALES: NuevoServicio[] = [
  { nombre: 'Cambio de pantalla', categoria: 'Pantalla', descripcion: 'Reemplazo de pantalla rota o sin imagen.', precio: 350, repuestos: 5 },
  { nombre: 'Cambio de vidrio táctil', categoria: 'Pantalla', descripcion: 'Reemplazo del vidrio con el táctil dañado.', precio: 250, repuestos: 4 },
  { nombre: 'Cambio de batería', categoria: 'Batería', descripcion: 'Batería nueva para equipos que se descargan rápido.', precio: 180, repuestos: 8 },
  { nombre: 'Puerto de carga', categoria: 'Carga', descripcion: 'Reemplazo del puerto que no carga o hace falso contacto.', precio: 120, repuestos: 6 },
  { nombre: 'Cambio de altavoz', categoria: 'Audio', descripcion: 'Reemplazo de altavoz o auricular con sonido bajo.', precio: 90, repuestos: 7 },
  { nombre: 'Cambio de cámara', categoria: 'Cámara', descripcion: 'Reemplazo de cámara trasera o frontal.', precio: 200, repuestos: 3 },
  { nombre: 'Reinstalación de software', categoria: 'Software', descripcion: 'Restauración del sistema sin pérdida de repuestos.', precio: 70, repuestos: 99 },
  { nombre: 'Limpieza por humedad', categoria: 'Mantenimiento', descripcion: 'Limpieza interna de equipos mojados.', precio: 100, repuestos: 10 },
];

@Injectable({ providedIn: 'root' })
export class TallerDb {
  private dbPromise?: Promise<IDBDatabase>;

  /** Abre la base. Los datos iniciales se cargan solo al crearla (una vez). */
  iniciar(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const peticion = indexedDB.open(DB_NOMBRE, DB_VERSION);

        peticion.onupgradeneeded = () => {
          const db = peticion.result;
          const servicios = db.createObjectStore('servicios', { keyPath: 'id', autoIncrement: true });
          db.createObjectStore('ordenes', { keyPath: 'id', autoIncrement: true });
          for (const s of SERVICIOS_INICIALES) {
            servicios.add(s);
          }
        };

        peticion.onsuccess = () => resolve(peticion.result);
        peticion.onerror = () => reject(peticion.error);
      });
    }
    return this.dbPromise;
  }

  private async ejecutar<T>(
    almacen: 'servicios' | 'ordenes',
    modo: IDBTransactionMode,
    operacion: (store: IDBObjectStore) => IDBRequest<T>,
  ): Promise<T> {
    const db = await this.iniciar();
    return new Promise<T>((resolve, reject) => {
      const tx = db.transaction(almacen, modo);
      const peticion = operacion(tx.objectStore(almacen));
      peticion.onsuccess = () => resolve(peticion.result);
      peticion.onerror = () => reject(peticion.error);
    });
  }

  // ---- Servicios ----
  obtenerServicios(): Promise<Servicio[]> {
    return this.ejecutar('servicios', 'readonly', (s) => s.getAll());
  }

  async obtenerServicio(id: number): Promise<Servicio | undefined> {
    return this.ejecutar('servicios', 'readonly', (s) => s.get(id));
  }

  async actualizarServicio(servicio: Servicio): Promise<void> {
    await this.ejecutar('servicios', 'readwrite', (s) => s.put(servicio));
  }

  // ---- Órdenes ----
  obtenerOrdenes(): Promise<Orden[]> {
    return this.ejecutar('ordenes', 'readonly', (s) => s.getAll());
  }

  async obtenerOrden(id: number): Promise<Orden | undefined> {
    return this.ejecutar('ordenes', 'readonly', (s) => s.get(id));
  }

  async guardarOrden(orden: NuevaOrden): Promise<number> {
    const id = await this.ejecutar('ordenes', 'readwrite', (s) => s.add(orden));
    return id as number;
  }

  async actualizarOrden(orden: Orden): Promise<void> {
    await this.ejecutar('ordenes', 'readwrite', (s) => s.put(orden));
  }
}