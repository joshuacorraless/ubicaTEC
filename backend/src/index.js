//archivo que arranca  todo, el servidor
//pone el puerto a escuchar
import 'dotenv/config';
import app, { testDatabaseConnection } from "./app.js";

const PORT = process.env.PORT || 3000;

// Iniciar servidor y probar DB
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    
    // Probar conexión a DB
    try {
        await testDatabaseConnection();
        console.log('✅ Database connected');
    } catch (error) {
        console.log('❌ Database connection failed');
    }
});