import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import CryptoJS from 'crypto-js';
import {Llaves} from '../config/llaves';
import {Cliente} from '../models';
import {ClienteRepository} from '../repositories/cliente.repository';
const generador = require("password-generator");

const jwt = require("jsonwebtoken");

/*  instalamos CryptoJS y despues instalamos los types asi:
    1). npm i crypto-js
    2). npm install --save @types/crypto-js
 */

@injectable({scope: BindingScope.TRANSIENT})
export class AutenticacionService {
  constructor(
    @repository(ClienteRepository)
    public clienteRepository: ClienteRepository
  ) { }
  /*
   * Add service methods here
   */

  GenerarClave() {
    let clave = generador(8, false);
    return clave;
  }


  CifrarClave(clave: string) {
    let claveCifrada = CryptoJS.MD5(clave).toString();
    return claveCifrada
  }

  //No esta funcionando Descifrar clave
  DescifrarClave(clave: string) {
    var bytes = CryptoJS.AES.decrypt(clave, 'progweb@2022');
    var ClaveDescifrada = bytes.toString(CryptoJS.enc.Utf8);

    return ClaveDescifrada
  }

  IdentificarCliente(usuario: string, clave: string) {
    try {
      let cliente = this.clienteRepository.findOne({where: {correo: usuario, clave: clave}});
      if (cliente) {
        return cliente;
      }
      return false;
    } catch {
      return false;
    }
  }

  GenerarTokenJWT(cliente: Cliente) {
    let token = jwt.sign({
      data: {
        id: cliente.id,
        correo: cliente.correo,
        nombre: cliente.nombres + " " + cliente.apellidos,
        rol: cliente.rol
      }
    },
      Llaves.claveJWT);
    return token;
  }

  ValidarTokenJWT(token: string) {
    try {
      let datos = jwt.verify(token, Llaves.claveJWT);
      return datos;
    } catch {
      return false;
    }
  }





















}
