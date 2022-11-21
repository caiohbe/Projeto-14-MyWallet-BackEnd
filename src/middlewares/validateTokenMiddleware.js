export function validateToken (req, res, next) {
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", "")

    if (!token) {
        res.status(404).send("Token indisponível.")
        return
    }

    next()
}