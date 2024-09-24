import { LightningElement, api } from 'lwc';

export default class AdvancedAudioRecorder extends LightningElement {
    @api openaiKey;
    @api headline = 'Voice Transcription';
    @api iconName = 'utility:mic';
    @api transcript = ''; // Bound to the textarea's value attribute

    // This method is triggered when the speech is transcribed
    handleSpeechChange(e) {
        const speech = e.detail.value;
        console.log('Received speech data:', speech);

        // Append the new speech to the existing transcript with a space or new line
        this.transcript = this.transcript ? `${this.transcript} ${speech}` : speech;

        // Adjust the size of the textarea based on the content
        const textarea = this.template.querySelector('.slds-publisher__input');
        if (textarea) {
            textarea.value = this.transcript;  // Update the textarea with the new concatenated transcript
            this.resizeTextarea({ target: textarea });
        }
    }

    // This method adjusts the height of the textarea dynamically based on content
    resizeTextarea(event) {
        const textarea = event.target;
        textarea.style.height = 'auto';  // Reset height to auto to compute new height
        textarea.style.height = `${textarea.scrollHeight}px`;  // Set height based on content
    }
}