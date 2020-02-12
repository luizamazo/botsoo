let Twit = require('twit'),
path = require('path'),
config = require('../config'),
twit = new Twit(config);

//helper pra criar um post request
let makePost = async (endpoint, params) =>{

    return twit.post(endpoint, params)
        .then(result => {
           // console.log('make post', result.data)
           return result.data
        }).catch(err => {
            console.log('caught error', err.stack)
        })

}

let initUpload = async (mediaSize, mediaType) => {
    return await makePost('media/upload', {
                    command: 'INIT',
                    total_bytes: mediaSize,
                    media_type: mediaType, 
                }).then(data => data.media_id_string)
}

let appendUpload = async (mediaId, mediaData) => {
    return await makePost('media/upload', {
                    command: 'APPEND',
                    media_id: mediaId,
                    media: mediaData,
                    segment_index: 0
                }).then(data => mediaId)
}

let finalizeUpload = async (mediaId) => {
    return await makePost('media/upload', {
                    command: 'FINALIZE',
                    media_id: mediaId
                }).then(data => data)
}

module.exports = {
    makePost,
    initUpload,
    appendUpload,
    finalizeUpload
}

