const http = require('http');
const path = require('path');
const express = require('express');
const ecstatic = require('ecstatic');
const history = require('connect-history-api-fallback');

const app = express()

app.use(history())

app.use(ecstatic({ root: path.join(__dirname, '../dist') }))

http.createServer(app).listen(process.env.PORT || 3083)