# webapp


## Prerequisites for running the application locally:

```bash
# install dependencies
npm install
# start the executions
node app.js

Endpoint URLs:
Route to check if the server is healthy
GET /healthz

GET route to retrieve user details (Authenticated request)
GET /v1/user/self

POST route to add a new user to the database
POST /v1/user

PUT route to update user details (Authenticated request)
PUT /v1/user/self

Sample JSON Response for GET:
{
  "id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
  "first_name": "Jane",
  "last_name": "Doe",
  "username": "jane.doe@example.com",
  "account_created": "2016-08-29T09:12:33.001Z",
  "account_updated": "2016-08-29T09:12:33.001Z"
}

Status: 200 OK

Sample JSON Request for POST:
{
  "first_name": "Jane",
  "last_name": "Doe",
  "password": "skdjfhskdfjhg",
  "username": "jane.doe@example.com"
}

Status: 201 Created

Sample JSON Request for PUT:
{
  "first_name": "Jane",
  "last_name": "Doe",
  "password": "skdjfhskdfjhg"
}

Status: 204 No Content

Responses for GET/healthz:
Status: 200 OK if it is healthy and no payload
Status: 400 Bad Request
Status: 503 if unhealthy

Responses for other request methods for /healthz:
Status: 405 Method Not Allowed


Developer: Pavan Gopalkrishna Pai
NUID: 002833362
Email: pai.pa@northeastern.edu
