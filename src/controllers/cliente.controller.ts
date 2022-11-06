import {service} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where
} from '@loopback/repository';
import {
  del, get,
  getModelSchemaRef, HttpErrors, param, patch, post, put, requestBody,
  response
} from '@loopback/rest';
import {Llaves} from '../config/llaves';
import {Cliente, Credenciales, CredencialesRecuperarClave} from '../models';
import {CredencialesCambioClave} from '../models/credenciales-cambio-clave.model';
import {ClienteRepository} from '../repositories';
import {AutenticacionService} from '../services';
const fetch = require('node-fetch');

export class ClienteController {
  constructor(
    @repository(ClienteRepository)
    public clienteRepository: ClienteRepository,
    @service(AutenticacionService)
    public servicioAutenticacion: AutenticacionService
  ) { }

  @post("/identificarCliente", {
    responses: {
      '200': {
        description: "Identificacion de usuarios"
      }
    }
  })
  async identificarPersona(
    @requestBody() Datos: Credenciales
  ) {
    let cliente = await this.servicioAutenticacion.IdentificarCliente(Datos.usuario, Datos.clave);
    if (cliente) {
      let token = this.servicioAutenticacion.GenerarTokenJWT(cliente);
      return {
        datos: {
          nombre: cliente.nombres,
          correo: cliente.correo,
          id: cliente.id,
          rol: cliente.rol
        },
        tk: token
      }
    } else {
      throw new HttpErrors[401]("Datos no validos");
    }

  }

  @post('/clientes')
  @response(200, {
    description: 'Cliente model instance',
    content: {'application/json': {schema: getModelSchemaRef(Cliente)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Cliente, {
            title: 'NewCliente',
            exclude: ['id'],
          }),
        },
      },
    })
    cliente: Omit<Cliente, 'id'>,
  ): Promise<Cliente> {
    let clave = this.servicioAutenticacion.GenerarClave();
    let claveCifrada = this.servicioAutenticacion.CifrarClave(clave);
    cliente.clave = claveCifrada;
    let p = await this.clienteRepository.create(cliente);

    //Notificar al usuario via E-mail
    let destino = cliente.correo;
    let asunto = 'Registro en la plataforma';
    let contenido = `Hola ${cliente.nombres}, su nombre de usuario es: ${cliente.correo} y su contraseña es ${clave}`;
    fetch(`${Llaves.urlServicioNotificaciones}/envio-correo?correo_destino=${destino}&asunto=${asunto}&contenido=${contenido}`)
      .then((data: any) => {
        console.log(data);
      })
    //Notificar al usuario via sms
    let celularDestino = cliente.celular;
    fetch(`${Llaves.urlServicioNotificaciones}/sms?mensaje=${contenido}&telefono=${celularDestino}`)
      .then((data: any) => {
        console.log(data);
      })


    return p;
  }

  @get('/clientes/count')
  @response(200, {
    description: 'Cliente model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Cliente) where?: Where<Cliente>,
  ): Promise<Count> {
    return this.clienteRepository.count(where);
  }

  @get('/clientes')
  @response(200, {
    description: 'Array of Cliente model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Cliente, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Cliente) filter?: Filter<Cliente>,
  ): Promise<Cliente[]> {
    return this.clienteRepository.find(filter);
  }

  @patch('/clientes')
  @response(200, {
    description: 'Cliente PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Cliente, {partial: true}),
        },
      },
    })
    cliente: Cliente,
    @param.where(Cliente) where?: Where<Cliente>,
  ): Promise<Count> {
    return this.clienteRepository.updateAll(cliente, where);
  }

  @get('/clientes/{id}')
  @response(200, {
    description: 'Cliente model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Cliente, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Cliente, {exclude: 'where'}) filter?: FilterExcludingWhere<Cliente>
  ): Promise<Cliente> {
    return this.clienteRepository.findById(id, filter);
  }

  @patch('/clientes/{id}')
  @response(204, {
    description: 'Cliente PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Cliente, {partial: true}),
        },
      },
    })
    cliente: Cliente,
  ): Promise<void> {
    await this.clienteRepository.updateById(id, cliente);
  }

  @put('/clientes/{id}')
  @response(204, {
    description: 'Cliente PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() cliente: Cliente,
  ): Promise<void> {
    await this.clienteRepository.replaceById(id, cliente);
  }

  @del('/clientes/{id}')
  @response(204, {
    description: 'Cliente DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.clienteRepository.deleteById(id);
  }

  //recuperar y cambiar clave

  @post("/recuperarClave", {
    responses: {
      '200': {
        description: "Recuperacion de Clave"
      }
    }
  })
  async recuperarClave(
    @requestBody() credenciales: CredencialesRecuperarClave
  ): Promise<Boolean> {
    let cliente = await this.clienteRepository.findOne({
      where: {
        correo: credenciales.correo
      }
    });
    if (cliente) {
      let clave = this.servicioAutenticacion.GenerarClave();
      console.log(clave)
      let claveCifrada = this.servicioAutenticacion.CifrarClave(clave);
      console.log(claveCifrada)
      cliente.clave = claveCifrada;

      await this.clienteRepository.updateById(cliente.id, cliente);

      //Notificar al usuario via E-mail
      let destino = cliente.correo;
      let asunto = 'Recuperacion de Clave';
      let contenido = `Hola ${cliente.nombres}.Se ha recuperado su contraseña con exito. Su nueva contraseña es ${clave}`;
      fetch(`${Llaves.urlServicioNotificaciones}/envio-correo?correo_destino=${destino}&asunto=${asunto}&contenido=${contenido}`)
        .then((data: any) => {
          console.log(data);
        })

      //Notificar al usuario via sms
      let celularDestino = cliente.celular;
      //let contenido = `Se ha recuperado su contraseña con exito. Su nueva contraseña es ${clave}`
      fetch(`${Llaves.urlServicioNotificaciones}/sms?mensaje=${contenido}&telefono=${celularDestino}`)
        .then((data: any) => {
          console.log(data);
        })


      return true;
    }
    return false

  }

  @post("/cambiarClave", {
    responses: {
      '200': {
        description: "Cambio de Clave"
      }
    }
  })
  async cambiarClave(
    @requestBody() datos: CredencialesCambioClave
  ): Promise<Boolean> {
    let cliente = await this.clienteRepository.findById(datos.id);
    if (cliente) {
      let ClaveDescifrada = this.servicioAutenticacion.DescifrarClave(cliente.clave) //Descifra la clave para poder compararla
      cliente.clave = ClaveDescifrada //Asigna la clave descifrada a la clave cifrada
      console.log(cliente.clave); //Muestra la contraseña descifrada en de 8 digitos

      if (cliente.clave == datos.clave_actual) { // Compara la contraseña descifrada con la contraseña de 8 digitos
        let claveCifrada = this.servicioAutenticacion.CifrarClave(datos.nueva_clave);
        console.log(datos.nueva_clave); //Muestra la nueva clave de 8 digitos
        cliente.clave = claveCifrada; //Asigna la nueva clave cifrada
        console.log(claveCifrada); //Muestra la clave cifrada


        //Notificar al usuario via E-mail
        let destino = cliente.correo;
        let asunto = 'Cambio de Clave';
        let contenido = `Hola ${cliente.nombres}.Ha cambiado su contraseña con exito. Su contraseña actual es ${datos.nueva_clave}`;
        fetch(`${Llaves.urlServicioNotificaciones}/envio-correo?correo_destino=${destino}&asunto=${asunto}&contenido=${contenido}`)
          .then((data: any) => {
            console.log(data);
          })

        //Notificar al usuario via sms
        let celularDestino = cliente.celular;
        fetch(`${Llaves.urlServicioNotificaciones}/sms?mensaje=${contenido}&telefono=${celularDestino}`)
          .then((data: any) => {
            console.log(data);
          })

        await this.clienteRepository.updateById(datos.id, cliente); //Actualiza los cambios en la base de datos
        return true;

      } else {
        return false;
      }

    }
    return false;

  }
}
