public class VisitReportResultProcessingUtilities {

    /* ACCOUNTS */
    public static List<Account> getAccountsToCreate(VisitReportObjectWrapper vrop){
        return (List<Account>) getRecordsToCreate(vrop, 'Account');
    }
    public static List<Account> getAccountsToUpdate(VisitReportObjectWrapper vrop){
        return (List<Account>) getRecordsToUpdate(vrop, 'Account');
    }    
    public static List<Account> getAccountsToDelete(VisitReportObjectWrapper vrop){
        return (List<Account>) getRecordsToDelete(vrop, 'Account');
    }   

    /* CONTACTS */
    public static List<Contact> getContactsToCreate(VisitReportObjectWrapper vrop){
        return (List<Contact>) getRecordsToCreate(vrop, 'Contact');
    }
    public static List<Contact> getContactsToUpdate(VisitReportObjectWrapper vrop){
        return (List<Contact>) getRecordsToUpdate(vrop, 'Contact');
    }    
    public static List<Contact> getContactsToDelete(VisitReportObjectWrapper vrop){
        return (List<Contact>) getRecordsToDelete(vrop, 'Contact');
    }   
    
    /* TASKS */
    public static List<Task> getTasksToCreate(VisitReportObjectWrapper vrop){
        return (List<Task>) getRecordsToCreate(vrop, 'Task');
    }
    public static List<Task> getTasksToUpdate(VisitReportObjectWrapper vrop){
        return (List<Task>) getRecordsToUpdate(vrop, 'Task');
    }    
    public static List<Task> getTasksToDelete(VisitReportObjectWrapper vrop){
        return (List<Task>) getRecordsToDelete(vrop, 'Task');
    }   

	/* GENERIC */
    public static List<sObject> getRecordsToCreate(VisitReportObjectWrapper vrop, String objectAPIName){
        return getRecords(vrop, objectAPIName, 'recsToCreate');
    }
    
    public static List<sObject> getRecordsToUpdate(VisitReportObjectWrapper vrop, String objectAPIName){
        return getRecords(vrop, objectAPIName, 'recsToUpdate');
    }
    
    public static List<sObject> getRecordsToDelete(VisitReportObjectWrapper vrop, String objectAPIName){
        return getRecords(vrop, objectAPIName, 'recsToDelete');
    }
    
    public static List<sObject> getRecords(VisitReportObjectWrapper vrop, String objectAPIName, String state){
        List<sObject> result = new List<sObject>();
        if(vrop != null && vrop.objects != null && !String.isBlank(objectAPIName) && !String.isBlank(state)){
            for(VisitReportRecordListWrapper vrrlw : vrop.objects){
                if(vrrlw.objectApiName == objectAPIName){
                    String recListJSON = '';
                    if(vrrlw != null){
                        switch on state {
                            when 'recsToCreate' { recListJSON = vrrlw.recsToCreate; }	
                            when 'recsToUpdate' { recListJSON = vrrlw.recsToUpdate; }
                            when 'recsToDelete' { recListJSON = vrrlw.recsToDelete; }
                        }
                        if(!String.isBlank(recListJSON))
                            try{
                                result.addAll((List<SObject>)JSON.deserialize(recListJSON, List<Sobject>.class));                    
                            }catch(Exception e){
                                System.debug(e.getMessage());   
                            }
                    }
                    break;
                }
            }
            
        }
    	return result;
    }
    
}