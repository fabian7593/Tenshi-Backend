
import { Request  } from "@modules/index";
export const requiredBodyList = (req: Request): string[] => {
    return [
        req.body.user_receive_id, 
        req.body.notification_code
    ];
}

