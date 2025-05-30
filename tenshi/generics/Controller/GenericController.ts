import JWTObject  from 'tenshi/objects/JWTObject';
import HttpAction from 'tenshi/helpers/HttpAction';

import { EntityTarget, RequestHandler } from 'tenshi/generics/index';

import IGenericRepository from 'tenshi/generics/Repository/IGenericRepository';
import GenericRepository from 'tenshi/generics/Repository/GenericRepository';

import IGenericController from 'tenshi/generics/Controller/IGenericController';

import { ConstHTTPRequest, ConstStatusJson, ConstMessagesJson, ConstFunctions } from "tenshi/consts/Const";
import GenericValidation from '../Validation/GenericValidation';
import { camelToUpperSnakeCase, getEntityName } from 'tenshi/utils/generalUtils';
import IGenericService from '../Services/IGenericService';
import GenericService from '../Services/GenericService';

/*
    This class have the necessary methods (CRUDS) to send into the routing
    You need to send the entity type, the models generated by de TYPE ORM &&
    Then you send the controller object, with all the specific names of the specific entity
    PD: IF YOU NEED TO OVERRIDE OR ADDED MORE METHODS, YOU NEED TO CREATE ANOTHER CONTROLLER AND EXTEND THIS
*/7
export default  class GenericController extends GenericValidation implements IGenericController {
    private entityType : EntityTarget<any>;
    private service : IGenericService;
    private controllerName : string;
    private entityName : string;

    /**
     * Constructor of the GenericController class.
     * This class needs the type of the entity of the ORM, and the controller object.
     * @param {EntityTarget<any>} entityType - The type of the entity of the ORM.
     * @param {IGenericRepository | null} repositoryClass - The repository class of the entity.
     *                                                      If it's not passed, a new instance of GenericRepository will be created.
     */
    constructor(entityType: EntityTarget<any>, repositoryClass: IGenericRepository | null = null, service: IGenericService = new GenericService()) {
        super();

        // Set the entity type.
        this.entityType = entityType;

        //set the entity name
        this.entityName = getEntityName(entityType);

        // Set the controller name
        this.controllerName =  `${camelToUpperSnakeCase(getEntityName(entityType))}${ConstFunctions.CONTROLLER}`;

        // Create the controller object using the entity type.
        this.service = service;
        this.service.setControllerName(this.controllerName);

        // Check if the repository class is passed.
        // If not, create a new instance of GenericRepository using the entity type.
        // Otherwise, set the repository class.
        if(repositoryClass == null){
            this.setRepository(new GenericRepository(this.entityType));
        }else{
            this.setRepository(repositoryClass);
        }

        this.service.setRepositoryServiceValidation(this.getRepository());
    }
   
    public getRepository(): IGenericRepository {
        return this.getValidationRepository();
    }

    public getEntityName(): string {
        return this.entityName;
    }

    public getControllerName(): string {
        return this.controllerName;
    }

    public getService(): IGenericService {
        return this.service;
    }

    /**
     * Insert an entity into the database.
     *
     * @param reqHandler - The request handler.
     * @returns A promise that resolves to the inserted entity.
     */
    async insert(reqHandler: RequestHandler): Promise<any> {

        return this.service.insertService(reqHandler, async (jwtData, httpExec, body) => {

            // Set the user ID of the entity with the ID of the JWT
            body = this.setUserId(body, jwtData!.id);

            try{
               
                // Insert the entity into the database
                const createdEntity = await this.getRepository().add(body);

                const codeResponse : string = 
                reqHandler.getCodeMessageResponse() != null ? 
                reqHandler.getCodeMessageResponse() as string :
                ConstHTTPRequest.INSERT_SUCCESS;

                // Return the success response
                return httpExec.successAction(
                    reqHandler.getAdapter().entityToResponse(createdEntity), 
                    codeResponse);

            }catch(error : any){
                // Return the database error response
                return await httpExec.databaseError(error, jwtData!.id.toString(), 
                reqHandler.getMethod(), this.controllerName);
            }
        });
     }
  

     /**
      * Update an entity in the database.
      *
      * @param reqHandler - The request handler.
      * @returns A promise that resolves to the updated entity.
      */
     async update(reqHandler: RequestHandler): Promise<any> {

        return this.service.updateService(reqHandler, async (jwtData, httpExec, id) => {

            // Get data from the body
            const body = reqHandler.getAdapter().entityFromPutBody();

            try {
                // Execute the update action in the database
                const updateEntity = await this.getRepository().update(id!!, body,
                                                             reqHandler.getLogicalDelete());

                if(updateEntity == null){
                    return httpExec.dynamicError(ConstStatusJson.NOT_FOUND, ConstMessagesJson.DONT_EXISTS);
                }

                const codeResponse : string = 
                reqHandler.getCodeMessageResponse() != null ? 
                reqHandler.getCodeMessageResponse() as string :
                ConstHTTPRequest.UPDATE_SUCCESS;

                // Return the success response
                return httpExec.successAction(
                    reqHandler.getAdapter().entityToResponse(updateEntity), 
                    codeResponse);

            } catch (error: any) {
                // Return the database error response
                return await httpExec.databaseError(error, jwtData.id.toString(), 
                reqHandler.getMethod(), this.controllerName);
            }
        });
     }

     /**
      * Delete an entity from the database.
      *
      * @param reqHandler - The request handler.
      * @returns A promise that resolves to the deleted entity.
      */
     async delete(reqHandler: RequestHandler): Promise<any> {

        return this.service.deleteService(reqHandler, async (jwtData, httpExec, id) => {
            try{
                // Execute the delete action in the database
                if(reqHandler.getLogicalDelete()){
                    // Logically remove the entity from the database
                    const deletedEntity = await this.getRepository().logicalRemove(id);

                    const codeResponse : string = 
                    reqHandler.getCodeMessageResponse() != null ? 
                    reqHandler.getCodeMessageResponse() as string :
                    ConstHTTPRequest.DELETE_SUCCESS;
    
                    // Return the success response
                    return httpExec.successAction(
                        reqHandler.getAdapter().entityToResponse(deletedEntity), 
                        codeResponse);
                }else{
                    // Remove the entity from the database
                    const deletedEntity = await this.getRepository().remove(id);
                    return httpExec.successAction(reqHandler.getAdapter().entityToResponse(deletedEntity), ConstHTTPRequest.DELETE_SUCCESS);
                }
                
            }catch(error : any){
                // Return the database error response
                return await httpExec.databaseError(error, jwtData.id.toString(), 
                reqHandler.getMethod(), this.controllerName);
            }
        });
     }

     /**
      * Get an entity by its ID from the database.
      *
      * @param reqHandler - The request handler.
      * @returns A promise that resolves to the entity.
      */
     async getById(reqHandler: RequestHandler): Promise<any> {

        return this.service.getByIdService(reqHandler, async (jwtData, httpExec, id) => {
            try{
                // Execute the get by id action in the database
                const entity = await this.getRepository().findById(id, reqHandler.getLogicalDelete(), reqHandler.getFilters());

                if(entity != null && entity != undefined){

                    const codeResponse : string = 
                    reqHandler.getCodeMessageResponse() != null ? 
                    reqHandler.getCodeMessageResponse() as string :
                    ConstHTTPRequest.GET_BY_ID_SUCCESS;
    
                    // Return the success response
                    return httpExec.successAction(
                        reqHandler.getAdapter().entityToResponse(entity), 
                        codeResponse);

                }else{
                    return httpExec.dynamicError(ConstStatusJson.NOT_FOUND, ConstMessagesJson.DONT_EXISTS);
                }
                
            }catch(error : any){
                // Return the database error response
                return await httpExec.databaseError(error, jwtData.id.toString(), 
                reqHandler.getMethod(), this.controllerName);
            }
        });
     }


     /**
      * Get an entity by its code from the database.
      *
      * @param reqHandler - The request handler.
      * @returns A promise that resolves to the entity.
      */
     async getByCode(reqHandler: RequestHandler): Promise<any> {

        return this.service.getByCodeService(reqHandler, async (jwtData, httpExec, code) => {
            try{
                // Execute the get by code action in the database
                const entity = await this.getRepository().findByCode(code, reqHandler.getLogicalDelete(), reqHandler.getFilters());
                if(entity != null && entity != undefined){

                    const codeResponse : string = 
                    reqHandler.getCodeMessageResponse() != null ? 
                    reqHandler.getCodeMessageResponse() as string :
                    ConstHTTPRequest.GET_BY_ID_SUCCESS;
    
                    // Return the success response
                    return httpExec.successAction(
                        reqHandler.getAdapter().entityToResponse(entity), 
                        codeResponse);

                }else{
                    return httpExec.dynamicError(ConstStatusJson.NOT_FOUND, ConstMessagesJson.DONT_EXISTS);
                }
                
            }catch(error : any){
                // Return the database error response
                return await httpExec.databaseError(error, jwtData.id.toString(), 
                reqHandler.getMethod(), this.controllerName);
            }
        });
     }
   

    /**
     * Retrieves all entities from the database.
     *
     * @param reqHandler - The request handler.
     * @returns A promise that resolves to the entities.
     */
    async getAll(reqHandler: RequestHandler): Promise<any> {

        return this.service.getAllService(reqHandler, async (jwtData : JWTObject, httpExec: HttpAction, page: number, size: number) => {
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
                    reqHandler.getMethod(), this.controllerName);
            }
        });
    }


   /**************************************************** */
   //                    ADD MULTIPLE
   /**************************************************** */
   async insertMultiple(reqHandler: RequestHandler): Promise<any> {
    return this.service.insertMultipleService(
            reqHandler,
            async (jwtData, httpExec, item) => {
                try {
                    // Insert the entity into the database
                    const entity = reqHandler.getAdapter().entityFromObject!(item, true);
                    const createdEntity = await this.getRepository().add(entity);

                    return reqHandler.getAdapter().entityToResponse(createdEntity);
                } catch (error: any) {
                    throw new Error(error.message || "Insert failed");
                }
            }
        );
    }

    async updateMultiple(reqHandler: RequestHandler): Promise<any> {
        return this.service.updateMultipleService(
          reqHandler,
          async (jwtData, httpExec, id, item) => {
            try{
                // Use the adapter to build the entity from the per‐item body
                // Perform update in repository
                const updatedEntity = await this.getRepository().update(id, item, reqHandler.getLogicalDelete());
                if (!updatedEntity) {
                    throw new Error(ConstMessagesJson.DONT_EXISTS);
                }

                // Return the transformed response
                return reqHandler.getAdapter().entityToResponse(updatedEntity);
            }catch(error : any){
                throw new Error(error.message || "Update failed");
            }
          }
        );
    }


    /**
     * PATCH /bulk_update_by_ids
     * Bulk‐update a set of records by IDs, using the payload fields.
     */
    async updateMultipleByIds(reqHandler: RequestHandler): Promise<any> {
        return this.service.updateMultipleByIdsService(
            reqHandler,
            // per‐item update callback
            async (jwtData, httpExec, id, payload) => {
                // call your generic repository update(id, data, logicalDeleteFlag)
                const updatedEntity = await this.getRepository().update(id, payload, reqHandler.getLogicalDelete());

                if (!updatedEntity) {
                    // not found → bubble up as error
                    throw new Error(`Entity not found for id ${id}`);
                }
                // transform for response
                return reqHandler.getAdapter().entityToResponse(updatedEntity);
            }
        );
    }

    async deleteMultiple(reqHandler: RequestHandler): Promise<any> {
        return this.service.deleteMultipleService(
          reqHandler,
          // callback invoked for each id
          async (jwtData, httpExec, id) => {
            // pick logical vs hard delete:
            if (reqHandler.getLogicalDelete()) {
              return await this.getRepository().logicalRemove(id);
            } else {
              return await this.getRepository().remove(id);
            }
          }
        );
      }

}