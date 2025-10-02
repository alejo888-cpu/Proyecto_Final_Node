import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  nombre: String,
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: String,
  rol: {
    type: String,
    enum: ["admin", "cliente", "empleado", "vendedor"],
    default: "cliente"
  }
}, {
  timestamps: true
});

const UserModel = mongoose.model("User", UserSchema);

class UserRepositoryMongo {

  async create(userData) {
    try {
      const user = new UserModel(userData);
      const savedUser = await user.save();
      return {
        id: savedUser.id,
        nombre: savedUser.nombre,
        email: savedUser.email,
        rol: savedUser.rol,
        createdAt: savedUser.createdAt
      };
    } catch (error) {
      if (error.code === 11000) {
        if (error.keyPattern && error.keyPattern.email) {
          throw new Error("El email ya está registrado");
        }
        if (error.keyPattern && error.keyPattern.id) {
          throw new Error("El ID ya está registrado");
        }
      }
      throw error;
    }
  }

  async findAll() {
    const users = await UserModel.find().select('-password');
    return users.map(user => ({
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      createdAt: user.createdAt
    }));
  }

  // 🔹 Nuevo método para buscar por email
  async findByUserEmail(email) {
    return await UserModel.findOne({ email });
  }
}

export default UserRepositoryMongo;