//////////////////////////
// CHARTMOGUL ////////////
//////////////////////////

'use strict';

//////////////////////////
// VARIABLES /////////////
//////////////////////////

var https = require("https");
var API_KEYS = '';
var HOST = 'api.chartmogul.com';

function chartmogul (config) {
	if (config.key && config.token) {
		API_KEYS = config.token +":"+config.key;		
	}
  	else {console.log("CHARTMOGUL API TOKEN AND SECRET KEY REQUIRED")}
}

//////////////////////////
// REQUESTS //////////////
//////////////////////////

function post(path, payload, callback){
	request(path, callback, "POST", payload);
}

function get(path, callback) {
	request(path, callback, "GET");
}

function destroy(path, payload, callback) {
	request(path, callback, "DELETE", payload);
}

function update(path, payload, callback) {
	request(path, callback, "PUT", payload);
}

function patch(path, payload, callback) {
	request(path, callback, "PATCH", payload);
}

function request(path, callback, method, payload) {
	
	var data = JSON.stringify(payload);

	var options = {
		hostname: HOST,
		path: path,
		method: method,
		headers: {
			'Content-Type': 'application/json',
			'accept': 'application/json'
		},
		auth: API_KEYS
	};

	if (method != "GET") {
		options.headers['Content-Length'] = Buffer.byteLength(data);
	}

	var body = '';

	var req = https.request(options, function(res) {
	    if (res.statusCode != 200 && res.statusCode != 201) {
	      	console.log(`Status: ${res.statusCode}`);
	      	console.log(`Headers: ${JSON.stringify(res.headers)}`);
	    }
	    
	    res.on('data', function(d){
	        body += d;
	    });

	    res.on('end', function() {
	        var parsed = JSON.parse(body);
	        callback(parsed);
	    });
	});

	req.on('error', function(e) {
	    console.log('problem with request: ' + e.message);
	});

	if (method != "GET") {
		req.write(data);
	}
	req.end();

}


//////////////////////////
// DATA SOURCES //////////
//////////////////////////

// Creates a Data Source: https://chartmogul.readme.io/docs/create-data-source
// Returns billing system ID.

chartmogul.prototype.createDataSource = function (sourceName){
	
	var source = { name: sourceName };

	function saveDataSourceId(payload){
		DATA_SOURCE = payload.uuid;
		return payload.uuid;
	}

	post("/v1/import/data_sources", source, saveDataSourceId);

}

// Lists available Data Sources: https://chartmogul.readme.io/docs/list-data-sources

chartmogul.prototype.listDataSources = function (callback){
	get("/v1/import/data_sources", callback);
}

//////////////////////////
// CUSTOMERS /////////////
//////////////////////////

// Creates and returns a customer object: https://chartmogul.readme.io/docs/import-customer

chartmogul.prototype.createCustomer = function (name, customer_id, email, company, country, state, city, zip){
	
	var customer = {
		"external_id": customer_id,
		"name": name,
		"email": email,
		"company": company,
		"country": country,
		"city": city,
		"state": state,
		"zip": zip
	};
	
	return customer;
}

// Imports a customer: https://chartmogul.readme.io/docs/import-customer

chartmogul.prototype.importCustomer = function (dataSourceId, customerObject, callback){

	customerObject['data_source_uuid'] = dataSourceId;

	post("/v1/import/customers", customerObject, callback);

}

// Returns a list of customer objects created using the Import API: https://chartmogul.readme.io/docs/import-customer

chartmogul.prototype.listCustomers = function (callback){
	get("/v1/import/customers", checkForMoreCustomers);

	var customers = [];
	
	function checkForMoreCustomers(payload){
	
		customers.push(payload.customers);

		if (payload.current_page < payload.total_pages) {
			get("/v1/import/customers?page=" + (payload.current_page+1), checkForMoreCustomers);
		}
		else {
			callback(customers);
		}
	}
}


//////////////////////////
// PLANS /////////////////
//////////////////////////


chartmogul.prototype.createPlan = function (name, interval_count, interval_unit, external_id){
	
	var plan = {
		"external_id": external_id,
		"name": name,
		"interval_count": interval_count,
		"interval_unit": interval_unit
	};
	
	return plan;
}

// Imports a customer: https://chartmogul.readme.io/docs/import-customer

chartmogul.prototype.importPlan = function (dataSourceId, planObject, callback){

	planObject['data_source_uuid'] = dataSourceId;

	post("/v1/import/plans", planObject, callback);

}

// Returns a list of customer objects created using the Import API: https://chartmogul.readme.io/docs/import-customer

chartmogul.prototype.listPlans = function (callback){
	get("/v1/import/plans", checkForMorePlans);

	var plans = [];

	function checkForMorePlans(payload){
	
		plans.push(payload.plans);
		
		if (payload.current_page < payload.total_pages) {
			get("/v1/import/plans?page=" + (payload.current_page+1), checkForMorePlans);
		}
		else {
			callback(plans);
		}
	}
}


//////////////////////////
// INVOICES //////////////
//////////////////////////

// https://chartmogul.readme.io/docs/import-customers-invoices

chartmogul.prototype.importInvoices = function (customerId, invoices, callback){
	post("/v1/import/customers/"+customerId+"/invoices", invoices, callback);
}

// https://chartmogul.readme.io/docs/list-a-customers-subscriptions

chartmogul.prototype.listSubscriptions = function (customerId, callback){
	
	get("/v1/import/customers/"+customerId+"/subscriptions", checkForMore);	
	
	var subs = [];
	
	function checkForMore(payload){
		subs.push(payload.subscriptions);
		if (payload.current_page < payload.total_pages) {
			get("/v1/import/customers/"+customerId+"/subscriptions?page=" + (payload.current_page+1), checkForMore);
		}
		else {
			callback(subs);
		}
	}
}

// https://chartmogul.readme.io/docs/cancel-a-customers-subscription

chartmogul.prototype.cancelCustomerSubscription = function (subscriptionId, time, callback){
	var payload = {
		"cancelled_at": time
	}
	patch("/v1/import/subscriptions/"+subscriptionId, payload, callback);
}


//////////////////////////
// ENRICHMENT API ////////
//////////////////////////

// Returns a list of all customers: https://chartmogul.readme.io/docs/list-all-customers

chartmogul.prototype.listAllCustomers = function (callback){

	var customers = [];
	get("/v1/customers", checkForMoreCustomers);
	
	function checkForMoreCustomers(payload){
	
		customers.push(payload.entries);

		if (payload.has_more) {
			get("/v1/customers?page=" + (payload.page+1), checkForMoreCustomers);
		}
		else {
			callback(customers);
		}
	}
}

// https://api.chartmogul.com/v1/customers/:customer_id

chartmogul.prototype.getCustomer = function (customerId, callback){
	get("/v1/customers/"+customerId, callback);
}

// https://api.chartmogul.com/v1/customers/:customer_id/attributes/tags

chartmogul.prototype.addTagsToCustomer = function (customerId, tagsArray, callback){
	post("/v1/customers/"+customerId+"/attributes/tags", tagsArray, callback);
}

// https://chartmogul.readme.io/docs/create-tags-for-customer-with-email

chartmogul.prototype.addTagsToCustomerEmail = function (email, tagsArray, callback){
	tagsArray.email = email;
	post("/v1/customers/attributes/tags", tagsArray, callback);
}

// https://chartmogul.readme.io/docs/delete-tags-of-customer

chartmogul.prototype.deleteCustomerTags = function (customerId, tags, callback){
	callback(tags);
	destroy("/v1/customers/"+customerId+"/attributes/tags", tags, callback);
}

// https://chartmogul.readme.io/docs/get-customers-attributes

chartmogul.prototype.getCustomerAttributes = function (customerId, callback){
	get("/v1/customers/"+customerId+"/attributes", callback);
}

// https://chartmogul.readme.io/docs/create-custom-attributes-for-customer

chartmogul.prototype.addCustomerAttributes = function (customerId, attributesObject, callback){
	post("/v1/customers/"+customerId+"/attributes/custom", attributesObject, callback);
}

// https://chartmogul.readme.io/docs/create-custom-attributes-for-customer-with-email

chartmogul.prototype.addAttributesToCustomerEmail = function (email, attributesObject, callback){
	attributesObject.email = email;
	post("/v1/customers/attributes/custom", attributesObject, callback);
}

// https://chartmogul.readme.io/docs/create-custom-attributes-for-customer-with-email

chartmogul.prototype.deleteCustomerAttributes = function (customerId, attributesObject, callback){
	destroy("/v1/customers/"+customerId+"/attributes/custom", attributesObject, callback);
}

chartmogul.prototype.updateCustomerAttributes = function (customerId, attributesObject, callback){
	update("/v1/customers/"+customerId+"/attributes/custom", attributesObject, callback);
}



//////////////////////////
// METRICS API ///////////
//////////////////////////


// https://chartmogul.readme.io/docs/search-for-customer

chartmogul.prototype.findCustomer = function (email, callback){
	
	var customers = [];
	get("/v1/customers/search?email="+email, checkForMoreCustomers);
	
	function checkForMoreCustomers(payload){
	
		customers.push(payload.entries);

		if (payload.has_more) {
			get("/v1/customers/search?email="+email, checkForMoreCustomers);
		}
		else {
			callback(customers);
		}
	}
}

// https://chartmogul.readme.io/docs/list-customer-subscriptions

chartmogul.prototype.listCustomerSubscriptions = function (customerId, callback){

	var subscriptions = [];
	get("/v1/customers/"+customerId+"/subscriptions", checkForMore);
	
	function checkForMore(payload){
	
		subscriptions.push(payload.entries);

		if (payload.has_more) {
			get("/v1/customers/"+customerId+"/subscriptions", checkForMore);
		}
		else {
			callback(subscriptions);
		}
	}
}

// https://chartmogul.readme.io/docs/list-customer-activities

chartmogul.prototype.listCustomerActivities = function (customerId, callback){

	var activities = [];
	get("/v1/customers/"+customerId+"/activities", checkForMore);
	
	function checkForMore(payload){
	
		activities.push(payload.entries);

		if (payload.has_more) {
			get("/v1/customers/"+customerId+"/activities", checkForMore);
		}
		else {
			callback(activities);
		}
	}
}


// https://chartmogul.readme.io/docs/endpoint-overview-metrics-api

// Utility function for checking URLs
function urly(p, metric){
	var u = "/v1/metrics/"+metric+"?start-date="+p['start-date']+"&end-date="+p['end-date']
	if (p.interval){ u+="&interval="+p.interval}
	if (p.geo){ u+="&geo="+p.geo}
	if (p.plans){ u+="&plans="+p.plans}
	return u
}
chartmogul.prototype.getAllMetrics = function(params, callback){
	var url = urly(params, "all");
	get(url, callback);
}
chartmogul.prototype.getMRR = function(params, callback){
	var url = urly(params, "mrr");
	get(url, callback);
}
chartmogul.prototype.getARR = function(params, callback){
	var url = urly(params, "mrr");
	get(url, callback);
}
chartmogul.prototype.getARPA = function(params, callback){
	var url = urly(params, "arpa");
	get(url, callback);
}
chartmogul.prototype.getASP = function(params, callback){
	var url = urly(params, "asp");
	get(url, callback);
}
chartmogul.prototype.getCustomerCount = function(params, callback){
	var url = urly(params, "customer-count");
	get(url, callback);
}
chartmogul.prototype.getCustomerChurnRate = function(params, callback){
	var url = urly(params, "customer-churn-rate");
	get(url, callback);
}
chartmogul.prototype.getMRRChurnRate = function(params, callback){
	var url = urly(params, "mrr-churn-rate");
	get(url, callback);
}
chartmogul.prototype.getLTV = function(params, callback){
	var url = urly(params, "ltv");
	get(url, callback);
}

//////////////////////////
// EXPORT ////////////////
//////////////////////////

module.exports = chartmogul;









