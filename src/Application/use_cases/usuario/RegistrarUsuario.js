import Usuario from "../../../Domain/models/Usuario.js";

export default class CrearUsuario {
    constructor(userRepository, passwordEncrypter) {
      this.userRepository = userRepository;
      this.passwordEncrypter = passwordEncrypter;
    }
  
    async execute(userData) {
      const { nombre, email, password } = userData;
      // encriptar la contraseña antes de guardar
      const hashedPassword = await this.passwordEncrypter.hashPassword(password);

      const usuarioGuardado = new Usuario({
      nombre,
      email,
      password: hashedPassword,
    });

      return await this.userRepository.create(usuarioGuardado);
    }
}  