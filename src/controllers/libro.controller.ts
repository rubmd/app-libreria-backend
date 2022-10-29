import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {Libro} from '../models';
import {LibroRepository} from '../repositories';

export class LibroController {
  constructor(
    @repository(LibroRepository)
    public libroRepository : LibroRepository,
  ) {}

  @post('/libros')
  @response(200, {
    description: 'Libro model instance',
    content: {'application/json': {schema: getModelSchemaRef(Libro)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Libro, {
            title: 'NewLibro',
            exclude: ['id'],
          }),
        },
      },
    })
    libro: Omit<Libro, 'id'>,
  ): Promise<Libro> {
    return this.libroRepository.create(libro);
  }

  @get('/libros/count')
  @response(200, {
    description: 'Libro model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Libro) where?: Where<Libro>,
  ): Promise<Count> {
    return this.libroRepository.count(where);
  }

  @get('/libros')
  @response(200, {
    description: 'Array of Libro model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Libro, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Libro) filter?: Filter<Libro>,
  ): Promise<Libro[]> {
    return this.libroRepository.find(filter);
  }

  @patch('/libros')
  @response(200, {
    description: 'Libro PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Libro, {partial: true}),
        },
      },
    })
    libro: Libro,
    @param.where(Libro) where?: Where<Libro>,
  ): Promise<Count> {
    return this.libroRepository.updateAll(libro, where);
  }

  @get('/libros/{id}')
  @response(200, {
    description: 'Libro model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Libro, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Libro, {exclude: 'where'}) filter?: FilterExcludingWhere<Libro>
  ): Promise<Libro> {
    return this.libroRepository.findById(id, filter);
  }

  @patch('/libros/{id}')
  @response(204, {
    description: 'Libro PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Libro, {partial: true}),
        },
      },
    })
    libro: Libro,
  ): Promise<void> {
    await this.libroRepository.updateById(id, libro);
  }

  @put('/libros/{id}')
  @response(204, {
    description: 'Libro PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() libro: Libro,
  ): Promise<void> {
    await this.libroRepository.replaceById(id, libro);
  }

  @del('/libros/{id}')
  @response(204, {
    description: 'Libro DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.libroRepository.deleteById(id);
  }
}
