const chaiHttp = require('chai-http');
const chai = require('chai');
const app = require('../app');


chai.use(chaiHttp);
chai.should()


const {
  expect
} = chai;

describe('Sign User Up', () => {
  it("it should create a new user's data", (done) => {
    chai.request(app)
      .post('/api/v1/signup')
      .send({
        username: "ezeko",
        email: "ezeko2017@gmail.com",
        phoneNumber: "07068006837",
        fullName : "Ezekiel Adejobi"
    })
      .end((error, res) => {
        expect(res).to.have.status(201);
        done();
      });
  });
});