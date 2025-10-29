
//* este archivo es el que arranca todo, el servidor y pone el puerto a escuchar



import app from './app.js';


app.listen(3000, async () => {
    console.log(`server running on port 3000`);
});