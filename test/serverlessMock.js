module.exports = {
    service: {
        custom: {
            dynamodb: {
                stages: ['test']
            }
        }
    },
    cli: {
        log: (...args) => { console.log(...args); }
    },
    custom: {},
};
