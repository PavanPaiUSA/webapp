import dotenv from 'dotenv';
import supertest from 'supertest';
import { expect } from 'chai';

import app from '../app.js';
const request = supertest(app);

describe('User API', async function() {
  it('Test 1 - Create an account, and using the GET call, validate account exists', async function() {
    const userData = {
        username: 'test22@example.com',
        password: 'Password123@',
        first_name: 'John',
        last_name: 'Doe'
      };

      const createResponse = await request
      .post('/v5/user')
      .send(userData)
      .expect(201);

      const createdUser = createResponse.body;

      const updatedResponse = await request
      .get('/v5/user/self')
      .set('Authorization', 'Basic ' + Buffer.from(userData.username + ':' + userData.password).toString('base64'))
      .expect(200);

      const retrievedUser = updatedResponse.body;

      expect(retrievedUser.first_name).to.deep.equal(createdUser.first_name);
      expect(retrievedUser.id).to.deep.equal(createdUser.id);
      expect(retrievedUser.last_name).to.deep.equal(createdUser.last_name);
      expect(retrievedUser.username).to.deep.equal(createdUser.username);
  });

  it('Test 2 - Update the account and using the GET call, validate the account was updated', async function() {
    const userData = {
      username: 'test22@example.com',
      password: 'Password123@',
      first_name: 'John',
      last_name: 'Doe'
    };
    const userDataUpdate = {
        password: 'Password123@2344',
        first_name: 'JohnDa',
        last_name: 'Doe'
      };

      const createResponse = await request
      .put('/v5/user/self')
      .set('Authorization', 'Basic ' + Buffer.from(userData.username + ':' + userData.password).toString('base64'))
      .send(userDataUpdate)
      .expect(204);

      const updatedResponse = await request
      .get('/v5/user/self')
      .set('Authorization', 'Basic ' + Buffer.from(userData.username + ':' + userDataUpdate.password).toString('base64'))
      .expect(200);

      const retrievedUser = updatedResponse.body;
      expect(userDataUpdate.first_name).to.deep.equal(retrievedUser.first_name);
      expect(userDataUpdate.last_name).to.deep.equal(retrievedUser.last_name);
  });
});
