import multer from 'multer';

// Configurar multer para almacenar en memoria (buffer)
const storage = multer.memoryStorage();

// Filtro para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
    // Aceptar solo archivos de imagen
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos de imagen (JPG, PNG, WebP, GIF)'), false);
    }
};

// Configuración de multer
export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB máximo
    }
});
