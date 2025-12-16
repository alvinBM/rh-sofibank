import User from "../models/User.js";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";

const checkPermission = (permissionsRequired) => {
    return async (req, res, next) => {
        const userId = req.user.id;

        try {
            const userWithRoles = await User.findOne({
                where: {
                    id: userId,
                    is_active: true,
                },
                include: [
                    {
                        model: Role,
                        as: 'roles',
                        through: { attributes: [] },
                        include: [
                            {
                                model: Permission,
                                as: 'permissions',
                                through: { attributes: [] }
                            },
                        ],
                    },
                ],
            });

            if (!userWithRoles) {
                return res.status(200).json({
                    status: 403,
                    message: 'Utilisateur non trouvé ou inactif'
                });
            }

            // Vérifier si l'utilisateur a le rôle SUPER_ADMIN ou ADMIN
            const isAdmin = userWithRoles.roles.some(
                (role) => role.code === 'SUPER_ADMIN' || role.code === 'ADMIN'
            );

            // Si admin, bypass la vérification des permissions
            if (isAdmin) {
                return next();
            }

            // Collecter toutes les permissions de l'utilisateur
            const userPermissions = new Set();
            userWithRoles.roles.forEach((role) => {
                role.permissions.forEach((permission) => {
                    userPermissions.add(permission.code);
                });
            });

            // Vérifier si l'utilisateur a toutes les permissions requises
            const hasAllPermissions = permissionsRequired.every((permission) =>
                userPermissions.has(permission)
            );

            if (!hasAllPermissions) {
                return res.status(200).json({
                    status: 403,
                    message: req.method === 'GET'
                        ? "Accès refusé : Vous n'avez pas le droit d'accéder à cette ressource"
                        : "Accès refusé : Vous n'avez pas le droit d'effectuer cette action",
                });
            }

            next();
        } catch (error) {
            console.error('Error checking permissions:', error);
            res.status(200).json({
                status: 500,
                message: "Une erreur s'est produite lors de la vérification des permissions",
            });
        }
    };
};

export default checkPermission;
