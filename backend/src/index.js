
//* este archivo es el que arranca todo, el servidor y pone el puerto a escuchar

//* imports: 
import 'dotenv/config';
import app from './app.js';


// arrancar el servidor en el puerto 3000
app.listen(3000, async () => {
    console.log(`server running on port 3000`);
});