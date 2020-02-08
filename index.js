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
   let mediaOrder = instagramPost[0].media

    console.log('mediaOrder', mediaOrder)
    console.log('media', media)

    if(mediaOrder.length){
        for(file of media){
            //aqui eu passo tudo que vem da pasta media
            let mediaPath = path.join(__dirname, '/media/' + file)
            b64content = fs.readFileSync(mediaPath, {encoding:'base64'})
            console.log('oi')
        }
    }
    
    

   // await postTweet(b64content)
}
