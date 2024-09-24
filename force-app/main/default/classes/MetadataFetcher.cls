public with sharing class MetadataFetcher {
    public class FieldMetadata {
        public String apiName;
        public String type;
        public String format;
        public List<String> picklistValues;
    }

    public class ObjectMetadata {
        public String objectName;
        public Map<String, FieldMetadata> fields;
    }

    @InvocableMethod(label='Fetch Metadata for Objects' description='Fetches metadata for fields and returns JSON string in a structured format')
    public static List<String> fetchMetadata(List<String> inputJsonList) {
        List<String> resultJsonList = new List<String>();
        
        // Parse input JSON
        for (String inputJson : inputJsonList) {
            // Deserialize JSON into a Map<String, Object>
            Map<String, Object> inputMap = (Map<String, Object>) JSON.deserializeUntyped(inputJson);

            // Map to hold structured metadata for all objects in the JSON
            Map<String, Object> allObjectMetadata = new Map<String, Object>();

            // Loop through each object in the input JSON
            for (String objectName : inputMap.keySet()) {
                System.debug('Processing object: ' + objectName);  // Debugging object processing

                // Cast the field list to List<String>
                Object fieldsObj = inputMap.get(objectName);
                
                // Check if fieldsObj is a List
                if (fieldsObj instanceof List<Object>) {
                    List<Object> fieldNamesRaw = (List<Object>) fieldsObj;
                    List<String> fieldNames = new List<String>();

                    // Convert to List<String> by casting each field name
                    for (Object field : fieldNamesRaw) {
                        fieldNames.add((String) field);
                    }

                    // Map to hold field metadata
                    Map<String, FieldMetadata> fieldMetadataMap = new Map<String, FieldMetadata>();

                    // Retrieve field metadata for each field
                    if (Schema.getGlobalDescribe().containsKey(objectName)) {
                        DescribeSObjectResult objDescribe = Schema.getGlobalDescribe().get(objectName).getDescribe();
                        Map<String, Schema.SObjectField> fieldMap = objDescribe.fields.getMap();

                        for (String fieldName : fieldNames) {
                            if (fieldMap.containsKey(fieldName)) {
                                FieldMetadata fieldMetadata = new FieldMetadata();
                                fieldMetadata.apiName = fieldName;

                                // Get field describe result
                                Schema.DescribeFieldResult fieldDescribe = fieldMap.get(fieldName).getDescribe();
                                fieldMetadata.type = fieldDescribe.getType().name();
                                fieldMetadata.format = fieldDescribe.getSoapType().name();
                                
                                // If field is a picklist, fetch the picklist values
                                if (fieldDescribe.getType() == Schema.DisplayType.Picklist) {
                                    fieldMetadata.picklistValues = new List<String>();
                                    List<Schema.PicklistEntry> picklistEntries = fieldDescribe.getPicklistValues();
                                    for (Schema.PicklistEntry picklistEntry : picklistEntries) {
                                        fieldMetadata.picklistValues.add(picklistEntry.getLabel());
                                    }
                                }

                                System.debug('Field retrieved: ' + fieldMetadata.apiName + ' of type: ' + fieldMetadata.type);  // Debug field processing

                                // Add field metadata to the map
                                fieldMetadataMap.put(fieldName, fieldMetadata);
                            } else {
                                System.debug('Field not found: ' + fieldName);  // Debug missing field
                            }
                        }

                        // Add object metadata to the result
                        allObjectMetadata.put(objectName, fieldMetadataMap);
                    } else {
                        System.debug('Object not found: ' + objectName);  // Debug missing object
                    }
                }
            }

            // Convert the metadata to JSON and add to the result list
            resultJsonList.add(JSON.serializePretty(allObjectMetadata));
        }

        // Return the result as a JSON string
        return resultJsonList;
    }
}