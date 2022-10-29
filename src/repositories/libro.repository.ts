import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Libro, LibroRelations} from '../models';

export class LibroRepository extends DefaultCrudRepository<
  Libro,
  typeof Libro.prototype.id,
  LibroRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(Libro, dataSource);
  }
}
