/**
 * @description       : 
 * @author            : dirk.gronert@salesforce.com
 * @group             : 
 * @last modified on  : 09-03-2024
 * @last modified by  : dirk.gronert@salesforce.com
**/
import Id from '@salesforce/schema/AccountHistory.Id';
import { LightningElement, api } from 'lwc';

export default class VisitReportProcessingResultRecord extends LightningElement {
    @api layoutColumns = 3;
    @api layoutMode = 'readonly'; // view, edit, readonly.
    @api layoutType = 'Compact'; // Compact, Full
    meta;
    propagationState = {};
    isAllToggled = false;
    _objAPIName


    @api set objApiName(objApiName){
        debugger
        this._objApiName = objApiName;
        this.propagationState.attributes = { "type": objApiName };
    }
    get objApiName(){ return this._objApiName; }

    _record;
    @api set record(record){
        this._record = JSON.parse(JSON.stringify(record));
        if(this._record.Id) this.propagationState.Id = this._record.Id
    }

    get record(){ return this._record; }
    
    get title(){ return this.isNewRecord?'New ' + this.record.meta.label : this.meta ? this.determineTitle() : 'Loading ' + this.record.meta.label; }

    get icon(){ return 'standard:' + (this.objApiName ? this.objApiName.toLowerCase() : 'account'); }
    
    get isLayoutTypeFull(){ return this.layoutType === 'Full'; }

    get isNewRecord(){ return !this.record.Id; }

    get areAttributesReady(){ return this.isNewRecord || (!this.isNewRecord && !!this.meta); }

    determineTitle(){
        let _title = []
        this.meta.objectInfos[this.meta.records[this.record.Id].apiName].nameFields.forEach((_nameField) => {
            if(this.meta.records[this.record.Id].fields[_nameField])
                _title.push(this.meta.records[this.record.Id].fields[_nameField].value);
        });
        return _title.join(' ');
    }
    propagateRecord(){
        let _otherKey = Object.keys(this.propagationState).find(_key => ( _key!='Id' && _key != 'attributes'));
        const _propagateEvent = new CustomEvent(_otherKey?'updaterecord':'deleterecord', { detail: { record : this.propagationState, apiName: this.objApiName, uuid : this._record.uuid } });
        this.dispatchEvent(_propagateEvent);
    }

    handleLayoutType(evt){
        this.layoutType = this.isLayoutTypeFull?'Compact':'Full';
    }

    hdlRecordLoaded(evt){
        if(evt.detail){
            const _meta = evt.detail;
            this.record.fields.forEach(_field => {
                if(_meta.records[this.record.Id].fields[_field.apiName]){
                    let _targetField = this.record.fields.find(_tField => _tField.apiName === _field.apiName);
                    if(_targetField) _targetField.value.old = _meta.records[this.record.Id].fields[_field.apiName].value;
                }
            });
            this.meta = _meta;
        }
    }

    hdlIncludeAttribute(evt){
        let _attDetail = evt.detail;
        if(_attDetail?.field?.apiName){
            this.propagationState[_attDetail.field.apiName] = _attDetail.field.value;
            console.log('UUID:', this._record.uuid, 'APIName:', this.objApiName, 'Included attribute. New State:', JSON.stringify(this.propagationState));
            this.propagateRecord();
        }
        evt.stopPropagation();
    }

    hdlExcludeAttribute(evt){
        let _attDetail = evt.detail;
        if(_attDetail?.field?.apiName){
            delete this.propagationState[_attDetail.field.apiName];
            console.log('UUID:', this._record.uuid, 'APIName:', this.objApiName, 'Excluded attribute ' + _attDetail.field.apiName +' New State:', JSON.stringify(this.propagationState));
            this.propagateRecord();
        }
        evt.stopPropagation();
    }

    hdlToggleAllChange = (evt) => {
        this.isAllToggled = evt.target.checked;
    }
}