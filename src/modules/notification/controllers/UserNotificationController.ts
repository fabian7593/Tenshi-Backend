import { HttpAction, config } from "@index/index";
import { DBPersistanceFactory } from "@TenshiJS/persistance/DBPersistanceFactory";

import { GenericRepository, 
         GenericController, RequestHandler,
         JWTObject } from "@modules/index";

import { UserNotification, Notification, User, 
         UserNotificationDTO } from "@modules/01_General/notification/index";
import { executeDatabaseQuery } from "@TenshiJS/persistance/DataBaseHelper/ExecuteQuery";

import {  ConstHTTPRequest, ConstMessagesJson, ConstStatusJson } from "@TenshiJS/consts/Const";
import { UserRepository } from "@modules/01_General/user";
import { sendEmailAndUserNotification } from "../utils/NotificationUtils";

export default  class UserNotificationController extends GenericController{

    constructor() {
        super(UserNotification,new UserRepository);
    }

    /**
     * This function is used to insert a new user notification in the database.
     * It performs the following steps:
     * 1. Validates the role of the user.
     * 2. Validates the required fields of the entity.
     * 3. Validates the regex of the entity.
     * 4. Executes the function provided as a parameter.
     * 5. Returns a success response if the insertion is successful.
     * 6. Returns a database error response if there is an error while inserting the entity.
     * 7. Returns a general error response if there is an error while performing the above steps.
     * 
     * @param {RequestHandler} reqHandler - The request handler object.
     * @return {Promise<any>} A promise that resolves to the success response if the insertion is successful.
     */
    async insert(reqHandler: RequestHandler) : Promise<any>{

        return this.getService().insertService(reqHandler, async (jwtData, httpExec) => {
            const repositoryNotification = await new GenericRepository(Notification);

            //Get data From some tables
            const userNotifications = reqHandler.getAdapter().entityFromPostBody();

            const notification : Notification = await repositoryNotification.findByCode(userNotifications.notification, true);
            
            if (!notification) {
                return httpExec.dynamicError(ConstStatusJson.NOT_FOUND, ConstMessagesJson.DONT_EXISTS);
            }

            const userNotificationAdded = await sendEmailAndUserNotification(userNotifications, {supplierName:"Doctor clinica bilbica", patientName:"Juan Perez"});
            
            try{
                if(userNotificationAdded == null){
                    return httpExec.dynamicError(ConstStatusJson.NOT_FOUND, ConstMessagesJson.DONT_EXISTS);
                }
                //Execute Action DB
                const responseWithNewAdapter = (reqHandler.getAdapter() as UserNotificationDTO).entityToResponseCompleteInformation(userNotificationAdded, notification);
                return httpExec.successAction(responseWithNewAdapter, ConstHTTPRequest.INSERT_SUCCESS);
            
            }catch(error : any){
                return await httpExec.databaseError(error, jwtData!.id.toString(), 
                reqHandler.getMethod(), this.getControllerName());
            }
        });
    }




    async update(reqHandler: RequestHandler): Promise<any>{
        return this.getService().updateService(reqHandler, async (jwtData, httpExec, id) => {

            const repository = await new GenericRepository(UserNotification);
            const repositoryNotification = await new GenericRepository(Notification);

            //If you need to validate if the user id of the table 
            //should be the user id of the user request (JWT)
            let userId : number | string | null= null;
            let userNotification : UserNotification;
            userNotification = await repository.findById(id!!, reqHandler.getLogicalDelete());

            if(userNotification != undefined && userNotification != null){}
            else{
                return httpExec.dynamicError(ConstStatusJson.NOT_FOUND, ConstMessagesJson.DONT_EXISTS);
            }

            userNotification.is_read = true;
            try{
                //Execute Action DB
                const updateEntity = await repository.update(id!!, userNotification,  
                                                             reqHandler.getLogicalDelete());

                const notification : Notification = await repositoryNotification.findByCode(updateEntity.notificationCode, false);

                const responseWithNewAdapter = (reqHandler.getAdapter() as UserNotificationDTO).entityToResponseCompleteInformation(updateEntity, notification);
                return httpExec.successAction(responseWithNewAdapter, ConstHTTPRequest.UPDATE_SUCCESS);

            }catch(error : any){
                return await httpExec.databaseError(error, jwtData.id.toString(), 
                reqHandler.getMethod(), this.getControllerName());
            }
        });
     }

      async getAll(reqHandler: RequestHandler): Promise<any> {
        return this.getService().getAllService(reqHandler, async (jwtData : JWTObject, httpExec: HttpAction, page: number, size: number) => {
            try {

                // Execute the get all action in the database

                const entities = this.getRepository().findAll(reqHandler.getLogicalDelete(), reqHandler.getFilters(), page, size);
                const pagination = this.getRepository().count(reqHandler.getLogicalDelete(), reqHandler.getFilters(), page, size);

                if(entities != null && entities != undefined){

                    const codeResponse : string = 
                    reqHandler.getCodeMessageResponse() != null ? 
                    reqHandler.getCodeMessageResponse() as string :
                    ConstHTTPRequest.GET_ALL_SUCCESS;
    
                    // Return the success response
                    return httpExec.successAction(
                        reqHandler.getAdapter().entitiesToResponse(await entities), 
                        codeResponse, await pagination);

                }else{
                    return httpExec.dynamicError(ConstStatusJson.NOT_FOUND, ConstMessagesJson.DONT_EXISTS);
                }

            } catch (error: any) {
                // Return the database error response
                return await httpExec.databaseError(error, jwtData.id.toString(),
                    reqHandler.getMethod(), this.getControllerName());
            }
        });
     }

    /* async getByFilters(reqHandler: RequestHandler): Promise<any> {
        return this.getService().getAllService(reqHandler, async (jwtData : JWTObject, httpExec: HttpAction, page: number, size: number) => {
            try{
                // Get the filters from the request query parameters
                let userReceive : string | null = null;
                if(reqHandler.getRequest().query['user_receive'] != undefined){
                    userReceive = reqHandler.getRequest().query['user_receive'] as string;
                }
    
                let userSend : string | null = null;
                if(reqHandler.getRequest().query['user_send'] != undefined){
                    userSend = reqHandler.getRequest().query['user_send'] as string;
                }

                // Execute the get by filters action in the database
                const entities = await this.getAllUserNotifications(userReceive, userSend, page, size);

                // Filter the OkPacket
                const data = entities.filter((item: any) => !('affectedRows' in item));

                // Return the success response
                return httpExec.successAction(data, ConstHTTPRequest.GET_ALL_SUCCESS);
            }catch(error : any){
                // Return the database error response
                return await httpExec.databaseError(error, jwtData.id.toString(), 
                reqHandler.getMethod(), this.getControllerName());
            }
        });
     }
 
     async getAllUserNotifications(userReceive : string | null, userSend : string | null,
                                   page: number, size : number ): Promise<any>{

            const dbAdapter = DBPersistanceFactory.createDBAdapterPersistance(config.DB.TYPE);
            return await executeDatabaseQuery(dbAdapter, async (conn) => {
                const result = await dbAdapter.executeQuery(conn,
                    "CALL GetUserNotifications(?, ?, ?, ?)",
                    [userSend, userReceive, size, page] 
                );
                return result;
            });
                     
     }*/
}