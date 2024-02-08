const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const { errorHandling } = require('./src/middelware/errorHandling');
const route = require('./src/routes/route')

const app = express();
const PORT = 3011;

app.use(cors())
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/api', route);
app.use('/static', express.static(__dirname + '/public'));
app.use(errorHandling);

app.listen(PORT, () => {
   console.log(`Server on port ${PORT}`);
});