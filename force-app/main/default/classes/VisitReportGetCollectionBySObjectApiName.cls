public class VisitReportGetCollectionBySObjectApiName {
	@InvocableMethod(label='Retrive sObject Collection' description='Retrive sObject Collection by Type and State')
  	public static List<List<sObject>> execute (List<Requests> requestList) {
        
        List<List<sObject>> result = new List<List<sObject>>();
        for (Requests request : requestList) 
            result.add(VisitReportResultProcessingUtilities.getRecords(request.resultWrapper, request.objectAPIName, request.stateName));
        return result;
  	}

    public class Requests {
        @InvocableVariable(label='Results of the LWC' description='Results of the LWC' required=true)
        public VisitReportObjectWrapper resultWrapper;
        @InvocableVariable(label='Object API Name' description='Object API Name of the target Model' required=true)
        public String objectAPIName;
        @InvocableVariable(label='State Name' description='State Name (recsTo[Create|Update|Delete])' required=true)
        public String stateName;
    }
}