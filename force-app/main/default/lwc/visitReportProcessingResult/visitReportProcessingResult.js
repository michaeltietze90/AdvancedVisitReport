import { LightningElement, api, wire } from 'lwc';
import { gql, graphql } from "lightning/uiGraphQLApi";
import {FlowAttributeChangeEvent} from 'lightning/flowSupport';

const PAYLOAD = { 
    records : [
        {
            "RecordType": "Opportunity",
            "Id": "006Wz000002uZkrIAE",
            "Amount": "33000",
            "NextStep": "Talk to the manager"
        },
        {
            "RecordType": "Opportunity",
            "Id": "006Wz000002uZd4IAE",
            "Amount": "15000",
            "CloseDate": "2024-09-30"
        },
        {
            "RecordType": "Opportunity",
            "Name": "TestTest",
            "Amount": "55000"
        },
        {
            "RecordType": "Contact",
            "Id": "003Wz000002l65mIAA",
            "FirstName": "Chris Post"
        },
        {
            "RecordType": "Contact",
            "Id": "003Wz000002l65nIAA",
            "FirstName": "Mark Kingston",
            "Title": "CEO"
        },
        {
            "RecordType": "Contact",
            "FirstName": "Peter Smith",
            "Title": "Vice President",
            "Department": "Department for Electrification"
        },
        {
            "RecordType": "Task",
            "Subject": "Take out the laundry",
            "ActivityDate": "2024-08-27",
            "WhoId": null
        }
    ],
    "Summary": "<h1>Meeting Summary</h1><p>The meeting was attended by <b>Chris Post</b> and <b>Mark Kingston</b>, who was promoted to CEO. Discussions covered several key opportunities.</p><h2>Opportunities</h2><ul><li><b>Omega, Inc. - Add-On Business - 52K</b>: The amount was adjusted to 33k, and the next step is to talk to the manager.</li><li><b>Omega, Inc. - Add-On Business - 18K</b>: The opportunity amount was updated to 15k, with a close date set for the end of next month.</li><li><b>TestTest</b>: A new opportunity was created with an amount of 55k.</li></ul><h2>Contacts</h2><ul><li><b>Chris Post</b>: Existing contact.</li><li><b>Mark Kingston</b>: Promoted to CEO.</li><li><b>Peter Smith</b>: New contact, Vice President from the Department for Electrification.</li></ul><h2>Tasks</h2><p>A reminder was created to take out the laundry tomorrow morning.</p>"
};

export default class VisitReportProcessingResult extends LightningElement {

    @api recordLayoutColumns = 3;
    @api recordLayoutMode = 'readonly'; // view, edit, readonly.
    @api recordLayoutType = 'Compact'; // Compact, Full
    @api allObjectsOpen;
    @api columnSize = 6;
    error;
    graphQLConfig;
    @api set payload(payload){
        try{
            this.records = JSON.parse(payload);
            this.graphQLConfig = this.generateGraphQLConfig();
        }catch(e){
            this.error = {msg : JSON.stringify(e), payload}
        }
    }
    get payload(){
        return JSON.stringify(this.records);
    }
    records;
    data;
    objMetadata;
    @api outputRecords;
    propagationState = {};
    activeSectionNames;



    constructData(){
        let _recordsInternal = {};
        let _sectionsOpen = [];
        this.records.records.forEach((_record, _idx) => {
            if(!_recordsInternal[_record.RecordType]) {
                _recordsInternal[_record.RecordType] = { 
                    uuid: this.uuidv4(), 
                    apiName : _record.RecordType, 
                    meta : this.objMetadata[_record.RecordType], 
                    records : [] 
                };
                if(_idx == 0 || this.allObjectsOpen){
                    _sectionsOpen.push(_record.RecordType);
                }

            }
            let _tmpRec = {
                uuid : this.uuidv4(), 
                Id : _record.Id, 
                fields : [],
                meta : {
                    label : _recordsInternal[_record.RecordType].meta.label,
                    labelPlural : _recordsInternal[_record.RecordType].meta.labelPlural
                }
            };

            Object.keys(_record).forEach(_attr => {
                if(_attr != 'Id' && _attr != 'RecordType'){
                    if(this.objMetadata[_record.RecordType].fields[_attr]){
                        _tmpRec.fields.push({
                            apiName: _attr,
                            value : {
                                old: undefined,
                                new : _record[_attr]
                            },
                            meta : this.objMetadata[_record.RecordType].fields[_attr]
                        })    
                    }
                }
            });
            _recordsInternal[_record.RecordType].records.push(_tmpRec);
        });
        this.activeSectionNames = _sectionsOpen.join(', ');
        this.data = Object.values(_recordsInternal);
    }

    @wire(graphql, {
        query: gql`
          query queryObjectMetadata($objAPINames: [String]) {
            uiapi {
              objectInfos(apiNames: $objAPINames) {
                ApiName
                custom
                fields {
                    ApiName
                    createable
                    dataType
                    label
                    reference
                    updateable
                }
                label
                labelPlural
              }
            }
          }`,
        variables: '$graphQLConfig',
        operationName: 'queryObjectMetadata',
      }
    )
    graphqlQueryResult({ data, errors }) {
        if (data) {
            let _meta = {};
            data.uiapi.objectInfos.forEach(_obj => {
                _meta[_obj.ApiName] = {label: _obj.label, labelPlural: _obj.labelPlural, fields : []};
                _obj.fields.forEach(_field => {
                    _meta[_obj.ApiName].fields[_field.ApiName] = _field;
                });
            });
            this.objMetadata = _meta;
            this.constructData();
        }
        this.errors = errors;
    }

    generateGraphQLConfig = () => {
        let _objAPINames = new Set();
        this.records.records.forEach(_record => {
            if(_record.RecordType != 'Summary') _objAPINames.add(_record.RecordType);
        });
        return {objAPINames : Array.from(_objAPINames)};
    }

    //get ready(){ return !!this.records && !!this.objMetadata; }

    hdlUpdateRecord(evt){
        const _detail = evt.detail;
        if(_detail && !!_detail.apiName && !!_detail.uuid){
            if(!this.propagationState[_detail.apiName]) this.propagationState[_detail.apiName] = {};
            this.propagationState[_detail.apiName][_detail.uuid] = _detail.record;
            console.log('Updated propagation state', JSON.stringify(this.propagationState));
            this.propagateDataToFlow();
        }
        evt.stopPropagation();
    }
    hdlDeleteRecord(evt){
        const _detail = evt.detail;
        if(_detail && !!_detail.apiName && !!_detail.uuid){
            if(this.propagationState[_detail.apiName]){
                delete this.propagationState[_detail.apiName][_detail.uuid]
                console.log('Updated propagation state', JSON.stringify(this.propagationState));
                this.propagateDataToFlow();
            }
        }
        evt.stopPropagation();
    }

    propagateDataToFlow(){
        let _data = {'objects' : []}
        Object.keys(this.propagationState).forEach(_objApiName => {
            let _recUuids = Object.keys(this.propagationState[_objApiName]);
            if(_recUuids.length > 0){
                let _warpper = {'objectApiName' : _objApiName, 'recsToCreate':[], 'recsToUpdate':[], 'recsToDelete':[]}
                _recUuids.forEach(_recUuid => {
                    let _record = this.propagationState[_objApiName][_recUuid];
                    if(_record){
                        if(_record.Id){
                            _warpper.recsToUpdate.push(_record);
                        }else{
                            _warpper.recsToCreate.push(_record);
                        }
                    }
                })
                _warpper.recsToCreate = JSON.stringify(_warpper.recsToCreate);
                _warpper.recsToUpdate = JSON.stringify(_warpper.recsToUpdate);
                _warpper.recsToDelete = JSON.stringify(_warpper.recsToDelete);
                _data.objects.push(_warpper);
            }
        })
        console.log('Update Payload to flow : ', JSON.stringify(_data));
        this.dispatchEvent(new FlowAttributeChangeEvent('outputRecords', _data))
    }
    
    /**
     * 
     * @returns a generated UUID
     */
    uuidv4(){
        return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
            (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
        );
    }
}