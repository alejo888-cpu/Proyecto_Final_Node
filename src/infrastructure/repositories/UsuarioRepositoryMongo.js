import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  nombre: String,
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: String,
});

const UserModel = mongoose.model("User", UserSchema);

class UserRepositoryMongo {

  async create(userData) {
    try {
      const user = new UserModel(userData);
      return await user.save();
    } catch (error) {
      if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
        throw new Error("El email ya está registrado");
      }
      throw error;
    }
  }

  async findAll() {
    return await UserModel.find();
  }

  // 🔹 Nuevo método para buscar por email
  async findByUserEmail(email) {
    return await UserModel.findOne({ email });
  }
}

export default UserRepositoryMongo;