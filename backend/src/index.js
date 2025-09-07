//archivo que arranca  todo, el servidor
//pone el puerto a escuchar
import app from "./app.js";


app.listen(3000); // el servidor se inicia en el puerto 3000 al ser aplicacion con Node.js

console.log('Server is running on port 3000');