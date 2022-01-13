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
      .post('/api/v1/auth/signup')
      .send({
        username: "tester",
        email: "tester@gmail.com",
        phoneNumber: "09023676363",
        fullName : "Tester Testing"
    })
      .end((error, res) => {
        expect(res).to.have.status(201);
        done();
      });
  });
});