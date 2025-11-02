import { getConnection } from '../db/connection.js';

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
    imagen_url,
    alt_imagen,
    escuelas // Array de IDs: [1,2,3] o null/undefined
  } = req.body;

  // Validaciones básicas
  if (!nombre || !descripcion || !fecha || !hora || !lugar || !capacidad || precio === undefined || !acceso || !id_creador || !imagen_url) {
    return res.status(400).json({
      success: false,
      message: 'Todos los campos son requeridos'
    });
  }

  let connection;
  try {
    connection = await getConnection();
    
    // Convertir array de escuelas a JSON (o NULL si es 'todos')
    const escuelasJSON = acceso === 'solo_tec' && escuelas && escuelas.length > 0 
      ? JSON.stringify(escuelas) 
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
        alt_imagen || 'Imagen del evento',
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
          id_evento: id_evento
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
    console.error('Error al crear evento:', error);
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
