import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
  Pedido,
  Libro,
} from '../models';
import {PedidoRepository} from '../repositories';

export class PedidoLibroController {
  constructor(
    @repository(PedidoRepository) protected pedidoRepository: PedidoRepository,
  ) { }

  @get('/pedidos/{id}/libro', {
    responses: {
      '200': {
        description: 'Pedido has one Libro',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Libro),
          },
        },
      },
    },
  })
  async get(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Libro>,
  ): Promise<Libro> {
    return this.pedidoRepository.libro(id).get(filter);
  }

  @post('/pedidos/{id}/libro', {
    responses: {
      '200': {
        description: 'Pedido model instance',
        content: {'application/json': {schema: getModelSchemaRef(Libro)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Pedido.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Libro, {
            title: 'NewLibroInPedido',
            exclude: ['id'],
            optional: ['pedidoId']
          }),
        },
      },
    }) libro: Omit<Libro, 'id'>,
  ): Promise<Libro> {
    return this.pedidoRepository.libro(id).create(libro);
  }

  @patch('/pedidos/{id}/libro', {
    responses: {
      '200': {
        description: 'Pedido.Libro PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Libro, {partial: true}),
        },
      },
    })
    libro: Partial<Libro>,
    @param.query.object('where', getWhereSchemaFor(Libro)) where?: Where<Libro>,
  ): Promise<Count> {
    return this.pedidoRepository.libro(id).patch(libro, where);
  }

  @del('/pedidos/{id}/libro', {
    responses: {
      '200': {
        description: 'Pedido.Libro DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Libro)) where?: Where<Libro>,
  ): Promise<Count> {
    return this.pedidoRepository.libro(id).delete(where);
  }
}
