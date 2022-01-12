const {google} = require('googleapis');
const keys = require('../../keystoGoogleApis.json');

const util = require('../lib/util');
const statusCode = require('../constants/statusCode');
const responseMessage = require('../constants/responseMessage');

const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const dbConfig = require('../config/dbConfig');


const client2 = new Client({
    dbConfig
});

const client = new google.auth.JWT(
    keys.client_email, 
    null,
    keys.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
);

client.authorize(function(err,tokens){
    if(err){
        console.log(err);
        return;
    } else{
        gsrun(client);
    }
})

async function gsrun(client){
    const sheets = google.sheets({version:"v4", auth:client});

    const request = {
        spreadsheetId : "1Mmz6UuohXzPsvhrPLDLGudfAvS11IIcOjEbsqxwx0_c",
        range : "시트1"
    };

    const response = (await sheets.spreadsheets.values.get(request)).data;
    const responseArray = response.values;

    

    for(var value of responseArray){
        for(data of value){
            if(data == ''){
                data = null;
            }
        }
    }

    
    client2.connect();
    const sql = "INSERT INTO shop (id, shop_name, subway, road_address, land_address, time, close, phone, homepage, instagram, blog, store, area, note) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING * "
    const values = [responseArray[7][0], responseArray[7][1], responseArray[7][4], responseArray[7][5], responseArray[7][6], responseArray[7][9], responseArray[7][10], responseArray[7][8], responseArray[7][11], responseArray[7][12], responseArray[7][13], responseArray[7][14], responseArray[7][7], responseArray[7][16]];
    //console.log(responseArray[2]);
    client2.query(sql, values, (err,res) =>{
        if(err){
            console.log(err.stack)
        }
        else{
            console.log(res.rows[0])
        }
    })
}
