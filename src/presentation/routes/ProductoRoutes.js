import { Router } from "express";
import { 
  GetProducto, 
  GetProductoById, 
  PostProducto, 
  PutProducto, 
  DeleteProducto 
} from "../controllers/ProductoControllers.js";
import { authMiddleware } from "../middlewares/AuthMiddlewares.js";

const router = Router();

// Aplica authMiddleware a todas las rutas de este router
router.use(authMiddleware);

router.post("/", PostProducto);
router.get("/", GetProducto);
router.get("/:id", GetProductoById);
router.put("/:id", PutProducto);
router.delete("/:id", DeleteProducto);

export default router;
