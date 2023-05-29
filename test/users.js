import supertest from 'supertest';
import { expect } from 'chai';
import dotenv from 'dotenv';
import { createRandomUser } from '../helpers/user_helper';

// Configuration
dotenv.config();

// Request
const request = supertest('https://gorest.co.in/public-api/');
const token = process.env.USER_TOKEN;

// Mocha test cases
describe('/users route | Check for users', () => {
    let userId = null;

    it('GET /users', async () => {
        const res = await request.get('users');
        expect(res.body.data).to.not.be.empty;
    });

    it('GET /users | query parameters', async () => {
        const url = `users?access-token=${token}&gender=female&status=active`;
        const res = await request.get(url);
        // Loop over each result
        res.body.data.forEach((user) => {
            expect(user.gender).to.equal('female');
            expect(user.status).to.eql('active');
        });
    });

    it('POST /users | Create user', async () => {
        const data = createRandomUser();
        const res = await request
            .post('users')
            .set('Authorization', `Bearer ${token}`)
            .send(data);


        expect(res.body.data).to.deep.include(data);
        expect(res.body.data).to.have.property('id');
        expect(res.body.data).to.have.property('email');
        userId = res.body.data.id;
    });

    it('POST /users | Negative', async () => {
        const data = {};
        const res = await request
            .post('users')
            .set('Authorization', `Bearer ${token}`)
            .send(data);
        
        expect(res.body.code).to.eq(422);
    });

    it('GET /users/:id | User we just created', async () => {
        const res = await request.get(`users/${userId}?access-token=${token}`);
        expect(res.body.data.id).to.eq(userId);
    });

    it('PUT /users/:id | Change user we just created', async () => {
        const data = {
            name: 'Test user update'
        };

        const res = await request.put(`users/${userId}`)
            .set('Authorization', `Bearer ${token}`)
            .send(data);

        expect(res.body.data.name).to.equal(data.name);
        expect(res.body.data).to.include(data);
    });

    it('DELETE /users/:id | Delete users we just created', async () => {
        const res = await request.delete(`users/${userId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.body.data).to.be.null;
    });

    it('GET /users/:id | Negative, get user that dont exist', async () => {
        const res = await request.get(`users/${userId}`);
        expect(res.body.data.message).to.eq('Resource not found');
    });

    it('DELETE /users/:id | Negative', async () => {
        const res = await request.delete(`users/${userId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.body.data.message).to.equal('Resource not found');
    });
});

