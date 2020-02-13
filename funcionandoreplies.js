let fs = require('fs'),
    path = require('path'),
    Twit = require('twit'),
    config = require(path.join(__dirname, 'config.js')),
    instagram = require('./instagram/posts/index.js');
    twitter = require('./twitter/utils.js');

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

   let instagramPost =  await instagram.getInstagramPost(),
   instagramMedia = instagramPost[0].media

    console.log(instagramPost)
    let mediaPath = []
    let mediaIdStrings = []
    let mediaIdStringVideo = ''
    let mediaType = ''
    let userIdTweetId = '',
  
    isVideoFirst = false

    if(instagramMedia.length > 1){ 
        let start = 0,
        end = 4
        limitedMedia = media.slice(start, 4)
        for(file of limitedMedia){
           
            mediaPath = path.join(__dirname, '/media/' + file) 
            mediaType = getMediaType(mediaPath)
         
            let mediaInfo = await postMedia(mediaPath, mediaType)

            if(mediaInfo.video){ //se eh video
                mediaIdStringVideo = mediaInfo.media_id_string
                if(mediaPath.includes('1 -')){
                    userIdTweetId = await postTweet(instagramPost, mediaIdStringVideo)
                    start++
                    end++ 
                    isVideoFirst = true
                }

                if(isVideoFirst == false){
                   // await postLinkedTweet(instagramPost, mediaIdStringVideo, userIdTweetId)
                }
            }
            if(mediaInfo.image){
                mediaIdStrings.push(mediaInfo.media_id_string)
            }
        }

        if(mediaIdStrings.length > 1){
            if(userIdTweetId == ''){
                userIdTweetId = await postTweet(instagramPost, mediaIdStrings)
            }else{
                userIdTweetId = await postLinkedTweet(instagramPost, mediaIdStrings, userIdTweetId)
            }
        }
    }

}

let postLinkedTweet = async (instagramPost, mediaIdStrings, userIdTweetId) => {
    let text = instagramPost[0].text,
    media = instagramPost[0].media,
    username = instagramPost[0].username,
    time = instagramPost[0].time,
    mediaCount = '',
    author = '@corongabot'

    console.log('VIADOOO', userIdTweetId)
   let tweet = `|POST| ${username}:`
   let params = {
        in_reply_to_user_id_str: userIdTweetId.userId,
        in_reply_to_status_id: userIdTweetId.tweetId,
        username: author,
        status: tweet,
        media_ids: new Array(mediaIdStrings)
   }

   userIdTweetId = await twitter.makePost('statuses/update', params)
    .then(response => {
        console.log('linkou', response)
        return userIdTweetId
    }).catch(error => {
        console.log(error)
    })

    return userIdTweetId
}

let getMediaType = (mediaPath) => {
    let mediaType = ''
    fileExtension = mediaPath.substr((mediaPath.lastIndexOf('.') + 1))
        
    if(fileExtension == 'mp4'){
        mediaType = 'video/mp4'
    }else if(fileExtension == 'gif'){
        mediaType = 'image/gif'
    }else{
        mediaType = 'image/jpeg'
    }

    return mediaType
}

let postMedia = async (mediaPath, mediaType) => {
   
    let mediaData = fs.readFileSync(mediaPath, {encoding:'base64'}),
        mediaSize = fs.statSync(mediaPath).size

    let mediaId = await twitter.initUpload(mediaSize, mediaType)
    mediaId = await twitter.appendUpload(mediaId, mediaData)
    let data = await twitter.finalizeUpload(mediaId)
        .then(data => {
           return data 
        })
    return data
    }
/*if(mediaType != 'video/mp4' && mediaType != 'image/gif'){
            postTweet(instagramPost, mediaId)  
           } */

let postTweet = async (instagramPost, mediaId) => {
   
    let text = instagramPost[0].text,
    media = instagramPost[0].media,
    username = instagramPost[0].username,
    time = instagramPost[0].time,
    mediaCount = ''

   let tweet = `|POST| ${username}: `
   let params = {
        status: tweet,
        media_ids: new Array(mediaId)
   }

   let userIdTweetId = await twitter.makePost('statuses/update', params)
    .then(response => {
        console.log('depois do post tweet response', response)
        console.log('postou')
        payloadUserTweetId = {
            'tweetId': response.id_str,
            'userId': response.user.id_str
        }
        return payloadUserTweetId
    }).catch(error => {
        console.log(error)
    })

    return userIdTweetId
  /*twit.post('statuses/update', {
        status: tweet_text,
        media_ids: new Array(mediaIdStrings)
    }, (err, data, response) => {
        if(err){
            console.log('ERROR NOVO')
            console.log(err)
        }else{
            console.log('postou')
        }
    }) */
}