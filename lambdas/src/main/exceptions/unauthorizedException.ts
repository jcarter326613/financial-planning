import { HttpError } from "./httpError"

export class UnauthorizedException extends HttpError
{
    constructor()
    {
        super(401, "Unauthorized")
    }
}
