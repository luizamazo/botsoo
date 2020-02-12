let fs = require('fs'),
    path = require('path'),
    Twit = require('twit'),
    config = require(path.join(__dirname, 'config.js')),
    instagram = require('./instagram/posts/index.js');
    twitter = require('./twitter/utils.js');

//pega os arquivos da pasta e faz um array com eles - vou mudar a ordem depois, isso aqui temq  
//vir depois mas por enquanto vem agr
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

        //enquanto nao for o fim dos arquivos q tao baixados
      while(!isEndOfFile){
        // pra cada arquivo q tiver la na pasta
            for(const[index, file] of media.entries()){
              
              //cria o caminho do arquivo e pega o tipo dele
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

              //faz o upload do arquivo pelo metodo de chunk, ele eh upado em outro endpoint do q o q vc tweeta
              let mediaInfo = await postMedia(mediaPath, mediaType)

              // se ele for viideo
              if(mediaInfo.video){ 
                console.log('eh video')
                //passo a id do video q foi upado pra essa var
                  mediaIdStringVideo = mediaInfo.media_id_string 

                  //se o video eh o primeiro arquivo, o primeiro tweet precisa ser normal e nao linkado
                  if(mediaPath.includes('1 -')){
                    console.log('entrou no primeiro video e postou tweet')
                    update('teste1', mediaIdStringVideo).then(res => {
                      console.log('prmeiro tiet', res)
                      tweet_id = res.id_str
                    })
                     // tweet_id = await postTweet(instagramPost, mediaIdStringVideo, null)
                      isVideoFirst = true
                  }else{
                    console.log('nao eh primeiro video, logo tem q ser thread')
                    update('teste3', mediaIdStringVideo, tweet_id).then(res => {
                      console.log('oiiltimo ideo', res)
                      tweet_id = res.id_str
                    })
                  }
              }
              // se eh ibagem
              if(mediaInfo.image){
              
                  console.log('ta pushando', mediaInfo)
                  //coloco num array o id upado dela nesse array
                  mediaIdStrings.push(mediaInfo.media_id_string) 
                  console.log('esse eh otanto', mediaIdStrings)
                
              }

              //se o array de ibagens chegar a 4, posta o 1º tweet se n tiver nenhum antes ou linka se tiver algo antes
              if(mediaIdStrings.length == 4){
                console.log('ja sao quatro imagens')
                  if(tweet_id == ''){
                    console.log('as quatro imagens sao o primeiro tweet')
                    update('teste', mediaIdStringVideo, tweet_id).then(res => {
                      tweet_id = res.id_str
                    })
                  //  tweet_id = await postTweet(instagramPost, mediaIdStrings, null)
                  }else{
                    console.log('as quatro imagens fazem parte de uma thread')
                    update('teste2', mediaIdStrings, tweet_id).then(res => {
                      console.log('reply', res)
                      tweet_id = res.id_str
                    })
                   // tweet_id = await postTweet(instagramPost, mediaIdStrings, tweet_id)
                  }
                  // zera o array de ibagens pq pode ter mais ibagens a seguir
                  mediaIdStrings = [] 
              }

              //pro loop ser finalizado, se percorreu todos os arquivos ja
              if(index == media.length - 1){
                console.log('finaliza o loop aqui')
                isEndOfFile = true
              }

          }
  
      }
       

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

let update = (status, media_ids, in_reply_to_status_id = null) => 
  twitter.makePost('statuses/update', {
    status,
    in_reply_to_status_id,
    media_ids,
    username: '@corongabot',
  })

let postLinkedTweet = async (instagramPost, mediaIdStrings, userIdTweetId) => {
  let text = instagramPost[0].text,
  media = instagramPost[0].media,
  username = instagramPost[0].username,
  time = instagramPost[0].time,
  mediaCount = '',
  author = '@corongabot'

  console.log('INFERNOO', userIdTweetId)
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
