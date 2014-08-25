var express = require('express');
var router = express.Router();
var mongoose=require('mongoose');
var Recaptcha = require('re-captcha');
var request = require('request');
var mime = require ('mime');
var autoinc=require('mongoose-id-autoinc');
var PUBLIC_KEY  = "6Lck8_gSAAAAABfyyP_AkBdldUDTmxNlAlt8DG-4";
var PRIVATE_KEY ="6Lck8_gSAAAAAOnQAU8d0aDBsZTiLchsYFGidG_O";



mongoose.connection.on("open", function(){
  console.log("mongodb is connected!!");
});
var db = mongoose.connect('mongodb://127.0.0.1/Names');
var Schema = mongoose.Schema;
var post_schema = new Schema({
   texts:Array,
   url: Array,
   img: Array,
   hesh:Array,
   round:Array,
  
});
user_post=[];
mongoose.model('post', post_schema);
var User = mongoose.model('post');
router.get('/', function(req, res) {
    var recaptcha = new Recaptcha(PUBLIC_KEY, PRIVATE_KEY);

    res.render('index', {
    	title:'Express',
        layout: false,
        locals: {
            recaptcha_form: recaptcha.toHTML()
        }
    });
});

//autoinc id
     autoinc.init(db);
   
var link_schema=new Schema({
    link_id:String,
});
link_schema.plugin(autoinc.plugin,{
    model:"Link",
    field:'sub',
    start:100,
    step:2
});
mongoose.model("Link", link_schema);
var new_link=mongoose.model("Link");


var post_schema=new Schema({
  all_post:String
});
mongoose.model("Post",post_schema);
var us_posts=mongoose.model("Post");

router.post('/', function(req, res) {
    var data = {
        remoteip:  req.connection.remoteAddress,
        challenge: req.body.recaptcha_challenge_field,
        response:  req.body.recaptcha_response_field
    };
    var recaptcha = new Recaptcha(PUBLIC_KEY, PRIVATE_KEY, data);

    recaptcha.verify(data, function(err) {
    if (err) {
    
res.redirect("/");
    } else {
      
   
  var inf=req.body.post.split(" ");
  var post1=new User({
    texts:[],
    url:[],
    img:[],
    hesh:[],
    
  });
  post1.all=req.body.post;
  for(var i=0; i<inf.length; ++i){
     
    var letters=inf[i].split("");
    if(letters[0]=="#"){
        post1.hesh.push(inf[i]);
        post1.round.push("hesh");
      }
        
    else if((inf[i].indexOf("http://")==0)||(inf[i].indexOf("https://")==0)){
           var link=mime.lookup(inf[i]).substring(0,5);
            console.log(link);
           if(link=="image"){

            post1.img.push(inf[i]);
            post1.round.push("img");
        }
        
           else{
            post1.url.push(inf[i]);
            new new_link({
              link_id:inf[i]
            }).save(function(err,data){
             if(err)
              console.log(err);
            });
            post1.round.push("url");
        }
        
        }
        else {
            post1.texts.push(inf[i]);
            post1.round.push("texts");
            }
  }
  post1.save(function(err,data){
    if(err){
        throw err;
        console.log(err);
    }
        else {
          
        }
  });


 // es nor tex piti grem
  
    
var str="<h2>Recaptcha response valid</h2>";
str+="Your post is here <a href=/post />"
str+="localhost:3000/post" 
str+="</a";


    
res.render('post', {body:str});    
}
});
});

router.get("/s/:name",function(req,res){
    new_link.find().exec(function(err,data){
       
       for(var i=0; i<data.length;++i){
        var inf=data[i].toObject();
       
        if(req.params.name==inf.sub){
            
            res.redirect(inf.link_id);
        }
    }
});

});

router.get("/post", function(req,res){
 
  User.find().exec(function(err,data){
     new_link.find().exec(function(err,cont){
    var l=data.length;
    var dat=data[l-1].toObject();
    var str="<p style='font-size:30px'>";
    var a=0;
    var b=0;
    var c=0;
    var d=0;

    for(var i=0; i<dat.round.length;++i){
      
         
    
   if(dat.round[i]=="texts"){
        str+=dat.texts[a];
        str+=" ";
        a++;
       
      }

 
       else if(dat.round[i]=="img"){
        str+=" <a href="
        str+=dat.img[c];
        str+="><img src=";
        str+=dat.img[c] ;
        str+=" style='width:150px; height:150px' /></a> ";
        c++;
       
      }
      else if(dat.round[i]=="hesh"){
        str+=" <a href="
        str+=dat.hesh[d];
        str+="> ";
        str+=dat.hesh[d];
        str+="</a> "
       d++;
    
      }
  
      else if(dat.round[i]=="url"){
        
             
         for(var i=0; i<cont.length;++i){
             var inf=cont[i].toObject();
               if(inf.link_id==dat.url[b]){
         str+=" <a href=";
        str+="/s/";
        str+=inf.sub;
        str+=">";
        str+="localhost:3000/s/";
        str+=inf.sub;
        str+="</a> ";

        b++;
           
       }
         } 
      
       }
      }

     str+="</p>"
     new us_posts({
      all_post:str
     }).save(function(err,data){
      console.log(data.all_post);
     }); 
     
      res.render("post",{body:str});  
     });
   
     
 });
     
 });



router.get("/t/:name",function(req,res){
  
  var hesh="#";
  
  us_posts.find().exec(function(err,data){
     var cont="";
    for(var i=0; i<data.length;++i){
      console.log(data.length);
      hesh+=req.params.name;
      var word=data[i].toObject()
       console.log(word.all_post);
      word=data[i].all_post;
      
        if(word.indexOf(hesh)!=-1){
          cont+=data[i].all_post;
        console.log(cont);


    }
    }

     res.render('post',{body:cont});
  });
 
})


 module.exports = router;
