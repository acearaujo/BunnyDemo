$(function() {		
				
	JQTWEET = {
	     
	    // Set twitter hash/user, number of tweets & id/class to append tweets
	    // You need to clear tweet-date.txt before toggle between hash and user
	    // for multiple hashtags, you can separate the hashtag with OR, eg:			    
	    search: 'youtu.be&%23nowplaying', //leave this blank if you want to show user's tweet
	    hash: '', //hash
	    user: '', //username
	    numTweets: 21, //number of tweets
	    appendTo: '#jstwitter',
	    useGridalicious: false,
	    template: '<div class="row"><div class="col-md-4"><iframe width="100%" height="auto" src="{VIDEOURL}" frameborder="0" allowfullscreen></iframe></div> <div class="col-md-8"><a href="https://twitter.com/{FOLLOWURL}" class="btn btn-default pull-right">Follow</a><p class="user"> {IMG}<a href="https://www.twitter.com/{USERURL}" target="_blank">{USERNAME} <span>@{USER}<span></a></p><p class="text">{TEXT}</p><p class="time">{AGO}</p></div></div>',

	    // core function of jqtweet
	    // https://dev.twitter.com/docs/using-search
	    loadTweets: function() {

	        var request;
	         
	        // different JSON request {hash|user}
	        if (JQTWEET.search) {
            request = {
                q: JQTWEET.search,
                count: JQTWEET.numTweets,
                api: 'search_tweets'
            }
	        } else {
            request = {
                q: JQTWEET.user,
                count: JQTWEET.numTweets,
                api: 'statuses_userTimeline'
            }
	        }

	        $.ajax({
	            url: 'grabtweets.php',
	            type: 'POST',
	            dataType: 'json',
	            data: request,
	            success: function(data, textStatus, xhr) {
		            
		            if (data.httpstatus == 200) {
		            	
		            	if (JQTWEET.search) data = data.statuses;

			                var text, name, avatar, video_url, video_url_embed, videoid,profilerurl;	         
			               	
			                function youtube_parser(url){
								    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
								    var match = url.match(regExp);
								    return (match&&match[7].length==11)? match[7] : false;
							}

			                try {
			                  // append tweets into page
			                  for (var i = 0; i < JQTWEET.numTweets; i++) {		
			                  	
			                  	profilerurl = 'https://www.twitter.com/'+ data[i].user.screen_name ;
			                    avatar = '';
			                    url = 'http://twitter.com/' + data[i].user.screen_name + '/status/' + data[i].id_str;
			                    avatar = '<a href="' + profilerurl + '" target="_blank"><img width="48" height="48" src="' + data[i].user.profile_image_url + '" /></a>';
			                    video_url = data[i].entities.urls[0].expanded_url;
			                    
			                    // Get Youtube ID and rewrite to embed
			                  	videoid = youtube_parser(video_url);            	
			                  	video_url_embed = "https://www.youtube.com/embed/" + videoid;

			                    $(JQTWEET.appendTo).append( JQTWEET.template.replace('{TEXT}', JQTWEET.ify.clean(data[i].text) )
			                        .replace('{USER}', data[i].user.screen_name)
			                        .replace('{USERURL}', data[i].user.screen_name)
			                        .replace('{FOLLOWURL}', data[i].user.screen_name)
			                        .replace('{IMG}', avatar)                                
			                        .replace('{AGO}', JQTWEET.timeAgo(data[i].created_at) )
			                        .replace('{URL}', url )
			                        .replace('{VIDEOURL}', video_url_embed )
			                        .replace('{USERNAME}', data[i].user.name)			                            
			                        );
			                  }
		                  
		                  } catch (e) {
			                  //item is less than item count
		                  }
                  
		                if (JQTWEET.useGridalicious) {                
			                //run grid-a-licious
											$(JQTWEET.appendTo).gridalicious({
												gutter: 13, 
												width: 200, 
												animate: true
											});	                   
										}                  
	                    
	               } else alert('no data returned');
	             
	            }   
	 
	        });
	 
	    }, 
	     
	         
	    /**
	      * relative time calculator FROM TWITTER
	      * @param {string} twitter date string returned from Twitter API
	      * @return {string} relative time like "2 minutes ago"
	      */
	    timeAgo: function(dateString) {
	        var rightNow = new Date();
	        var then = new Date(dateString);
	         
	        if ($.browser.msie) {
	            // IE can't parse these crazy Ruby dates
	            then = Date.parse(dateString.replace(/( \+)/, ' UTC$1'));
	        }
	 
	        var diff = rightNow - then;
	 
	        var second = 1000,
	        minute = second * 60,
	        hour = minute * 60,
	        day = hour * 24,
	        week = day * 7;
	 
	        if (isNaN(diff) || diff < 0) {
	            return ""; // return blank string if unknown
	        }
	 
	        if (diff < second * 2) {
	            // within 2 seconds
	            return "right now";
	        }
	 
	        if (diff < minute) {
	            return Math.floor(diff / second) + " seconds ago";
	        }
	 
	        if (diff < minute * 2) {
	            return "about 1 minute ago";
	        }
	 
	        if (diff < hour) {
	            return Math.floor(diff / minute) + " minutes ago";
	        }
	 
	        if (diff < hour * 2) {
	            return "about 1 hour ago";
	        }
	 
	        if (diff < day) {
	            return  Math.floor(diff / hour) + " hours ago";
	        }
	 
	        if (diff > day && diff < day * 2) {
	            return "yesterday";
	        }
	 
	        if (diff < day * 365) {
	            return Math.floor(diff / day) + " days ago";
	        }
	 
	        else {
	            return "over a year ago";
	        }
	    }, // timeAgo()
	     
	     
	    /**
	      * The Twitalinkahashifyer!
	      * http://www.dustindiaz.com/basement/ify.html
	      * Eg:
	      * ify.clean('your tweet text');
	      */
	    ify:  {
	      link: function(tweet) {
	        return tweet.replace(/\b(((https*\:\/\/)|www\.)[^\"\']+?)(([!?,.\)]+)?(\s|$))/g, function(link, m1, m2, m3, m4) {
	          var http = m2.match(/w/) ? 'http://' : '';
	          return '<a class="twtr-hyperlink" target="_blank" href="' + http + m1 + '">' + ((m1.length > 25) ? m1.substr(0, 24) + '...' : m1) + '</a>' + m4;
	        });
	      },
	 
	      at: function(tweet) {
	        return tweet.replace(/\B[@＠]([a-zA-Z0-9_]{1,20})/g, function(m, username) {
	          return '<a target="_blank" class="twtr-atreply" href="http://twitter.com/intent/user?screen_name=' + username + '">@' + username + '</a>';
	        });
	      },
	 
	      list: function(tweet) {
	        return tweet.replace(/\B[@＠]([a-zA-Z0-9_]{1,20}\/\w+)/g, function(m, userlist) {
	          return '<a target="_blank" class="twtr-atreply" href="http://twitter.com/' + userlist + '">@' + userlist + '</a>';
	        });
	      },
	 
	      hash: function(tweet) {
	        return tweet.replace(/(^|\s+)#(\w+)/gi, function(m, before, hash) {
	          return before + '<a target="_blank" class="twtr-hashtag" href="http://twitter.com/search?q=%23' + hash + '">#' + hash + '</a>';
	        });
	      },
	 
	      clean: function(tweet) {
	        return this.hash(this.at(this.list(this.link(tweet))));
	      }
	    } // ify
	 
	     
	};		
	
});


function posttweet(url,comment){
  $.ajax({
        url: 'posttweets.php',
        type: 'POST',
        dataType: 'json',
        data : {url:url,comment:comment},
        success: function(data, textStatus, xhr) { 
    }
  });
}



    