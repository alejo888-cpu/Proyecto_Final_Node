import express from "express";
import cors from "cors"; // 👈 importamos cors

import usuarioRoutes from "../presentation/routes/UsuarioRoutes.js";
import loginRoutes from "../presentation/routes/loginRoutes.js";
import productoRoutes from "../presentation/routes/ProductoRoutes.js";
import pedidoRoutes from "../presentation/routes/PedidoRoutes.js";

const app = express();

// ✅ habilitamos CORS para permitir peticiones desde cualquier origen
app.use(cors({
  origin: "*", // 👈 permite cualquier origen/servidor
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Rutas
app.use("/api/auth/registrar", usuarioRoutes);
app.use("/api/auth/login", loginRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/pedidos", pedidoRoutes);

export default app;
