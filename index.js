const fs = require('fs');
const http = require('http');
const https = require('https');

let steamBSLocation = 'C:/Program Files (x86)/Steam/steamapps/common/Beat Saber/Beat Saber_Data/CustomLevels'

http.createServer((req, res) => {
    if(req.url.startsWith('/dwn/')){
        let id = req.url.replace('/dwn/', '');
        dwnldMap(id);

        res.setHeader('Access-Control-Allow-Origin', '*')
        res.write('{"ok":true}');
        res.end();
    } else{
        res.write('Fern Small - Phaze 2021, also millzy likes furry potatoes');
        res.end();
    }
}).listen(8679);

let dwnldMap = id => {
    const options = {
        hostname: 'api.beatsaver.com',
        port: 443,
        path: '/maps/id/'+id,
        method: 'GET'
    }

    let data = ''
    const req = https.request(options, res => {
        res.on('data', d => {
            data += d.toString()
        })

        res.on('end', () => {
            let url = JSON.parse(data).versions[0].downloadURL;

            download(url, steamBSLocation+'/'+JSON.parse(data).versions[0].hash+'.zip')
        })
    })
    
    req.on('error', error => {
        console.error(error)
    })
    
    req.end();
}

async function download(url, filePath) {
    const proto = !url.charAt(4).localeCompare('s') ? https : http;
  
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filePath);
        let fileInfo = null;
    
        const request = proto.get(url, response => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
                return;
            }
    
            fileInfo = {
                mime: response.headers['content-type'],
                size: parseInt(response.headers['content-length'], 10),
            };
    
            response.pipe(file);
        });
    
        // The destination stream is ended by the time it's called
        file.on('finish', () => {
            resolve(fileInfo)
            console.log('Finished Downloading.');

            setTimeout(() => {
                console.clear();
            }, 20000)
        });
    
        request.on('error', err => {
            fs.unlink(filePath, () => reject(err));
        });
    
        file.on('error', err => {
            fs.unlink(filePath, () => reject(err));
        });
    
        request.end();
    });
}