public class JsonSummaryExtractor {

    // Define an inner class to handle input and output from Flow
    public class SummaryInput {
        @InvocableVariable(required=true)
        public String jsonInput;
    }

    public class SummaryOutput {
        @InvocableVariable
        public String summary;
    }

    // InvocableMethod to extract the "Summary" from the input JSON in a Flow
    @InvocableMethod(label='Extract Summary from JSON' description='Extracts the summary content from the provided JSON string.')
    public static List<SummaryOutput> extractSummary(List<SummaryInput> inputJsonList) {
        List<SummaryOutput> resultList = new List<SummaryOutput>();

        for (SummaryInput inputJson : inputJsonList) {
            Map<String, Object> parsedJson = (Map<String, Object>) JSON.deserializeUntyped(inputJson.jsonInput);
            
            SummaryOutput output = new SummaryOutput();
            if (parsedJson.containsKey('Summary')) {
                output.summary = (String) parsedJson.get('Summary');
            } else {
                output.summary = 'No summary found in the provided JSON';
            }

            resultList.add(output);
        }

        return resultList;
    }
}