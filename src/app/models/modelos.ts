export interface Servicio {
  id: number;
  nombre: string;
  categoria: string;
  descripcion: string;
  precio: number;
  repuestos: number; // unidades disponibles
}

export type EstadoOrden = 'Pendiente' | 'Entregada' | 'Cancelada';

export interface Orden {
  id: number;
  cliente: string;
  telefono: string;
  marca: string;
  modelo: string;
  servicioId: number;
  servicioNombre: string;
  precio: number;
  falla: string;
  fecha: string; // formato ISO
  estado: EstadoOrden;
}

export type NuevoServicio = Omit<Servicio, 'id'>;
export type NuevaOrden = Omit<Orden, 'id'>;