import {Entity, model, property} from '@loopback/repository';

@model()
export class Libro extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  titulo: string;

  @property({
    type: 'number',
    required: true,
  })
  precio: number;

  @property({
    type: 'string',
    required: true,
  })
  imagen: string;

  @property({
    type: 'string',
    required: true,
  })
  autor: string;

  @property({
    type: 'string',
  })
  pedidoId?: string;

  constructor(data?: Partial<Libro>) {
    super(data);
  }
}

export interface LibroRelations {
  // describe navigational properties here
}

export type LibroWithRelations = Libro & LibroRelations;
