import { Request, IAdapterFromBody } from "@modules/index";
import { Notification } from '@modules/01_General/notification/index';
import { config } from "@index/index";

export default  class NotificationDTO implements IAdapterFromBody{
    req: Request;

    constructor(req: Request) {
        this.req = req;
    }

 private getEntity(isCreating: boolean): Notification {
        const entity = new Notification();
        entity.code = this.req.body.code;
        entity.type = this.req.body.type;
        entity.subject = this.req.body.subject;
        entity.email_message = this.req.body.email_message;
        entity.notification_message = this.req.body.notification_message;
        entity.another_message = this.req.body.another_message || null;
        entity.required_send_email = this.req.body.required_send_email || 0;
        entity.email_template = this.req.body.email_template || null;
        entity.action_text = this.req.body.action_text || null;
        entity.action_url = this.req.body.action_url;
        entity.language = this.req.body.language || config.SERVER.DEFAULT_LANGUAGE;
        entity.text_from_email_message_json = this.req.body.text_from_email_message_json || 0; 
        entity.is_deleted = this.req.body.is_deleted || 0;
        
        if (isCreating) {
            entity.created_date = new Date();
        } else {
            entity.updated_date = new Date();
        }
        return entity;
    }

    // POST
    entityFromPostBody(): Notification {
        return this.getEntity(true);
    }

    // PUT
    entityFromPutBody(): Notification {
        return this.getEntity(false);
    }

    entityToResponse(entity: Notification) : any{
        return  {
            id : entity.id,
            code: entity.code,
            type: entity.type,
            subject: entity.subject,
            email_message: entity.email_message,
            notification_message: entity.notification_message,
            another_message: entity.another_message,
            required_send_email: entity.required_send_email,
            email_template: entity.email_template,
            action_text: entity.action_text,
            action_url: entity.action_url,
            language: entity.language,
            text_from_email_message_json: entity.text_from_email_message_json,
            created_date: entity.created_date
        };
    }

    entitiesToResponse(entities: Notification[] | null): any {
        const response: any[] = [];
    
        if(entities != null){
            for (const entity of entities) {
                response.push(this.entityToResponse(entity));
            }
        }
        
        return response;
    }
}
