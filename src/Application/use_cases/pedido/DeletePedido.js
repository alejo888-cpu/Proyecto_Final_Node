export default class DeletePedido {
    constructor(pedidoRepository) {
        this.pedidoRepository = pedidoRepository
    }

    async execute(id) {
        return await this.pedidoRepository.delete(id)
    }
}