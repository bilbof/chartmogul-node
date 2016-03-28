chartmogul-node
=============

Node library for querying the [ChartMogul](https://chartmogul.com) APIs. Supports:

* [Import API](https://dev.chartmogul.com/docs/introduction-import-api)
* [Enrichment API](https://dev.chartmogul.com/docs/introduction-enrichment-api)
* [Metrics API](https://dev.chartmogul.com/docs/introduction-metrics-api)

## Setup
```bash
$ npm install chartmogul
```
```js
var chartmogul = require('chartmogul')(' chartmogul api token ',' chartmogul api secret key ');
```

## Import API
	
For more information, visit https://dev.chartmogul.com/docs/introduction-import-api.


### Data sources

Creating a data source.

```js
var data_source = chartmogul.createDataSource("Data source name");
```

List data sources.

```js
chartmogul.listDataSources(callback);
```

### Customers

Create customer (optional helper).

```js
var customer = chartmogul.createCustomer("name", "customer_external_id", "email", "company", "country", "us state", "city", "zip code");
```

Import customer.

```js
chartmogul.importCustomer(data_source, customer_object, callback);
```

List customers.

```js
chartmogul.listCustomers(callback);
```

### Plans


Create plan (optional helper).

```js
var plan = chartmogul.createPlan("Gold plan", 1, "month", "plan_0001");
```

Import plan.

```js
chartmogul.importPlan(data_source, plan, callback);
```

List plans.

```js
chartmogul.listPlans(callback);
```

### Invoices

Invoice creation

```js
var invoice = {
	"invoices":[
		{
			"external_id": "internal unique invoice id",
			"date": "2016-03-01T00:01:00.000Z",
			"currency": "USD",
			"line_items": [
				{
					"type": "subscription",
					"subscription_external_id": "internal unique subscription id",
					"plan_uuid": "chartmogul plan id",
					"service_period_start": "2016-03-01T00:00:00.000Z",
					"service_period_end": "2016-04-01T00:00:00.000Z",
					"amount_in_cents": 5000
				},
				{
					"type": "one_time",
					"amount_in_cents": 500,
					"description": "One time payment",
					"discount_code": "Discount_01",
					"discount_amount_in_cents": 100
				}
			],
			"transactions": [
				{
					"date": "2016-03-01T00:00:00.000Z",
					"type": "payment",
					"result": "successful"
				}
			]
		}
	]
}
```

Import invoices.

```js
chartmogul.importInvoices("customer's chartmogul id", invoices, callback);
```

List subscriptions.

```js
chartmogul.listSubscriptions("chartmogul customer id", callback);
```

Cancelling a subscription.

```js
chartmogul.cancelCustomerSubscription("chartmogul subscription id", "timestamp", callback);
```

## Enrichment API

For more information, visit https://dev.chartmogul.com/docs/introduction-enrichment-api.

Fetch customer.

```js
chartmogul.getCustomer("chartmogul customer id", callback);
```

Add tags to a customer.

```js
var payload = {
	"tags": ["vip", "NPS_responder"]
}

chartmogul.addTagsToCustomer("chartmogul customer id", payload, callback);
```

Add tags to a customer using their email address.

```js
chartmogul.addTagsToCustomerEmail("john@company.com", payload, callback);
```

Remove tags from a customer.

```js
chartmogul.deleteCustomerTags("chartmogul customer id", payload, callback);
```

Fetch customer's attributes.

```js
chartmogul.getCustomerAttributes("chartmogul customer id", callback);
```

Add attributes to a customer.

```js
var attributes = {
	"custom": [{"type": "String", "key": "marketing_channel", "value": "Facebook"},
                 {"type": "Integer", "key": "age", "value": 8},
                 {"type": "Timestamp", "key": "Sign up date", "value": "2016-01-25"},
                 {"type": "Boolean", "key": "Contacted suppport", "value": true}]
}

chartmogul.addCustomerAttributes("chartmogul customer id", attributes, callback);
```

Add attributes to a customer using their email address.

```js
chartmogul.addAttributesToCustomerEmail("john@company.com", attributes, callback);
```

Remove attributes from a customer.

```js
chartmogul.deleteCustomerAttributes("john@company.com", attributes, callback);
```

Update a customer's attributes.

```js
chartmogul.updateCustomerAttributes("chartmogul customer id", attributes, callback);
```

## Metrics API

For more information, visit https://dev.chartmogul.com/docs/introduction-metrics-api.


### METRICS

Every request for metrics requires a params object like the one below. Only the "start-date" and "end-date" values are required. Values must be url-escaped.

The values "start-date" and "end-date" must both be in the format "YYYY-MM-DD", for example "2016-01-25".

```js
var params = {
	"start-date": "2016-02-29",
	"end-date"	: "2016-03-20",
	"interval"	: "month",
	"geo"		: "US",
	"plans"		: "Gold%20plan"
}
```

Retrieve all metrics.

```js
chartmogul.getAllMetrics(params, callback);
```

Retrieve MRR (monthly recurring revenue).

```js
chartmogul.getMRR(params, callback);
```

Retrieve ARPA (average revenue per account).

```js
chartmogul.getARPA(params, callback);
```

Retrieve ARR (annual run rate).

```js
chartmogul.getARR(params, callback);
```

Retrieve ASP (average sale price).

```js
chartmogul.getASP(params, callback);
```

Retrieve MRR Churn Rate.

```js
chartmogul.getMRRChurnRate(params, callback);
```

Retrieve Customer Count.

```js
chartmogul.getCustomerCount(params, callback);
```

Retrieve Customer Churn Rate.

```js
chartmogul.getCustomerChurnRate(params, callback);
```

Retrieve LTV (customer lifetime value).

```js
chartmogul.getLTV(params, callback);
```


### CUSTOMERS

Fetch a customer using their email address. Can return multiple customers.

```js
chartmogul.findCustomer("john@company.com", callback);
```

Retrieve a customer's activities.

```js
chartmogul.listCustomerActivities("chartmogul customer id", callback);
```

Retrieve a customer's subscriptions.

```js
chartmogul.listCustomerSubscriptions("chartmogul customer id", callback);
```

