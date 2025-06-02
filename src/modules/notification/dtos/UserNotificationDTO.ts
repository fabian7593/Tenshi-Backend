
import {  Request, IAdapterFromBody } from "@modules/index";
import { Notification, UserNotification } from '@modules/01_General/notification/index';
import { Subject } from "typeorm/persistence/Subject";

export default  class UserNotificationDTO implements IAdapterFromBody{
    req: Request;

    constructor(req: Request) {
        this.req = req;
    }


    private getEntity(isCreating: boolean): any {

        const userNotification: Record<string, any> = {
            user_send : this.req.body.user_send_id || null,
            user_receive : this.req.body.user_receive_id,
            notification : this.req.body.notification_code,
            is_read : this.req.body.is_read || 0,
            is_deleted : this.req.body.is_deleted || 0,
            subject: this.req.body.subject || null,
            payload: this.req.body.payload || null,
            notification_message: this.req.body.notification_message || null,
            acronymous : this.req.body.acronymous || null
        };

        if (isCreating) {
            userNotification.created_date = new Date();
        } 

        return userNotification;
    }

    // POST
    entityFromPostBody(): any {
        return this.getEntity(true);
    }

    // PUT
    entityFromPutBody(): any {
        return this.getEntity(false);
    }

    entityToResponse(entity: UserNotification) : any{
        return  {
            id : entity.id,
            user_send: entity.user_send,
            user_receive: entity.user_receive,
            notification: entity.notification,
            payload: entity.payload,
            subject: entity.subject,
            notification_message: entity.notification_message,
            is_read: entity.is_read,
            created_date: entity.created_date
        };
    }

    entityToResponseCompleteInformation(entity: UserNotification, notification: Notification) : any{
       
        return  {
            id : entity.id,
            user_send: entity.user_send,
            user_receive: entity.user_receive,
            code: entity.notification,
            is_read: entity.is_read,
            type: notification.type,
            email_message: notification.email_message,
            another_message: notification.another_message,
            notification_message: notification.notification_message,
            subject: notification.subject,
            action_url: notification.action_url,
            created_date: entity.created_date,
        };
    }

    entitiesToResponse(entities: UserNotification[] | null): any {
        const response: any[] = [];
    
        if(entities != null){
            for (const entity of entities) {
                response.push(this.entityToResponse(entity));
            }
        }
        
        return response;
    }
}
