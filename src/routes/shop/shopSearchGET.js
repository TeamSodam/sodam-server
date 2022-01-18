const responseMessage = require('../../constants/responseMessage');
const statusCode = require('../../constants/statusCode');
const { shopDB } = require('../../db');
const db = require('../../db/db');
const util = require('../../lib/util');
const { duplicatedDataClean } = require('../../lib/convertRawDataToProccessedData');
const { response } = require('express');

module.exports = async(req,res) =>{
    const {keyword} = req.query;
    
    if (!keyword) {
        return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
    }

    let client;

    try{
        client = await db.connect(req);
        if(keyword){
            const shopArr = await shopDB.getShopByName(client,keyword);

            const imagePromise = shopArr.map((item) => {
                const shopId = item.shopId;
                return shopDB.getPreviewImageByShopId(client, shopId);
            });
            
            // TODO 이미지 데이터 들어오는 포맷 보고 데이터 붙이기
            Promise.allSettled(imagePromise).then((image) => {
                image.forEach((result) => {
                    if (result.status === 'fulfilled') {
                    console.log('성공함');
                    } else if (result.status === 'rejected') {
                    // console.log('[IMAGE PROMISE REJECTED]');
                    }
                });
            });

            shopArr.map((item) => {
                if(!item.image){
                    item.image = null;
                }
            })

            const responseData = duplicatedDataClean(shopArr, 'shopId', 'category');
            console.log(responseData);
            res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_SHOP_BY_NAME, responseData));
        }
    } catch (error) {
        console.log(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    } finally {
        client.release();
    }
}