const express = require('express');
const path = require('path');

const app = express();

// servir todo el frontend (imgs, css, js…)
app.use(express.static(__dirname));

// cuando entren a la raíz, mostrar el login
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'viewsGenerales', 'login.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log('Frontend escuchando en ' + PORT);
});
