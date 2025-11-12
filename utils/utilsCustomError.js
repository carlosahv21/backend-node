class utilsCustomError extends Error {
    constructor(message, status = 500, details = "An error occurred") {
        super(message); // Llamar al constructor de la clase Error
        this.status = status;
        this.details = details;
    }
}

module.exports = utilsCustomError;
