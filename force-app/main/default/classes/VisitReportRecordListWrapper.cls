/**
 * @description       : 
 * @author            : dirk.gronert@salesforce.com
 * @group             : 
 * @last modified on  : 09-03-2024
 * @last modified by  : dirk.gronert@salesforce.com
**/
global class VisitReportRecordListWrapper {
    
    @AuraEnabled 
    public String objectApiName {get;set;}
    @AuraEnabled 
    public String recsToCreate {get;set;}
    @AuraEnabled 
    public String recsToUpdate {get;set;}
    @AuraEnabled 
    public String recsToDelete {get;set;}
    
    public VisitReportRecordListWrapper() {}
    public VisitReportRecordListWrapper(String objectApiName, String recsToCreate, String recsToUpdate, String recsToDelete){
        this.objectApiName = objectApiName;
        this.recsToCreate = recsToCreate;
        this.recsToUpdate = recsToUpdate;
        this.recsToDelete = recsToDelete; 
    }
   
}