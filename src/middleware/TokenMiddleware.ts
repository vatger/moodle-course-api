import { NextFunction, Response, Request } from "express";
import { Config } from "../core/Config";

export async function authorizationTokenMiddleware(request: Request, response: Response, next: NextFunction) {
    let token = request.headers?.authorization ?? "";

    // Remove the token subsection
    const token_arr = token.split(" ");
    if (token_arr.length < 2) {
        response.status(401).send({ message: "Malformed token." });
        return;
    }
    token = token_arr[1];

    if (Config.APP_TOKEN != token) {
        response.status(401).send({ message: "Unauthorized." });
        return;
    }

    next();
}
