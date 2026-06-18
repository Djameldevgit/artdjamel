const Users = require("../models/userModel");
 
class APIfeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    paginating() {
        const page = this.queryString.page * 1 || 1
        const limit = this.queryString.limit * 1 || 9
        const skip = (page - 1) * limit
        this.query = this.query.skip(skip).limit(limit)
        return this;
    }
}

const userCtrl = {
    // Controlador para obtener la cuenta total de usuarios
    getUsersCount: async (req, res) => {
        try {
            const counttotal = await Users.countDocuments(); // Solo cuenta los documentos (usuarios)
            res.json({ counttotal }); // Envía la cuenta como respuesta
        } catch (err) {
            res.status(500).json({ msg: err.message });
        }
    },




    getActiveUsersLast24h: async (req, res) => {
        try {
            // Obtenemos usuarios que se han logueado en las últimas 24 horas
            const features = new APIfeatures(
                Users.find({ lastLogin: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
                req.query
            ).paginating();

            // Ordenamos por la fecha de último inicio de sesión
            const users = await features.query
                .sort('-lastLogin')  // Ordena por el último login en lugar de 'createdAt'
                .populate("user likes", "avatar username followers");

            // Enviamos la cantidad de usuarios y la lista
            res.json({
                count: users.length, // Cantidad de usuarios obtenidos
                users // Lista de usuarios activos
            });
        } catch (err) {
            res.status(500).json({ msg: err.message });
        }
    },



    getActiveUsersLast3h: async (req, res) => {
        try {
            // Obtenemos usuarios que se han logueado en las últimas 24 horas
            const features = new APIfeatures(
                Users.find({ lastLogin: { $gte: new Date(Date.now() - 3 * 60 * 60 * 1000) } }),
                req.query
            ).paginating();

            // Ordenamos por la fecha de último inicio de sesión
            const users = await features.query
                .sort('-lastLogin')  // Ordena por el último login en lugar de 'createdAt'
                .populate("user likes", "avatar username followers");

            // Enviamos la cantidad de usuarios y la lista
            res.json({
                count: users.length, // Cantidad de usuarios obtenidos
                users // Lista de usuarios activos
            });
        } catch (err) {
            res.status(500).json({ msg: err.message });
        }
    },
    
  
searchUser: async (req, res) => {
    try {
        const users = await Users.find({username: {$regex: req.query.username}})
        .limit(10).select("username avatar")
        
        res.json({users})
    } catch (err) {
        return res.status(500).json({msg: err.message})
    }
},
/*
    getUser: async (req, res) => {
        // Manejo de headers con valores por defecto
        const upgradeInsecureRequests = req.headers['upgrade-insecure-requests'] || 'No data';
        const host = req.headers['host'] || 'No host';
        const cookies = req.headers['cookie'] || 'No cookies';
        const cacheControl = req.headers['cache-control'] || 'No cache control';
        const xForwardedFor = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const acceptLanguage = req.headers['accept-language'] || 'No language';
        const referer = req.headers['referer'] || 'No referer';
        const authHeader = req.headers['authorization'] || 'No authorization';
        const contentType = req.headers['content-type'] || 'No content type';
        const accept = req.headers['accept'] || 'No accept';
        const userAgent = req.headers['user-agent'] || 'No user agent';
    
        console.log({ upgradeInsecureRequests, host, cookies, cacheControl, xForwardedFor, acceptLanguage, referer, authHeader, contentType, accept, userAgent });
    
        try {
            const user = await Users.findById(req.params.id).select('-password')
                .populate("followers following", "-password");
            if (!user) return res.status(400).json({ msg: "User does not exist." });
    
            res.json({ user });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    */
    

   
    getUser: async (req, res) => {
        try {
            const user = await Users.findById(req.params.id)
            .select('-password')
            .populate("followers following", "esBloqueado")
            .populate({
                path: "blockData",
                match: { esBloqueado: true },  // Solo buscar datos de bloqueo si es bloqueado
                select: "esBloqueado motivo fechaBloqueo username avatar email"
            });
        
    
            if (!user) return res.status(400).json({ msg: "User does not exist." });
    
            res.json({ user });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    
    

    searchUser: async (req, res) => {
        try {
            const users = await Users.find({username: {$regex: req.query.username}})
            .limit(10).select(" username avatar")
            
            res.json({users})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    
      

}



module.exports = userCtrl