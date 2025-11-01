
//* en este archivo esta toda la logica backend para el login de usuario


//* imports:
import { getConnection } from "../db/connection.js";




// funcion para login de usuario:
export const loginUsuario = async (req, res) => {
    let connection;
    try {
        const { correo, contrasena } = req.body;


    // validar que se envíen los datos requeridos (campos no vacios)
    if (!correo || !contrasena) {
        return res.status(400).json({
        success: false,
        message: "El correo y la contraseña son obligatorios",
        });
    }


    // conexión a la base de datos
    connection = await getConnection();
    // llamar al stored procedure
    const [rows] = await connection.query(
        "CALL sp_verificar_login(?, ?, @outResultCode)",
        [correo, contrasena]
    );
    // obtener el código de resultado (1=usuario no existe, 2=contraseña incorrecta, 0=ok)
    const [[{ outResultCode }]] = await connection.query(
        "SELECT @outResultCode as outResultCode"
    );


    // validar el resultado del sp
    if (outResultCode === 1) {
        return res.status(401).json({
            success: false,
            message: "Usuario no existe",
        });
    }

    if (outResultCode === 2) {
        return res.status(401).json({
            success: false,
            message: "Contraseña incorrecta",
        });
    }

    // se devuelve el rowset con los datos del usuario
    const usuario = rows[0][0];

    return res.status(200).json({
        success: true,
        message: "Login exitoso",
        data: {
            id_usuario: usuario.id_usuario,
            tipo_rol: usuario.tipo_rol,
            id_escuela: usuario.id_escuela || null, // null para administradores y visitantes
            escuela: usuario.escuela || null, // nombre de la escuela
        },
    });
    } catch (error) {
    console.error("Error en login:", error);

    return res.status(500).json({
        success: false,
        message: "Error interno del servidor al procesar el login",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    } finally {
        if (connection) {
        connection.release();
        }
    }
};
