let postTweet = async (b64content) => {
    
    twit.post('media/upload', {media_data: b64content}, (err, data, response) => {
        if(err){
            console.log('error')
            console.log(err)
        }else{
            console.log('image uploaded')
            console.log('tuitando agr')

            //instagramPost = await instagram.getInstagramPost()

            let text = instagramPost.text,
                media = instagramPost.media,
                username = instagramPost.username,
                time = instagramPost.time,
                mediaCount = ''

           // let tweetText = `|${type}| ${username}: ${text}`
          // let tweetText = `|POST| ${username}: ${text}`
          let tweetText = `hmm`

            if(media.length > 1){
                mediaCount = media.length
                tweetText = tweetText + '(' + mediaCount + ')'
            }

           /* tweetText = tweetText.toString()
            if(tweetText.length <= 280){} */
            
            twit.post('statuses/update', {
                status: tweet_text,
                media_ids: new Array(data.media_id_string)
            },
            (err, data, response) => {
                if(err){
                    console.log('ERROR0')
                    console.log(err)
                }else{
                    console.log('postou img')

                    fs.unlink(image_path, function(err){
                        if(err){
                            console.log('ERROR: nao deu pra dletar imagem' + image_path)
                        }else{
                            console.log('image' + image_path + 'foi deletada')
                        }
                    })
                }
            }
          )
        }
    })
}

   /* fs.readdir(__dirname + '/images', function(err, files){
        if(err){
            console.log(err)
        }else{
            let images = []
            files.forEach(function(f){
                images.push(f)
            })      
             uploadMedia(media);
        }
})*/


