module.exports = {
    service: {
        custom: {
            dynamodb: {
                stages: ["test"]
            }
        }
    },
    cli: {
        log: () => { }
    },
    custom: {},
};
