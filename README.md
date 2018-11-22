# AI Project - Node.js

Node.js server provides a RESTful API and serves React app, also connected to DB

#### Installation & Setup


Install [Node.js](https://nodejs.org/en/)

Install [MongoDB](https://www.mongodb.com/download-center#community)

Install local dependencies

```npm i```

Install global dependencies

```npm i -g nodemon```

```npm i -g typescript```

#### Compiling
Compile ```tsc```

Compile while developing (watch mode) ```tsc -w```
	

#### Starting Server
Environment variables

```PORT=9999``` the HTTP server port

```MONGODB_URL=mongodb://localhost:27017```the database endpoint (protocol + hostname + port)

```MONGODB_DB=ai_proj```database name

(Compile first!!!)

```npm test``` will run make nodemon run the web server

```npm start``` will run make node run the web server

#### API

React web app

```GET /```

Retrieves data preloaded data from the database
(URL must be an _encoded URI component_)

```GET /api/page/get/:encoded_url```

Command the server to load the page 

```POST /api/page/load```

```?format=csv``` for CSV (default JSON)

```javascript
// http post body
{"url": "https://mydomain.com"}
```