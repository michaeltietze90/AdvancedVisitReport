/**
 * @description       : 
 * @author            : dirk.gronert@salesforce.com
 * @group             : 
 * @last modified on  : 09-03-2024
 * @last modified by  : dirk.gronert@salesforce.com
**/
import { LightningElement, api } from 'lwc';
import existingRecord from "./visitReportProcessingResultRecordAttr.html";
import newRecord from "./newRecord.html";

export default class VisitReportProcessingResultRecordAttr extends LightningElement {
    attr;
    value;
    @api set property(property){
        this.attr = JSON.parse(JSON.stringify(property));
        this.value = this.attr.value.new;
    }
    get property(){ return this.attr; }
    _isSelected = false;

    @api isNewRecord;

    @api
    set isSelected(value){
        if(value !== this._isSelected){
            this._isSelected = value;
            this.propagateValue();
        }
    }
    get isSelected(){
        return this._isSelected;
    }

    render() { return this.isNewRecord ? newRecord : existingRecord; }


    /** Methods **/


    propagateValue(){
        this.dispatchEvent(new CustomEvent(this._isSelected?'includevalue':'excludevalue', { detail: { field : { apiName: this.attr.apiName, value: this.value} } }));
    }

    /** Event Handlers **/

    hdlDataChange(evt){
        evt.stopPropagation();
        this.value = evt.target.value;
        if(this.isSelected){
            this.propagateValue();
        }
    }
    hdlToggleChange(evt){
        this.isSelected = evt.target.checked;
    }

    /** Getters **/

    get formattedNewLabel(){
        return `New ${this.attr?.meta?.label}`;
    }

    get formattedOldLabel(){
        return `Old ${this.attr?.meta?.label}`;
    }

    get formattedInputClass(){
        return `${this.isSelected?'custom-input-selected':''}`;
    }

    get inputType(){
        let _type = 'text';
        switch (this.attr.meta.dataType) {
            case 'BOOLEAN':
                _type = 'checkbox'; break;
            case 'CURRENCY':
                _type = 'number'; break;
            case 'DATE':
                _type = 'date'; break;
            case 'DOUBLE':
                _type = 'number'; break;
            default: break;
        }
        return _type;
    }

}

/**
 * ADDRESS
ANYTYPE
BASE64
BOOLEAN
COMBOBOX
COMPLEXVALUE
CURRENCY
DATE
DATETIME
DOUBLE
EMAIL
ENCRYPTEDSTRING
INT
JSON
JUNCTIONLIST
LOCATION
MULTIPICKLIST
PERCENT
PHONE
PICKLIST
REFERENCE
STRING
TEXTAREA
TIME
URL
 */