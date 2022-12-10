import { Request, Response } from "express";

export enum SuccessStatuses {
    success = 200,
}
export enum ServerErrorStatuses {
    internal = 500,
}

export enum ClientErrorStatuses {
    notFound = 404,
}

export type Statuses = SuccessStatuses | ServerErrorStatuses | ClientErrorStatuses;


export default class BaseController {
    req: Request;
    res: Response;

    constructor(req: Request, res: Response) {
        this.req = req;
        this.res = res;
    }

    public execute(fn, args) {
        try {
           return fn.call(...args);
        } catch (e) {
            console.log(e);
            return this.sendInternalError();
        }
    }

    public sendSuccess (payload?) {
        return this.send(SuccessStatuses.success, payload);
    }

    public sendInternalError (payload?) {
        return this.send(ServerErrorStatuses.internal, payload);
    }

    public sendNotFound (payload?) {
        return this.send(ClientErrorStatuses.notFound, payload);
    }

    private send(status: Statuses, payload?: any) {
        if (payload) {
            return this.res.status(status).send(payload);
        }
        return this.res.sendStatus(status)
    }
    
}