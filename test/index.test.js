const chaiHttp = require('chai-http');
const chai = require('chai');
const app = require('../app');


chai.use(chaiHttp);
chai.should()

const {
  expect
} = chai;

describe('Server Test', () => {
  it('it should connect to server', (done) => {
    chai.request(app)
      .get('/api/v1/home')
      .end((error, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
});