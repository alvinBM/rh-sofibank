import joi from "joi";
import checkModel from "../helpers/checkModel.js";
import helpers from "../helpers/helpers.js";
import joiErrorsTranlater from "../helpers/joiErrorsTranlater.js";

const userValidation = {
    login: (req, res, next) => {
        const schema = joi.object({
            login: joi.string().min(5).required(),
            password: joi.string().min(4).required(),
        });
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(200).json({
                status: 400,
                message: error.details[0].message,
                message_fr: joiErrorsTranlater(error),
            });
        }
        next();
    },
    activateAccount: (req, res, next) => {
        const schema = joi.object({
            public_token: joi.string().min(1).required(),
            otp: joi.string().min(5).max(6).required(),
        });
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(200).json({
                status: 400,
                message: error.details[0].message,
                message_fr: joiErrorsTranlater(error),
            });
        }
        next();
    },
    update: (req, res, next) => {
        const schema = joi.object({
            firstname: joi.string().min(3).max(50).required(),
            lastname: joi.string().min(3).max(50).required(),
            city: joi.string().allow("").optional(),
            country: joi.string().allow("").optional(),
        });

        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(200).json({
                status: 400,
                message: error.details[0].message,
                message_fr: joiErrorsTranlater(error),
            });
        }
        next();
    },
    updatePassword: (req, res, next) => {
        const schema = joi.object({
            password: joi.string().min(6).max(50).required(),
            new_password: joi.string().min(6).max(50).required(),
        });

        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(200).json({
                status: 400,
                message: error.details[0].message,
                message_fr: joiErrorsTranlater(error),
            });
        }
        next();
    },
    register: async (req, res, next) => {
        /**Validation rules */
        const schema = joi.object({
            firstname: joi.string().min(3).max(20).required(),
            lastname: joi.string().min(3).max(20).required(),
            phone: joi.string().min(8).max(20).required(),
            password: joi.string().min(6).max(50).required(),
            country: joi.string().min(2).max(4).required(),
            city: joi.string().required(),
            email: joi.string().allow(null).optional(),
            token: joi.string().min(1).required(),
        });

        /**Object to compare with  */
        const { error } = schema.validate(req.body);

        if (error) {
            if (req.file) await helpers.deleteFile(req.file.path);
            return res.status(200).json({
                status: 400,
                message: error.details[0].message,
                message_fr: joiErrorsTranlater(error),
            });
        }

        let condition = {
            where: {
                phone: req.body.phone,
            },
        };
        const checkPhone = await checkModel
            .Users(condition)
            .then()
            .catch((er) => console.error(er));

        if (checkPhone) {
            //if(req.file) await helpers.deleteFile(req.file.path);
            return res.status(200).json({
                status: 400,
                message: "Le numéro de telephone est déjà utilisé. Veuillez choisir un autre ou recupérer votre compte si vous avez oublié le mot de passe",
            });
        }

        if (req.body.email) {
            condition = {
                where: {
                    email: req.body.email,
                },
            };
            const checkEmail = await checkModel
                .Users(condition)
                .then()
                .catch((er) => console.error(er));

            if (checkEmail) {
                if (req.file) await helpers.deleteFile(req.file.path);
                return res.status(200).json({
                    status: 400,
                    message: "L'adresse email est déjà utilisée. Veuillez choisir une autre adresse email",
                });
            }
        }
        return next();
    },
    registerWithPhoneNumber: async (req, res, next) => {
        /**Validation rules */
        const schema = joi.object({
            phone: joi.string().min(7).max(20).required(),
            country: joi.string(),
        });

        /**Object to compare with  */
        const { error } = schema.validate(req.body);

        if (error) {
            if (req.file) await helpers.deleteFile(req.file.path);
            return res.status(200).json({
                status: 400,
                message: error.details[0].message,
                message_fr: joiErrorsTranlater(error),
            });
        }

        let condition = {
            where: {
                phone: req.body.phone,
            },
        };
        const checkPhone = await checkModel
            .Users(condition)
            .then()
            .catch((er) => console.error(er));

        if (checkPhone) {
            return res.status(200).json({
                status: 400,
                message: "Le numéro de telephone " + req.body.phone + " est déjà utilisé. Veuillez choisir un autre ou recupérer votre compte si vous avez oublié le mot de passe",
            });
        }
        return next();
    },
    completRegistationWithNumber: (req, res, next) => {
        const schema = joi.object({
            name: joi.string().min(3).max(30).required(),
            username: joi.string().min(3).max(30).required(),
            otp: joi.string().min(5).max(8).required(),
            user_id: joi.number().required(),
            password: joi.string().min(4).max(50).required(),
        });

        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(200).json({
                status: 400,
                message: error.details[0].message,
                message_fr: joiErrorsTranlater(error),
            });
        }
        next();
    },
    createUser: (req, res, next) => {
        const schema = joi.object({
            firstname: joi.string().min(2).max(50).required(),
            lastname: joi.string().min(2).max(50).required(),
            phone: joi.string().min(7).max(20).required(),
            email: joi.string().allow("").optional(),
            password: joi.string().min(6).max(50).required(),
            roles: joi.string().required(),
            store_id: joi.number().required(),
        });

        const { error } = schema.validate(req.body);

        if (error) {
            return res.status(200).json({
                status: 400,
                message: error.details[0].message,
                message_fr: joiErrorsTranlater(error),
            });
        }
        next();
    },
    editUser: (req, res, next) => {
        const schema = joi.object({
            firstname: joi.string().min(3).max(20).required(),
            lastname: joi.string().min(3).max(20).required(),
            phone: joi.string().min(8).max(20).required(),
            email: joi.string().allow("").optional(),
            roles: joi.string().required(),
            store_id: joi.number().required(),
            user_id: joi.number().required(),
        });

        const { error } = schema.validate(req.body);

        if (error) {
            return res.status(200).json({
                status: 400,
                message: error.details[0].message,
                message_fr: joiErrorsTranlater(error),
            });
        }
        next();
    },
};

export default userValidation;
