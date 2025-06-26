import ConfigManager from '@TenshiJS/config/ConfigManager';
import { ConstStatusJson } from '@TenshiJS/consts/Const';
import HttpAction from '@TenshiJS/helpers/HttpAction';
import { Request, Response, NextFunction } from 'express';

export function MaintenanceMiddleware(req: Request, res: Response, next: NextFunction) {

    const config = ConfigManager.getInstance().getConfig();
    const httpExec = new HttpAction(res);

    if(config.SERVER.IN_MAINTENANCE){
        return httpExec.dynamicError(ConstStatusJson.SERVICE_UNAVAILABLE);
    }
   
    next();
}