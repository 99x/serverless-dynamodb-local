module.exports = {
    service: {
        custom: {
            dynamodb: {
                stages: ["test", "dev-\d+"]
            }
        }
    },
    cli: {
        log: () => { }
    },
    custom: {},
};
