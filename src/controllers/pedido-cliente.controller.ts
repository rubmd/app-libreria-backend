import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Pedido,
  Cliente,
} from '../models';
import {PedidoRepository} from '../repositories';

export class PedidoClienteController {
  constructor(
    @repository(PedidoRepository)
    public pedidoRepository: PedidoRepository,
  ) { }

  @get('/pedidos/{id}/cliente', {
    responses: {
      '200': {
        description: 'Cliente belonging to Pedido',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Cliente)},
          },
        },
      },
    },
  })
  async getCliente(
    @param.path.string('id') id: typeof Pedido.prototype.id,
  ): Promise<Cliente> {
    return this.pedidoRepository.cliente(id);
  }
}
