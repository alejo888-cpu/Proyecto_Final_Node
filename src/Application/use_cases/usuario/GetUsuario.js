class GetUsuarios {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute() {
        return await this.userRepository.findAll();
    }
}

export default GetUsuarios;