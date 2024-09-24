public class VR_GetRelatedRecordsWithIds {

    // Inner class to define inputs for the Flow
    public class Request {
        @InvocableVariable(required=true)
        public Id opportunityId;
    }

    // Inner class for the Flow's output (two strings)
    public class StringResponse {
        @InvocableVariable
        public String jsonOutput;
        
        @InvocableVariable
        public String commaSeparatedOutput;
    }

    // Invocable method to be called by Flow
    @InvocableMethod(label='Get Related Opportunity, Contact, and Account Data as JSON and Comma-Separated String' 
                     description='Returns two strings: a JSON string containing Opportunity names, Contact names, Account name, and their respective IDs, along with the current date and time, and a comma-separated list of the same names')
    public static List<StringResponse> getOpportunityAndContactNamesAsJsonAndCommaSeparated(List<Request> requestList) {
        // Initialize response list for the flow
        List<StringResponse> stringResponseList = new List<StringResponse>();

        // Get the current date and time in ISO 8601 format
        String currentDateTime = Datetime.now().formatGmt('yyyy-MM-dd\'T\'HH:mm:ss\'Z\'');

        // Process each request
        for (Request req : requestList) {
            // Initialize the output strings
            String jsonOutput = '{\n';
            String commaSeparatedOutput = '';

            // Get the Opportunity to fetch AccountId and OwnerId
            Opportunity opp = [
                SELECT AccountId, OwnerId 
                FROM Opportunity 
                WHERE Id = :req.opportunityId 
                LIMIT 1
            ];

            if (opp != null && opp.AccountId != null) {
                // Get the Account name
                Account account = [
                    SELECT Name 
                    FROM Account 
                    WHERE Id = :opp.AccountId 
                    LIMIT 1
                ];

                // Append Account name to the JSON and comma-separated string
                jsonOutput += '  "Account": {\n';
                jsonOutput += '    "Name": "' + account.Name + '",\n';
                jsonOutput += '    "Id": "' + opp.AccountId + '"\n';
                jsonOutput += '  },\n';

                commaSeparatedOutput += account.Name;

                // Query all related Opportunities with the same AccountId and OwnerId
                List<Opportunity> relatedOpportunities = [
                    SELECT Id, Name 
                    FROM Opportunity 
                    WHERE AccountId = :opp.AccountId 
                    AND OwnerId = :opp.OwnerId
                ];

                // Query all Contacts related to the same AccountId
                List<Contact> relatedContacts = [
                    SELECT Id, Name 
                    FROM Contact 
                    WHERE AccountId = :opp.AccountId
                ];

                // Append Opportunities to the JSON and comma-separated string
                jsonOutput += '  "Opportunities": [\n';
                List<String> opportunityNames = new List<String>();
                for (Integer i = 0; i < relatedOpportunities.size(); i++) {
                    Opportunity relatedOpp = relatedOpportunities[i];
                    jsonOutput += '    {\n';
                    jsonOutput += '      "Name": "' + relatedOpp.Name + '",\n';
                    jsonOutput += '      "Id": "' + relatedOpp.Id + '"\n';
                    jsonOutput += '    }';
                    if (i < relatedOpportunities.size() - 1) {
                        jsonOutput += ',\n';
                    } else {
                        jsonOutput += '\n';
                    }
                    opportunityNames.add(relatedOpp.Name);
                }
                jsonOutput += '  ],\n';
                
                commaSeparatedOutput += ', ' + String.join(opportunityNames, ', ');

                // Append Contacts to the JSON and comma-separated string
                jsonOutput += '  "Contacts": [\n';
                List<String> contactNames = new List<String>();
                for (Integer i = 0; i < relatedContacts.size(); i++) {
                    Contact relatedContact = relatedContacts[i];
                    jsonOutput += '    {\n';
                    jsonOutput += '      "Name": "' + relatedContact.Name + '",\n';
                    jsonOutput += '      "Id": "' + relatedContact.Id + '"\n';
                    jsonOutput += '    }';
                    if (i < relatedContacts.size() - 1) {
                        jsonOutput += ',\n';
                    } else {
                        jsonOutput += '\n';
                    }
                    contactNames.add(relatedContact.Name);
                }
                jsonOutput += '  ],\n';

                commaSeparatedOutput += ', ' + String.join(contactNames, ', ');
            }

            // Append the current date and time to the JSON string
            jsonOutput += '  "CurrentDateTime": "' + currentDateTime + '"\n';

            // Close the JSON structure
            jsonOutput += '}';

            // Create the StringResponse object and add it to the response list
            StringResponse stringResp = new StringResponse();
            stringResp.jsonOutput = jsonOutput;
            stringResp.commaSeparatedOutput = commaSeparatedOutput;
            stringResponseList.add(stringResp);
        }

        // Return the list of responses
        return stringResponseList;
    }
}