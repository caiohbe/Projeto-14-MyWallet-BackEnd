import joi from "joi";

const signInSchema = joi.object({
    email: joi.string().required(),
    password: joi.string().required()
})

export function validateSignIn (req, res, next) {
    const validation = signInSchema.validate(req.body, { abortEarly: false })

    if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message)
        res.status(422).send(errors)
        return
    }

    next()
}