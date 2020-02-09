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
    let mediaPath = []
    let mediaIdStrings = []
    let mediaIdStringVideo = ''
   
    mediaPath = path.join(__dirname, '/media/' + media) 
    postTwitterVideo(mediaPath)
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

let postTwitterVideo = async (mediaPath, resolve, reject) => {

    const twitterData = {
        content: 'cuzao',
        twitter_handle: 'corongabot'
    }

    

    twit.postMediaChunked({file_path: mediaPath}, function(err, data, response){

        const mediaIdString = data.media_id_string
        const metaParams = {media_id: mediaIdString}
        
        twit.post('media/metadata/create', metaParams, function(err, data, response){
            if(!err){
                const params = {status: twitterData.content, media_id: [mediaIdString]}
                console.log('mediaaaaPath', data)
                twit.post('statuses/update', params, function(err, tweet, response){
                    //console.log('tweet', tweet)
                    const base = 'https://twitter.com/'
                    const handle = twitterData.twitter_handle
                    const tweet_id = tweet.id_str 

                    let oi = {
                        live_link: `${base}${handle}/status/${tweet_id}`
                    }
                    return oi

                }) //end statuses update
            } //end if !err
        }) //end media data create
    }) //end twit post media chunked

}