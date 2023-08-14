import Vultr from '@vultr/vultr-node';
import { argv } from 'node:process';

const vultr = Vultr.initialize({
	"apiKey": process.env.APIKEY
});

/**
 * Remove a TXT _acme-challenge record
 * @param {string} domain 
 * @param {string} txtData
 */
const deleteAcmeRecord = (domain, txtData) => {
	console.info(`Fetching records for ${domain}`);
	const request = vultr.dns.listRecords({
		"dns-domain": domain
	});
	request.then(
		(response) => {
			try {
				let acmeRecords = response["records"].filter(record => record.type === "TXT" && record.name === '_acme-challenge' && record.data === txtData);
				acmeRecords.forEach(
					/**
					 * @param {{id: string, type: string, name: string, data: string, priority: number, ttl: number}} record
					 */
					(record) => {
						if(typeof record?.id === "string") {
							console.log(`Deleting record: ${record.type} ${record.name} ${record.data} (${record.id})`);
							const deleteRequest = vultr.dns.deleteRecord({"dns-domain": domain, "record-id": record.id});
							deleteRequest.then(
								(response) => {
									console.log(response);
								}
							);
							deleteRequest.catch(
								(error) => {
									console.log(error);
								}
							)
						}
					}
				);
			} catch(e) {
				console.error(`Failed to get DNS records.`);
				console.error(response);
			}
		}
	);
	request.catch(
		(error) => {
			console.error(error);
		}
	);
};

/**
 * Create a TXT _acme-challenge record
 * @param {string} domain 
 * @param {string} data 
 */
const createAcmeRecord = (domain, data) => {
	console.info(`Adding _acme-challenge record to ${domain}: ${data}`);
	const request = vultr.dns.createRecord({
		"dns-domain": domain,
		"name": "_acme-challenge",
		"type": "TXT",
		"data": data,
		"priority": "",
		"ttl": "600"
	});
	request.then(
		(response) => {
			console.log(response);
		}
	);
	request.catch(
		(error) => {
			console.error(error);
		}
	)
}

const methods = {
	"create": createAcmeRecord,
	"delete": deleteAcmeRecord,
};

let action = argv[2] || null;
let domain = process.env["CERTBOT_DOMAIN"] || null;
let validation = process.env["CERTBOT_VALIDATION"] || null;

if(action !== null && domain !== null && validation !== null) {
	methods[action](domain, validation);
}

export default methods;