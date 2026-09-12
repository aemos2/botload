function handleError(error, context = "Unknown") {
    console.error(`[${context}]`, error);
}

module.exports = {
    handleError
};