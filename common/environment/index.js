function isLambda() {
    const isLambda = (process.env.LAMBDA_TASK_ROOT && process.env.AWS_EXECUTION_ENV) || false;
    return !!isLambda;
}

module.exports = {
    isLambda
};