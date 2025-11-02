import { getConnection } from '../db/connection.js';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

/**
 * Obtener eventos creados por un administrador específico
 * GET /api/administradores/eventos
 */
export const obtenerEventosAdministrador = async (req, res) => {
  const { id_usuario } = req.query;

  // Validar que se envió el id_usuario
  if (!id_usuario) {
    return res.status(400).json({
      success: false,
      message: 'El ID del usuario administrador es requerido'
    });
  }

  let connection;
  try {
    connection = await getConnection();
    
    // Llamar al stored procedure
    const [eventos] = await connection.query(
      'CALL sp_listar_eventos_administrador(?)',
      [id_usuario]
    );

    // El SP retorna los eventos en el primer elemento del array
    const listaEventos = eventos[0];

    return res.status(200).json({
      success: true,
      data: listaEventos,
      total: listaEventos.length
    });

  } catch (error) {
    console.error('Error al obtener eventos del administrador:', error);
    
    // Error específico del SP
    if (error.sqlState === '45000') {
      return res.status(404).json({
        success: false,
        message: error.sqlMessage || 'El usuario administrador no existe'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error al obtener los eventos',
      error: error.message
    });
  } finally {
    if (connection) connection.release();
  }
};

/**
 * Obtener lista de todas las escuelas del TEC
 * GET /api/administradores/escuelas
 */
export const obtenerEscuelas = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    
    // Obtener todas las escuelas
    const [escuelas] = await connection.query(
      'SELECT id_escuela, nombre_escuela FROM EscuelasTEC ORDER BY nombre_escuela ASC'
    );

    return res.status(200).json({
      success: true,
      data: escuelas
    });

  } catch (error) {
    console.error('Error al obtener escuelas:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener las escuelas',
      error: error.message
    });
  } finally {
    if (connection) connection.release();
  }
};

/**
 * Crear un nuevo evento
 * POST /api/administradores/eventos
 */
export const crearEvento = async (req, res) => {
  let connection;
  let uploadedImageUrl = null;
  let cloudinaryPublicId = null;

  try {
    const {
      nombre,
      descripcion,
      fecha,
      hora,
      lugar,
      capacidad,
      precio,
      acceso,
      id_creador,
      alt_imagen,
      escuelas // JSON string: "[1,2,3]" o null
    } = req.body;

    // Validaciones básicas
    if (!nombre || !descripcion || !fecha || !hora || !lugar || !capacidad || precio === undefined || !acceso || !id_creador) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos'
      });
    }

    // Imagen por defecto
    let imagen_url = 'https://via.placeholder.com/800x400/0052CC/ffffff?text=Evento';

    // Si hay archivo de imagen, subirlo a Cloudinary
    if (req.file) {
      try {
        console.log('Subiendo imagen a Cloudinary...');
        
        // Subir imagen usando stream
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'ubicatec/eventos',
              public_id: `evento_${Date.now()}`,
              transformation: [
                { width: 800, height: 400, crop: 'fill', gravity: 'auto' },
                { quality: 'auto:good' },
                { fetch_format: 'auto' }
              ]
            },
            (error, result) => {
              if (error) {
                console.error('Error en upload_stream:', error);
                reject(error);
              } else {
                console.log('Imagen subida exitosamente:', result.secure_url);
                resolve(result);
              }
            }
          );
          
          streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
        });

        imagen_url = uploadResult.secure_url;
        uploadedImageUrl = uploadResult.secure_url;
        cloudinaryPublicId = uploadResult.public_id;

      } catch (uploadError) {
        console.error('Error al subir imagen a Cloudinary:', uploadError);
        // Continuar con imagen placeholder si falla la subida
        return res.status(500).json({
          success: false,
          message: 'Error al subir la imagen. Por favor, intente nuevamente.'
        });
      }
    }

    connection = await getConnection();
    
    // Parsear escuelas si vienen como string JSON
    let escuelasArray = null;
    if (escuelas) {
      try {
        escuelasArray = typeof escuelas === 'string' ? JSON.parse(escuelas) : escuelas;
      } catch (e) {
        console.error('Error al parsear escuelas:', e);
      }
    }

    // Convertir array de escuelas a JSON (o NULL si es 'todos')
    const escuelasJSON = acceso === 'solo_tec' && escuelasArray && escuelasArray.length > 0 
      ? JSON.stringify(escuelasArray) 
      : null;

    // Llamar al stored procedure
    const [result] = await connection.query(
      `CALL sp_crear_evento(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_result_code, @p_message, @p_id_evento)`,
      [
        nombre,
        descripcion,
        fecha,
        hora,
        lugar,
        capacidad,
        precio,
        acceso,
        id_creador,
        imagen_url,
        alt_imagen || nombre,
        escuelasJSON
      ]
    );

    // Obtener los parámetros de salida
    const [output] = await connection.query(
      'SELECT @p_result_code as result_code, @p_message as message, @p_id_evento as id_evento'
    );

    const { result_code, message, id_evento } = output[0];

    if (result_code === 0) {
      return res.status(201).json({
        success: true,
        message: message,
        data: {
          id_evento: id_evento,
          imagen_url: imagen_url
        }
      });
    } else {
      // Si hubo error en la BD y se subió imagen, eliminarla de Cloudinary
      if (cloudinaryPublicId) {
        try {
          await cloudinary.uploader.destroy(cloudinaryPublicId);
          console.log('Imagen eliminada de Cloudinary debido a error en BD');
        } catch (deleteError) {
          console.error('Error al eliminar imagen de Cloudinary:', deleteError);
        }
      }

      return res.status(400).json({
        success: false,
        message: message,
        code: result_code
      });
    }

  } catch (error) {
    console.error('Error al crear evento:', error);

    // Si hubo error y se subió imagen, eliminarla de Cloudinary
    if (cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(cloudinaryPublicId);
        console.log('Imagen eliminada de Cloudinary debido a error');
      } catch (deleteError) {
        console.error('Error al eliminar imagen de Cloudinary:', deleteError);
      }
    }

    return res.status(500).json({
      success: false,
      message: 'Error al crear el evento',
      error: error.message
    });
  } finally {
    if (connection) connection.release();
  }
};

/**
 * Actualizar un evento existente
 * PUT /api/administradores/eventos/:id
 */
export const actualizarEvento = async (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    descripcion,
    fecha,
    hora,
    lugar,
    capacidad,
    precio,
    imagen_url,
    alt_imagen
  } = req.body;

  // Validaciones básicas
  if (!nombre || !descripcion || !fecha || !hora || !lugar || !capacidad || precio === undefined || !imagen_url) {
    return res.status(400).json({
      success: false,
      message: 'Todos los campos son requeridos'
    });
  }

  let connection;
  try {
    connection = await getConnection();
    
    // Llamar al stored procedure
    const [result] = await connection.query(
      `CALL sp_actualizar_evento(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_result_code, @p_message)`,
      [
        id,
        nombre,
        descripcion,
        fecha,
        hora,
        lugar,
        capacidad,
        precio,
        imagen_url,
        alt_imagen || 'Imagen del evento'
      ]
    );

    // Obtener los parámetros de salida
    const [output] = await connection.query(
      'SELECT @p_result_code as result_code, @p_message as message'
    );

    const { result_code, message } = output[0];

    if (result_code === 0) {
      return res.status(200).json({
        success: true,
        message: message,
        data: {
          id_evento: id
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: message,
        code: result_code
      });
    }

  } catch (error) {
    console.error('Error al actualizar evento:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar el evento',
      error: error.message
    });
  } finally {
    if (connection) connection.release();
  }
};

/**
 * Eliminar un evento (soft delete)
 * DELETE /api/administradores/eventos/:id
 */
export const eliminarEvento = async (req, res) => {
  const { id } = req.params;

  let connection;
  try {
    connection = await getConnection();
    
    // Llamar al stored procedure
    const [result] = await connection.query(
      `CALL sp_eliminar_evento(?, @p_result_code, @p_message)`,
      [id]
    );

    // Obtener los parámetros de salida
    const [output] = await connection.query(
      'SELECT @p_result_code as result_code, @p_message as message'
    );

    const { result_code, message } = output[0];

    if (result_code === 0) {
      return res.status(200).json({
        success: true,
        message: message
      });
    } else {
      return res.status(400).json({
        success: false,
        message: message,
        code: result_code
      });
    }

  } catch (error) {
    console.error('Error al eliminar evento:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar el evento',
      error: error.message
    });
  } finally {
    if (connection) connection.release();
  }
};
