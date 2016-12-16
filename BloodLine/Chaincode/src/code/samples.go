package main

import (
	"errors"
	"fmt"
	"strconv"
	"strings"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	"encoding/json"
	"regexp"
)

var logger = shim.NewLogger("CLDChaincode")

//==============================================================================================================================
//	 Participant types - Each participant type is mapped to an integer which we use to compare to the value stored in a
//						 user's eCert
//==============================================================================================================================
//CURRENT WORKAROUND USES ROLES CHANGE WHEN OWN USERS CAN BE CREATED SO THAT IT READ 1, 2, 3, 4, 5
const   AUTHORITY      =  "regulator"
const   CAMP   =  "camp"
const   PRIVATE_ENTITY =  "private"
const   SEPARATION  =  "separation"
const   HOSPITAL =  "hospital"


//==============================================================================================================================
//	 Status types - Asset lifecycle is broken down into 5 statuses, this is part of the business logic to determine what can
//					be done to the vehicle at points in it's lifecycle
//==============================================================================================================================
const   STATE_TEMPLATE  			=  0
const   STATE_CAMP  			=  1
const   STATE_PRIVATE_OWNERSHIP 	=  2
const   STATE_SEPARATED 			=  3
const   STATE_CONSUMED  		=  4  //Given to Hospital

//==============================================================================================================================
//	 Structure Definitions
//==============================================================================================================================
//	Chaincode - A blank struct for use with Shim (A HyperLedger included go file used for get/put state
//				and other HyperLedger functions)
//==============================================================================================================================
type  SimpleChaincode struct {
}


type Sample struct {
	Type            string `json:"type"`
	HIV             string `json:"HIV"`
	Date            string `json:"date"`
	BIN             int    `json:"BIN"`
	Owner           string `json:"owner"`
	Consumed        bool   `json:"consumed"`
	Status          int    `json:"status"`
	Name            string `json:"name"`
	bloodID           string `json:"bloodID"`
	LeaseContractID string `json:"leaseContractID"`

}

type blood_Holder struct {
	V5Cs 	[]string `json:"v5cs"`
}

//==============================================================================================================================
//	User_and_eCert - Struct for storing the JSON of a user and their ecert
//==============================================================================================================================

type User_and_eCert struct {
	Identity string `json:"identity"`
	eCert string `json:"ecert"`
}

//==============================================================================================================================
//	Init Function - Called when the user deploys the chaincode
//==============================================================================================================================
func (t *SimpleChaincode) Init(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {

	//Args
	//				0
	//			peer_address

	var bloodIDs blood_Holder

	bytes, err := json.Marshal(bloodIDs)

    if err != nil { return nil, errors.New("Error creating blood_Holder record") }

	err = stub.PutState("bloodIDs", bytes)

	for i:=0; i < len(args); i=i+2 {
		t.add_ecert(stub, args[i], args[i+1])
	}

	return nil, nil
}


func (t *SimpleChaincode) get_ecert(stub shim.ChaincodeStubInterface, name string) ([]byte, error) {

	ecert, err := stub.GetState(name)

	if err != nil { return nil, errors.New("Couldn't retrieve ecert for user " + name) }

	return ecert, nil
}


func (t *SimpleChaincode) add_ecert(stub shim.ChaincodeStubInterface, name string, ecert string) ([]byte, error) {


	err := stub.PutState(name, []byte(ecert))

	if err == nil {
		return nil, errors.New("Error storing eCert for user " + name + " identity: " + ecert)
	}

	return nil, nil

}


func (t *SimpleChaincode) get_username(stub shim.ChaincodeStubInterface) (string, error) {

    username, err := stub.ReadCertAttribute("username");
	if err != nil { return "", errors.New("Couldn't get attribute 'username'. Error: " + err.Error()) }
	return string(username), nil
}


func (t *SimpleChaincode) check_affiliation(stub shim.ChaincodeStubInterface) (string, error) {
    affiliation, err := stub.ReadCertAttribute("role");
	if err != nil { return "", errors.New("Couldn't get attribute 'role'. Error: " + err.Error()) }
	return string(affiliation), nil

}


func (t *SimpleChaincode) get_caller_data(stub shim.ChaincodeStubInterface) (string, string, error){

	user, err := t.get_username(stub)

    // if err != nil { return "", "", err }

	// ecert, err := t.get_ecert(stub, user);

    // if err != nil { return "", "", err }

	affiliation, err := t.check_affiliation(stub);

    if err != nil { return "", "", err }

	return user, affiliation, nil
}

func (t *SimpleChaincode) retrieve_v5c(stub shim.ChaincodeStubInterface, bloodID string) (Sample, error) {

	var v Sample

	bytes, err := stub.GetState(bloodID);

	if err != nil {	fmt.Printf("RETRIEVE_V5C: Failed to invoke sample_code: %s", err); return v, errors.New("RETRIEVE_V5C: Error retrieving sample with bloodID = " + bloodID) }

	err = json.Unmarshal(bytes, &v);

    if err != nil {	fmt.Printf("RETRIEVE_V5C: Corrupt sample record "+string(bytes)+": %s", err); return v, errors.New("RETRIEVE_V5C: Corrupt sample record"+string(bytes))	}

	return v, nil
}

func (t *SimpleChaincode) save_changes(stub shim.ChaincodeStubInterface, v Sample) (bool, error) {

	bytes, err := json.Marshal(v)

	if err != nil { fmt.Printf("SAVE_CHANGES: Error converting sample record: %s", err); return false, errors.New("Error converting sample record") }

	err = stub.PutState(v.bloodID, bytes)

	if err != nil { fmt.Printf("SAVE_CHANGES: Error storing sample record: %s", err); return false, errors.New("Error storing sample record") }

	return true, nil
}

func (t *SimpleChaincode) Invoke(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {

	caller, caller_affiliation, err := t.get_caller_data(stub)

	if err != nil { return nil, errors.New("Error retrieving caller information")}


	if function == "create_sample" {
        return t.create_sample(stub, caller, caller_affiliation, args[0])
	} else if function == "ping" {
        return t.ping(stub)
    } else { 																				// If the function is not a create then there must be a car so we need to retrieve the car.
		argPos := 1

		if function == "consume_sample" {																// If its a scrap vehicle then only two arguments are passed (no update value) all others have three arguments and the bloodID is expected in the last argument
			argPos = 0
		}

		v, err := t.retrieve_v5c(stub, args[argPos])

        if err != nil { fmt.Printf("INVOKE: Error retrieving v5c: %s", err); return nil, errors.New("Error retrieving v5c") }


        if strings.Contains(function, "update") == false && function != "consume_sample"    { 									// If the function is not an update or a scrappage it must be a transfer so we need to get the ecert of the recipient.


				if 		   function == "authority_to_camp"      { return t.authority_to_camp(stub, v, caller, caller_affiliation, args[0], "camp")
				} else if  function == "camp_to_private"        { return t.camp_to_private(stub, v, caller, caller_affiliation, args[0], "private")
				} else if  function == "private_to_private" 	{ return t.private_to_private(stub, v, caller, caller_affiliation, args[0], "private")
				} else if  function == "private_to_separation"  { return t.private_to_separation(stub, v, caller, caller_affiliation, args[0], "separation")
				} else if  function == "separation_to_private"  { return t.separation_to_private(stub, v, caller, caller_affiliation, args[0], "private")
				} else if  function == "private_to_hospital"    { return t.private_to_hospital(stub, v, caller, caller_affiliation, args[0], "hospital")
				}

		} else if function == "update_type"  	    { return t.update_type(stub, v, caller, caller_affiliation, args[0])
		} else if function == "update_hiv"        { return t.update_HIV(stub, v, caller, caller_affiliation, args[0])
		} else if function == "update_date" { return t.update_date(stub, v, caller, caller_affiliation, args[0])
		} else if function == "update_bin" 			{ return t.update_bin(stub, v, caller, caller_affiliation, args[0])
        } else if function == "update_name" 		{ return t.update_name(stub, v, caller, caller_affiliation, args[0])
		} else if function == "consume_sample" 		{ return t.consume_sample(stub, v, caller, caller_affiliation) }

		return nil, errors.New("Function of the name "+ function +" doesn't exist.")

	}
}

func (t *SimpleChaincode) Query(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {

	caller, caller_affiliation, err := t.get_caller_data(stub)
	if err != nil { fmt.Printf("QUERY: Error retrieving caller details", err); return nil, errors.New("QUERY: Error retrieving caller details: "+err.Error()) }

    logger.Debug("function: ", function)
    logger.Debug("caller: ", caller)
    logger.Debug("affiliation: ", caller_affiliation)

	if function == "get_sample_details" {
		if len(args) != 1 { fmt.Printf("Incorrect number of arguments passed"); return nil, errors.New("QUERY: Incorrect number of arguments passed") }
		v, err := t.retrieve_v5c(stub, args[0])
		if err != nil { fmt.Printf("QUERY: Error retrieving v5c: %s", err); return nil, errors.New("QUERY: Error retrieving v5c "+err.Error()) }
		return t.get_sample_details(stub, v, caller, caller_affiliation)
	} else if function == "check_unique_v5c" {
		return t.check_unique_v5c(stub, args[0], caller, caller_affiliation)
	} else if function == "get_samples" {
		return t.get_samples(stub, caller, caller_affiliation)
	} else if function == "get_ecert" {
		return t.get_ecert(stub, args[0])
	} else if function == "ping" {
		return t.ping(stub)
	}

	return nil, errors.New("Received unknown function invocation " + function)

}

func (t *SimpleChaincode) ping(stub shim.ChaincodeStubInterface) ([]byte, error) {
	return []byte("Hello, world!"), nil
}

func (t *SimpleChaincode) create_sample(stub shim.ChaincodeStubInterface, caller string, caller_affiliation string, bloodID string) ([]byte, error) {
	var v Sample

	blood_id         := "\"bloodID\":\""+bloodID+"\", "							// Variables to define the JSON
	bin            := "\"BIN\":0, "
	typed           := "\"Type\":\"UNDEFINED\", "
	HIV          := "\"HIV\":\"false\", "
	date            := "\"Date\":\"UNDEFINED\", "
	owner          := "\"Owner\":\""+caller+"\", "
	name         := "\"Name\":\"UNDEFINED\", "
	leaseContract  := "\"LeaseContractID\":\"UNDEFINED\", "
	status         := "\"Status\":0, "
	consumed       := "\"Consumed\":false"

	sample_json := "{"+blood_id+bin+typed+HIV+date+owner+name+leaseContract+status+consumed+"}" 	// Concatenates the variables to create the total JSON object

	matched, err := regexp.Match("^[A-z][A-z][0-9]{7}", []byte(bloodID))  				// matched = true if the bloodID passed fits format of two letters followed by seven digits

												if err != nil { fmt.Printf("CREATE_SAMPLE: Invalid bloodID: %s", err); return nil, errors.New("Invalid bloodID") }

	if 				blood_id  == "" 	 ||
					matched == false    {
																		fmt.Printf("CREATE_SAMPLE: Invalid bloodID provided");
																		return nil, errors.New("Invalid bloodID provided")
	}

	err = json.Unmarshal([]byte(sample_json), &v)							// Convert the JSON defined above into a vehicle object for go

																		if err != nil { return nil, errors.New("Invalid JSON object") }

	record, err := stub.GetState(v.bloodID) 								// If not an error then a record exists so cant create a new car with this bloodID as it must be unique

																		if record != nil { return nil, errors.New("Sample already exists") }

	if 	caller_affiliation != AUTHORITY {							// Only the regulator can create a new v5c

		return nil, errors.New(fmt.Sprintf("Permission Denied. create_sample. %v === %v", caller_affiliation, AUTHORITY))

	}

	_, err  = t.save_changes(stub, v)

																		if err != nil { fmt.Printf("CREATE_SAMPLE: Error saving changes: %s", err); return nil, errors.New("Error saving changes") }

	bytes, err := stub.GetState("bloodIDs")

																		if err != nil { return nil, errors.New("Unable to get bloodIDs") }

	var bloodIDs blood_Holder

	err = json.Unmarshal(bytes, &bloodIDs)

																		if err != nil {	return nil, errors.New("Corrupt blood_Holder record") }

	bloodIDs.V5Cs = append(bloodIDs.V5Cs, bloodID)


	bytes, err = json.Marshal(bloodIDs)

															if err != nil { fmt.Print("Error creating blood_Holder record") }

	err = stub.PutState("bloodIDs", bytes)

															if err != nil { return nil, errors.New("Unable to put the state") }

	return nil, nil

}


func (t *SimpleChaincode) authority_to_camp(stub shim.ChaincodeStubInterface, v Sample, caller string, caller_affiliation string, recipient_name string, recipient_affiliation string) ([]byte, error) {

	if     	v.Status				== STATE_TEMPLATE	&&
			v.Owner					== caller			&&
			caller_affiliation		== AUTHORITY		&&
			recipient_affiliation	== CAMP		&&
			v.Consumed				== false			{		// If the roles and users are ok

					v.Owner  = recipient_name		// then make the owner the new owner
					v.Status = STATE_CAMP			// and mark it in the state of manufacture

	} else {									// Otherwise if there is an error
															fmt.Printf("AUTHORITY_TO_CAMP: Permission Denied");
                                                            return nil, errors.New(fmt.Sprintf("Permission Denied. authority_to_camp. %v %v === %v, %v === %v, %v === %v, %v === %v, %v === %v", v, v.Status, STATE_PRIVATE_OWNERSHIP, v.Owner, caller, caller_affiliation, PRIVATE_ENTITY, recipient_affiliation, HOSPITAL, v.Consumed, false))


	}

	_, err := t.save_changes(stub, v)						// Write new state

															if err != nil {	fmt.Printf("AUTHORITY_TO_CAMP: Error saving changes: %s", err); return nil, errors.New("Error saving changes")	}

	return nil, nil									// We are Done

}

func (t *SimpleChaincode) camp_to_private(stub shim.ChaincodeStubInterface, v Sample, caller string, caller_affiliation string, recipient_name string, recipient_affiliation string) ([]byte, error) {

	if 		v.Type 	 == "UNDEFINED" ||
			v.HIV  == "UNDEFINED" ||
			v.Date 	 == "UNDEFINED" ||
			v.Name == "UNDEFINED" ||
			v.BIN == 0				{					//If any part of the car is undefined it has not bene fully manufacturered so cannot be sent
															fmt.Printf("CAMP_TO_PRIVATE: Car not fully defined")
															return nil, errors.New(fmt.Sprintf("Car not fully defined. %v", v))
	}

	if 		v.Status				== STATE_CAMP	&&
			v.Owner					== caller				&&
			caller_affiliation		== CAMP			&&
			recipient_affiliation	== PRIVATE_ENTITY		&&
			v.Consumed     == false							{

					v.Owner = recipient_name
					v.Status = STATE_PRIVATE_OWNERSHIP

	} else {
        return nil, errors.New(fmt.Sprintf("Permission Denied. camp_to_private. %v %v === %v, %v === %v, %v === %v, %v === %v, %v === %v", v, v.Status, STATE_PRIVATE_OWNERSHIP, v.Owner, caller, caller_affiliation, PRIVATE_ENTITY, recipient_affiliation, HOSPITAL, v.Consumed, false))
    }

	_, err := t.save_changes(stub, v)

	if err != nil { fmt.Printf("CAMP_TO_PRIVATE: Error saving changes: %s", err); return nil, errors.New("Error saving changes") }

	return nil, nil

}

func (t *SimpleChaincode) private_to_private(stub shim.ChaincodeStubInterface, v Sample, caller string, caller_affiliation string, recipient_name string, recipient_affiliation string) ([]byte, error) {

	if 		v.Status				== STATE_PRIVATE_OWNERSHIP	&&
			v.Owner					== caller					&&
			caller_affiliation		== PRIVATE_ENTITY			&&
			recipient_affiliation	== PRIVATE_ENTITY			&&
			v.Consumed				== false					{

					v.Owner = recipient_name

	} else {
        return nil, errors.New(fmt.Sprintf("Permission Denied. private_to_private. %v %v === %v, %v === %v, %v === %v, %v === %v, %v === %v", v, v.Status, STATE_PRIVATE_OWNERSHIP, v.Owner, caller, caller_affiliation, PRIVATE_ENTITY, recipient_affiliation, HOSPITAL, v.Consumed, false))
	}

	_, err := t.save_changes(stub, v)

															if err != nil { fmt.Printf("PRIVATE_TO_PRIVATE: Error saving changes: %s", err); return nil, errors.New("Error saving changes") }

	return nil, nil

}

func (t *SimpleChaincode) private_to_separation(stub shim.ChaincodeStubInterface, v Sample, caller string, caller_affiliation string, recipient_name string, recipient_affiliation string) ([]byte, error) {

	if 		v.Status				== STATE_PRIVATE_OWNERSHIP	&&
			v.Owner					== caller					&&
			caller_affiliation		== PRIVATE_ENTITY			&&
			recipient_affiliation	== SEPARATION			&&
            v.Consumed     			== false					{

					v.Owner = recipient_name

	} else {
        return nil, errors.New(fmt.Sprintf("Permission denied. private_to_separation. %v === %v, %v === %v, %v === %v, %v === %v, %v === %v", v.Status, STATE_PRIVATE_OWNERSHIP, v.Owner, caller, caller_affiliation, PRIVATE_ENTITY, recipient_affiliation, HOSPITAL, v.Consumed, false))

	}

	_, err := t.save_changes(stub, v)
															if err != nil { fmt.Printf("PRIVATE_TO_SEPARATION: Error saving changes: %s", err); return nil, errors.New("Error saving changes") }

	return nil, nil

}

func (t *SimpleChaincode) separation_to_private(stub shim.ChaincodeStubInterface, v Sample, caller string, caller_affiliation string, recipient_name string, recipient_affiliation string) ([]byte, error) {

	if		v.Status				== STATE_PRIVATE_OWNERSHIP	&&
			v.Owner  				== caller					&&
			caller_affiliation		== SEPARATION			&&
			recipient_affiliation	== PRIVATE_ENTITY			&&
			v.Consumed				== false					{

				v.Owner = recipient_name

	} else {
		return nil, errors.New(fmt.Sprintf("Permission Denied. separation_to_private. %v %v === %v, %v === %v, %v === %v, %v === %v, %v === %v", v, v.Status, STATE_PRIVATE_OWNERSHIP, v.Owner, caller, caller_affiliation, PRIVATE_ENTITY, recipient_affiliation, HOSPITAL, v.Consumed, false))
	}

	_, err := t.save_changes(stub, v)
															if err != nil { fmt.Printf("SEPARATION_TO_PRIVATE: Error saving changes: %s", err); return nil, errors.New("Error saving changes") }

	return nil, nil

}

func (t *SimpleChaincode) private_to_hospital(stub shim.ChaincodeStubInterface, v Sample, caller string, caller_affiliation string, recipient_name string, recipient_affiliation string) ([]byte, error) {

	if		v.Status				== STATE_PRIVATE_OWNERSHIP	&&
			v.Owner					== caller					&&
			caller_affiliation		== PRIVATE_ENTITY			&&
			recipient_affiliation	== HOSPITAL			&&
			v.Consumed				== false					{

					v.Owner = recipient_name
					v.Status = STATE_CONSUMED

	} else {
        return nil, errors.New(fmt.Sprintf("Permission Denied. private_to_hospital. %v %v === %v, %v === %v, %v === %v, %v === %v, %v === %v", v, v.Status, STATE_PRIVATE_OWNERSHIP, v.Owner, caller, caller_affiliation, PRIVATE_ENTITY, recipient_affiliation, HOSPITAL, v.Consumed, false))
	}

	_, err := t.save_changes(stub, v)

															if err != nil { fmt.Printf("PRIVATE_TO_HOSPITAL: Error saving changes: %s", err); return nil, errors.New("Error saving changes") }

	return nil, nil

}

func (t *SimpleChaincode) update_bin(stub shim.ChaincodeStubInterface, v Sample, caller string, caller_affiliation string, new_value string) ([]byte, error) {

	new_vin, err := strconv.Atoi(string(new_value)) 		                // will return an error if the new vin contains non numerical chars

															if err != nil || len(string(new_value)) != 15 { return nil, errors.New("Invalid value passed for new BIN") }

	if 		//v.Status			== STATE_CAMP	&&
			v.Owner				== caller				&&
			//caller_affiliation	== CAMP			&&
			//v.BIN				== 0					&&			// Can't change the VIN after its initial assignment
			v.Consumed			== false				{

					v.BIN = new_vin					// Update to the new value
	} else {

        return nil, errors.New(fmt.Sprintf("Permission denied. update_bin %v %v %v %v %v", v.Status, STATE_CAMP, v.Owner, caller, v.BIN, v.Consumed))

	}

	_, err  = t.save_changes(stub, v)						// Save the changes in the blockchain

															if err != nil { fmt.Printf("UPDATE_BIN: Error saving changes: %s", err); return nil, errors.New("Error saving changes") }

	return nil, nil

}

func (t *SimpleChaincode) update_date(stub shim.ChaincodeStubInterface, v Sample, caller string, caller_affiliation string, new_value string) ([]byte, error) {


	if		v.Owner				== caller			&&
			//caller_affiliation	!= HOSPITAL	&&
			v.Consumed			== false			{

					v.Date = new_value

	} else {
        return nil, errors.New(fmt.Sprint("Permission denied. update_date"))
	}

	_, err := t.save_changes(stub, v)

															if err != nil { fmt.Printf("UPDATE_DATE: Error saving changes: %s", err); return nil, errors.New("Error saving changes") }

	return nil, nil

}

func (t *SimpleChaincode) update_name(stub shim.ChaincodeStubInterface, v Sample, caller string, caller_affiliation string, new_value string) ([]byte, error) {

	if 		v.Owner				== caller				&&
			//caller_affiliation	== CAMP			&&/*((v.Owner				== caller			&&
			//caller_affiliation	== MANUFACTURER)		||
			//caller_affiliation	== AUTHORITY)			&&*/
			v.Consumed			== false				{

					v.Name = new_value
	} else {

		return nil, errors.New(fmt.Sprint("Permission denied. update_name %t %t %t" + v.Owner == caller, caller_affiliation == CAMP, v.Consumed))
	}

	_, err := t.save_changes(stub, v)

		if err != nil { fmt.Printf("UPDATE_NAME: Error saving changes: %s", err); return nil, errors.New("Error saving changes") }

	return nil, nil

}

func (t *SimpleChaincode) update_type(stub shim.ChaincodeStubInterface, v Sample, caller string, caller_affiliation string, new_value string) ([]byte, error) {

	if 		//v.Status			== STATE_CAMP	&&
			v.Owner				== caller				&&
			//caller_affiliation	== CAMP			&&
			v.Consumed			== false				{

					v.Type = new_value
	} else {

        return nil, errors.New(fmt.Sprint("Permission denied. update_type %t %t %t" + v.Owner == caller, caller_affiliation == CAMP, v.Consumed))


	}

	_, err := t.save_changes(stub, v)

															if err != nil { fmt.Printf("UPDATE_TYPE: Error saving changes: %s", err); return nil, errors.New("Error saving changes") }

	return nil, nil

}

func (t *SimpleChaincode) update_HIV(stub shim.ChaincodeStubInterface, v Sample, caller string, caller_affiliation string, new_value string) ([]byte, error) {

	if 		//v.Status			== STATE_CAMP	&&
			v.Owner				== caller				&&
			//caller_affiliation	== CAMP			&&
			v.Consumed			== false				{

					v.HIV = new_value

	} else {
        return nil, errors.New(fmt.Sprint("Permission denied. update_HIV %t %t %t" + v.Owner == caller, caller_affiliation == CAMP, v.Consumed))

	}

	_, err := t.save_changes(stub, v)

															if err != nil { fmt.Printf("UPDATE_HIV: Error saving changes: %s", err); return nil, errors.New("Error saving changes") }

	return nil, nil

}

func (t *SimpleChaincode) consume_sample(stub shim.ChaincodeStubInterface, v Sample, caller string, caller_affiliation string) ([]byte, error) {

	if		v.Status			== STATE_CONSUMED	&&
			v.Owner				== caller				&&
			caller_affiliation	== HOSPITAL		&&
			v.Consumed			== false				{

					v.Consumed = true

	} else {
		return nil, errors.New("Permission denied. consume_sample")
	}

	_, err := t.save_changes(stub, v)

															if err != nil { fmt.Printf("CONSUME_SAMPLE: Error saving changes: %s", err); return nil, errors.New("CONSUME_SAMPLE Error saving changes") }

	return nil, nil

}

func (t *SimpleChaincode) get_sample_details(stub shim.ChaincodeStubInterface, v Sample, caller string, caller_affiliation string) ([]byte, error) {

	bytes, err := json.Marshal(v)

																if err != nil { return nil, errors.New("GET_SAMPLE_DETAILS: Invalid sample object") }

	if 		v.Owner				== caller		||
			caller_affiliation	== AUTHORITY	{

					return bytes, nil
	} else {
																return nil, errors.New("Permission Denied. get_sample_details")
	}

}


func (t *SimpleChaincode) get_samples(stub shim.ChaincodeStubInterface, caller string, caller_affiliation string) ([]byte, error) {
	bytes, err := stub.GetState("bloodIDs")

																			if err != nil { return nil, errors.New("Unable to get bloodIDs") }

	var bloodIDs blood_Holder

	err = json.Unmarshal(bytes, &bloodIDs)

																			if err != nil {	return nil, errors.New("Corrupt blood_Holder") }

	result := "["

	var temp []byte
	var v Sample

	for _, v5c := range bloodIDs.V5Cs {

		v, err = t.retrieve_v5c(stub, v5c)

		if err != nil {return nil, errors.New("Failed to retrieve V5C")}

		temp, err = t.get_sample_details(stub, v, caller, caller_affiliation)

		if err == nil {
			result += string(temp) + ","
		}
	}

	if len(result) == 1 {
		result = "[]"
	} else {
		result = result[:len(result)-1] + "]"
	}

	return []byte(result), nil
}

func (t *SimpleChaincode) check_unique_v5c(stub shim.ChaincodeStubInterface, v5c string, caller string, caller_affiliation string) ([]byte, error) {
	_, err := t.retrieve_v5c(stub, v5c)
	if err == nil {
		return []byte("false"), errors.New("V5C is not unique")
	} else {
		return []byte("true"), nil
	}
}

func main() {

	err := shim.Start(new(SimpleChaincode))

															if err != nil { fmt.Printf("Error starting Chaincode: %s", err) }
}
