const express = require('express');
const { PORT } = require('./config');

const app = express();
app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));

app.use('/',      require('./routes/index'));
app.use('/stats', require('./routes/stats'));

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
