import {Entity, model, property} from '@loopback/repository';

@model()
export class CredencialesCambioClave extends Entity {
  @property({
    type: 'string',
    required: true,
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  clave_actual: string;

  @property({
    type: 'string',
    required: true,
  })
  nueva_clave: string;


  constructor(data?: Partial<CredencialesCambioClave>) {
    super(data);
  }
}

export interface CredencialesCambioClaveRelations {
  // describe navigational properties here
}

export type CredencialesCambioClaveWithRelations = CredencialesCambioClave & CredencialesCambioClaveRelations;
