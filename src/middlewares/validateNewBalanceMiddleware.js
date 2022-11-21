import joi from "joi";

const newBalanceSchema = joi.object({
    description: joi.string().required(),
    value: joi.number().required(),
    type: joi.string().required().valid("outcome", "income")
})

export function validateNewBalance (req, res, next) {
    const validation = newBalanceSchema.validate(req.body, { abortEarly: false })

    if (validation.error) {
        const errors = validation.error.details.map(detail => detail.message)
        res.status(422).send(errors)
        return
    }

    next()
}