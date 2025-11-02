//* este archivo contiene la configuración de Cloudinary para subir imágenes al servicio en la nube


//* imports:
import { v2 as cloudinary } from 'cloudinary';



// la configuración de Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dcd3f0xrr',
    api_key: process.env.CLOUDINARY_API_KEY || '527276831892256',
    api_secret: process.env.CLOUDINARY_API_SECRET // Debes configurar esto en .env
});

export default cloudinary;
