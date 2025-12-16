import jwt from 'jsonwebtoken';

const validateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(200).json({
                status: 401,
                message: 'Token manquant. Veuillez vous connecter.'
            });
        }

        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(200).json({
                status: 401,
                message: 'Token invalide. Veuillez vous reconnecter.'
            });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decodedToken;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(200).json({
                status: 401,
                message: 'Votre session a expiré. Veuillez vous reconnecter pour continuer.'
            });
        }
        
        return res.status(200).json({
            status: 401,
            message: 'Token invalide. Veuillez vous reconnecter.'
        });
    }
};

export default validateToken;
