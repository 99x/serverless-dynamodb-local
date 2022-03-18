const { expect } = require('chai');
const matchStage = require('../src/util');

describe('Test matching stages', () => {
  it('should match regex', () => {
    expect(matchStage('dev-777', 'dev-\\d+')).to.eq(true);
    expect(matchStage('dev', 'dev-\\d+')).to.eq(false);
    expect(matchStage('dev', 'dev')).to.eq(true);
  });  
})
