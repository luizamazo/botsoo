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
    
    update()
      
    }
})

const update = (status, in_reply_to_status_id = null) =>
  twitter.makePost('statuses/update', {
    status,
    in_reply_to_status_id,
    username: '@corongabot',
  })
update('Testing twitter NPM library')
  .then(tweet => {
    console.log(`tweet #1 ==>`, tweet)
    update('Reply #1', tweet.id_str).then(tweet2 => {
      update('Reply #2', tweet2.id_str)
    }).then(tweet3 => {
      update('Reply #3', tweet3.id_str)
    })
  })
  .catch(error => console.log(`error ==>`, error))
