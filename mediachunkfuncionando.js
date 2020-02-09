let fs = require('fs'),
    path = require('path'),
    Twit = require('twit'),
    config = require(path.join(__dirname, 'config.js')),
    instagram = require('./instagram/posts/index');

let twit = new Twit(config)

fs.readdir(__dirname + '/media', function(err, files){
    
    if(err){
        console.log(err)
    }else{
        let media = []
        files.forEach(function(file){
            media.push(file)
        })
    
    uploadMedia(media)
      
    }
})

let uploadMedia = async (media) => {

   let instagramPost =  await instagram.getInstagramPost()
    
    //console.log(instagramPost)
   // let mediaPath = []
    let mediaIdStrings = []
    let mediaIdStringVideo = ''
   
    const mediaPath = path.join(__dirname, '/media/' + media) 
    const mediaSize = fs.statSync(mediaPath).size
    const mediaData = fs.readFileSync(mediaPath, {encoding:'base64'})

    let mediaType = ''
    fileExtension = mediaPath.substr((mediaPath.lastIndexOf('.') + 1))

    if(fileExtension == 'mp4'){
        mediaType = 'video/mp4'
    }else if(fileExtension == 'gif'){
        mediaType = 'image/gif'
    }else{
        mediaType = 'image/jpeg'
    }

    let mediaId = await initUpload(mediaSize, mediaType)
    mediaId = await appendUpload(mediaId, mediaData)
    await finalizeUpload(mediaId)
        .then(mediaId => {
            postTweet(instagramPost, mediaId)
        })
        
  /*  fourPhotos = media.slice(0, 4)
    for(file of fourPhotos){
        mediaPath = path.join(__dirname, '/media/' + file) 
        await postMedia(mediaPath).then(mediaData => {
            if(mediaData.image.image_type == 'image/jpeg'){
                console.log(mediaData.image.image_type)
                mediaIdStrings.push(mediaData.media_id_string)
            }else{
                mediaIdStringVideo = media.media_id_string
                //postLinkedTweet()
            }
        })
    }

    if(mediaIdStrings.length > 1){
       // console.log('mediaIdStrings', mediaIdStrings)
        postTweet(instagramPost, mediaIdStrings)
    }  */ 
}

let postMedia = async (mediaPath) => {
    b64content = fs.readFileSync(mediaPath, {encoding:'base64'})

    return twit.post('media/upload', {media_data: b64content})
        .then(result => {
         //   console.log('data', result.data);
            return result.data
        }).catch(err => {
            console.log('caught error', err.stack)
        })
       
    }


let postTweet = async (instagramPost, mediaIdStrings) => {
   
    let text = instagramPost[0].text,
    media = instagramPost[0].media,
    username = instagramPost[0].username,
    time = instagramPost[0].time,
    mediaCount = ''

   let tweet_text = `|POST| ${username}: `

  twit.post('statuses/update', {
        status: tweet_text,
        media_ids: new Array(mediaIdStrings)
    }, (err, data, response) => {
        if(err){
            console.log('ERROR NOVO')
            console.log(err)
        }else{
            console.log('postou')
        }
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
                }).then(data => mediaId)
}

//helper pra criar um post request

let makePost = async (endpoint, params) =>{

    return twit.post(endpoint, params)
        .then(result => {
            console.log('make post', result.data)
           return result.data
        }).catch(err => {
            console.log('caught error', err.stack)
        })

}