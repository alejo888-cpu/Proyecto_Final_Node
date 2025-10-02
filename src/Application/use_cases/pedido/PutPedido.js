// Caso de uso general para actualizar pedidos con manejo correcto de stock
export class PutPedidoUseCase {
  constructor(pedidoRepository, productoRepository) {
    this.pedidoRepository = pedidoRepository;
    this.productoRepository = productoRepository;
  }

  async execute(idPedido, updateData) {
    console.log("PutPedidoUseCase - Buscando pedido con ID:", idPedido);
    const pedidoActual = await this.pedidoRepository.getByIdPedido(idPedido);
    console.log("PutPedidoUseCase - Pedido encontrado:", pedidoActual);
    
    if (!pedidoActual) throw new Error(`Pedido con ID ${idPedido} no encontrado`);

    // Si se están actualizando detalles, manejar diferencias de stock
    if (updateData.detalles && Array.isArray(updateData.detalles)) {
      console.log("PutPedidoUseCase - Actualizando detalles, manejando stock");
      await this.manejarCambiosStock(pedidoActual.detalles, updateData.detalles);
    }

    console.log("PutPedidoUseCase - Actualizando con datos:", updateData);
    return await this.pedidoRepository.updateByIdPedido(idPedido, updateData);
  }

  async manejarCambiosStock(detallesAnteriores, detallesNuevos) {
    // Crear mapas para facilitar la comparación
    const mapAnterior = new Map();
    const mapNuevo = new Map();

    // Mapear detalles anteriores
    detallesAnteriores.forEach(detalle => {
      mapAnterior.set(detalle.idProducto, detalle.cantidad);
    });

    // Mapear detalles nuevos
    detallesNuevos.forEach(detalle => {
      mapNuevo.set(detalle.idProducto, detalle.cantidad);
    });

    // Procesar cada producto
    for (const [idProducto, cantidadNueva] of mapNuevo) {
      const cantidadAnterior = mapAnterior.get(idProducto) || 0;
      const diferencia = cantidadNueva - cantidadAnterior;

      console.log(`Producto ${idProducto}: cantidad anterior ${cantidadAnterior}, nueva ${cantidadNueva}, diferencia ${diferencia}`);

      if (diferencia > 0) {
        // Incremento: descontar más stock
        console.log(`Descontando ${diferencia} unidades adicionales del producto ${idProducto}`);
        const producto = await this.productoRepository.findByIdProducto(idProducto);
        if (!producto) throw new Error(`Producto ${idProducto} no encontrado`);
        
        if (producto.stock < diferencia) {
          throw new Error(`Stock insuficiente para el producto ${idProducto}. Stock disponible: ${producto.stock}, requerido: ${diferencia}`);
        }
        
        await this.productoRepository.updateByIdProducto(idProducto, { 
          stock: producto.stock - diferencia 
        });
      } else if (diferencia < 0) {
        // Decremento: devolver stock
        console.log(`Devolviendo ${Math.abs(diferencia)} unidades del producto ${idProducto}`);
        await this.productoRepository.incrementarStock(idProducto, Math.abs(diferencia));
      }
      // Si diferencia === 0, no hay cambios
    }

    // Manejar productos que se eliminaron completamente del pedido
    for (const [idProducto, cantidadAnterior] of mapAnterior) {
      if (!mapNuevo.has(idProducto)) {
        console.log(`Producto ${idProducto} eliminado del pedido, devolviendo ${cantidadAnterior} unidades`);
        await this.productoRepository.incrementarStock(idProducto, cantidadAnterior);
      }
    }
  }
}

// Caso de uso específico para cancelar pedidos
export default class CancelarPedido {
  constructor(pedidoRepository, productoRepository) {
    this.pedidoRepository = pedidoRepository;
    this.productoRepository = productoRepository;
  }

  async execute(idPedido) {
    console.log("CancelarPedido - Buscando pedido con ID:", idPedido);
    console.log("CancelarPedido - productoRepository:", this.productoRepository);
    
    // 1. Buscar pedido
    const pedido = await this.pedidoRepository.getByIdPedido(idPedido);
    console.log("CancelarPedido - Pedido encontrado:", pedido);
    
    if (!pedido) throw new Error("Pedido no encontrado");

    // 2. Validar si ya está cancelado
    if (pedido.estado === "cancelado") {
      throw new Error("El pedido ya está cancelado");
    }

    // 3. Devolver stock de cada detalle
    console.log("CancelarPedido - Detalles del pedido:", pedido.detalles);
    for (const detalle of pedido.detalles) {
      console.log("CancelarPedido - Devolviendo stock para producto:", detalle.idProducto, "cantidad:", detalle.cantidad);
      await this.productoRepository.incrementarStock(
        detalle.idProducto,
        detalle.cantidad
      );
    }

    // 4. Actualizar estado del pedido
    pedido.estado = "cancelado";

    return await this.pedidoRepository.updateByIdPedido(idPedido, pedido);
  }
}
