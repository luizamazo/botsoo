let fs = require('fs'),
    path = require('path'),
    Twit = require('twit'),
    config = require(path.join(__dirname, 'config.js')),
    instagram = require('./instagram/posts/index.js');
    twitter = require('./twitter/utils.js');

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

  //  console.log(instagramPost)
    let mediaPath = [],
        mediaIdStrings = [],
        mediaIdStringVideo = '',
        mediaType = '',
        tweet_id = '',
        isVideoFirst = false
        isEndOfFile = false

      while(!isEndOfFile){
            for(const[index, file] of media.entries()){
              
              mediaPath = path.join(__dirname, '/media/' + file) 
              mediaType = getMediaType(mediaPath)
              
              console.log(`
                media lenght: ${media.length},
                esse eh o index: ${index},
                mediaPath: ${mediaPath} | mediaType ${mediaType}
                mediaIdStringVideo: ${mediaIdStringVideo},
                mediaIdStrings: ${mediaIdStrings},
                tweet_id: ${tweet_id},
                isEndOfFile: ${isEndOfFile},
              `)

              let mediaInfo = await postMedia(mediaPath, mediaType)

              if(mediaInfo.video){ 
                console.log('eh video')
                  mediaIdStringVideo = mediaInfo.media_id_string
                  if(mediaPath.includes('1 -')){
                    console.log('entrou no primeiro video e postou tweet')
                      tweet_id = await postTweet(instagramPost, mediaIdStringVideo, null)
                      isVideoFirst = true
                  }else{
                    console.log('nao eh primeiro video, logo tem q ser thread')
                    tweet_id = await postTweet(instagramPost, mediaIdStringVideo, tweet_id)
                  }
              }
              if(mediaInfo.image){
              
                  console.log('ta pushando', mediaInfo)
                  mediaIdStrings.push(mediaInfo.media_id_string)
                  console.log('esse eh otanto', mediaIdStrings)
                
              }

              if(mediaIdStrings.length == 4){
                console.log('ja sao quatro imagens')
                  if(tweet_id == ''){
                    console.log('as quatro imagens sao o primeiro tweet')
                    tweet_id = await postTweet(instagramPost, mediaIdStrings, null)
                  }else{
                    console.log('as quatro imagens fazem parte de uma thread')
                    tweet_id = await postTweet(instagramPost, mediaIdStrings, tweet_id)
                  }
                  mediaIdStrings = []
              }
    
              if(index == media.length - 1){
                console.log('finaliza o loop aqui')
                isEndOfFile = true
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

let postTweet = async (instagramPost, mediaId, previousTweetId) => {
   
    let text = instagramPost[0].text,
    media = instagramPost[0].media,
    instagramUsername = instagramPost[0].username,
    time = instagramPost[0].time,
    mediaCount = '',
    author = '@corongabot'

   let tweet = `|POST| ${instagramUsername}: `

   let params = {
        status: tweet,
        in_reply_to_status_id_str: previousTweetId,
        username: author,
        media_ids: new Array(mediaId)
   }

   let tweet_id = await twitter.makePost('statuses/update', params)
    .then(response => {
        console.log('depois do post tweet response', response)
        payload = {'tweet_id': response.id_str}
        return payload
    }).catch(error => {
        console.log(error)
    })

    return tweet_id
}
