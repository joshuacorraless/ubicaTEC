
//* en este archivo esta toda la logica backend para el perfil de usuario


//* imports:
import { getConnection } from '../db/connection.js';




// funcion para obtener el perfil de un usuario:
export const obtenerPerfilUsuario = async (req, res) => {
  const { id_usuario } = req.params;

  try {
    // validar que se proporcione el ID
    if (!id_usuario) {
      return res.status(400).json({
        success: false,
        message: 'El ID de usuario es obligatorio'
      });
    }

    // obtener conexión
    const connection = await getConnection();

    // llamar al stored procedure
    const [results] = await connection.query(
      'CALL sp_obtener_perfil_usuario(?)',
      [id_usuario]
    );

    // el SP retorna los datos del usuario en results[0]
    const usuario = results[0];

    if (!usuario || usuario.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // retornar los datos del perfil
    return res.status(200).json({
      success: true,
      data: usuario[0]
    });

  } catch (error) {
    console.error('Error al obtener perfil:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};




// funcion para actualizar el perfil de un usuario:
export const actualizarPerfilUsuario = async (req, res) => {
  const { id_usuario } = req.params;
  const { nombre, apellido, correo, usuario, nueva_contrasena } = req.body;

  try {
    // Validar que se proporcionen los datos requeridos
    if (!id_usuario || !nombre || !apellido || !correo || !usuario) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son obligatorios'
      });
    }

    // Obtener conexión
    const connection = await getConnection();

    // Llamar al stored procedure
    await connection.query(
      'CALL sp_actualizar_perfil_usuario(?, ?, ?, ?, ?, ?, @p_result_code, @p_message)',
      [id_usuario, nombre, apellido, correo, usuario, nueva_contrasena || null]
    );

    // Obtener los valores de salida
    const [output] = await connection.query(
      'SELECT @p_result_code as result_code, @p_message as message'
    );

    const resultCode = output[0].result_code;
    const message = output[0].message;

    if (resultCode === 0) {
      return res.status(200).json({
        success: true,
        message: message
      });
    } else {
      return res.status(400).json({
        success: false,
        message: message
      });
    }

  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
