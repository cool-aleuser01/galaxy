var DENSITY=1000;var DataCache=function(b,a){this.type=b;this.track=a;this.cache=Object()};$.extend(DataCache.prototype,{get:function(d,b){var c=this.cache;if(!(c[d]&&c[d][b])){if(!c[d]){c[d]=Object()}var a=b*DENSITY*d;var e=(b+1)*DENSITY*d;c[d][b]={state:"loading"};$.getJSON(data_url,{track_type:this.track.track_type,chrom:this.track.view.chrom,low:a,high:e,dataset_id:this.track.dataset_id},function(f){if(f=="pending"){setTimeout(fetcher,5000)}else{c[d][b]={state:"loaded",values:f}}$(document).trigger("redraw")})}return c[d][b]}});var View=function(a,b){this.chrom=a;this.tracks=[];this.max_low=0;this.max_high=b;this.low=this.max_low;this.high=this.max_high;this.length=this.max_high-this.max_low};$.extend(View.prototype,{add_track:function(a){a.view=this;this.tracks.push(a);if(a.init){a.init()}},redraw:function(){$("#overview-box").css({left:(this.low/this.length)*$("#overview-viewport").width(),width:Math.max(4,((this.high-this.low)/this.length)*$("#overview-viewport").width())}).show();$("#low").text(this.low);$("#high").text(this.high);for(var a in this.tracks){this.tracks[a].draw()}$("#bottom-spacer").remove();$("#viewport").append('<div id="bottom-spacer" style="height: 200px;"></div>')},move:function(b,a){this.low=Math.max(this.max_low,Math.floor(b));this.high=Math.min(this.length,Math.ceil(a))},zoom_in:function(d,b){if(this.max_high==0){return}var c=this.high-this.low;var e=c/d/2;if(b==undefined){var a=(this.low+this.high)/2}else{var a=this.low+c*b/$(document).width()}this.low=Math.floor(a-e);this.high=Math.ceil(a+e);if(this.low<this.max_low){this.low=this.max_low;this.high=c/d}else{if(this.high>this.max_high){this.high=this.max_high;this.low=this.max_high-c/d}}if(this.high-this.low<1){this.high=this.low+1}},zoom_out:function(c){if(this.max_high==0){return}var a=(this.low+this.high)/2;var b=this.high-this.low;var d=b*c/2;this.low=Math.floor(Math.max(0,a-d));this.high=Math.ceil(Math.min(this.length,a+d))},left:function(b){var a=this.high-this.low;var c=Math.floor(a/b);if(this.low-c<0){this.low=0;this.high=this.low+a}else{this.low-=c;this.high-=c}},right:function(b){var a=this.high-this.low;var c=Math.floor(a/b);if(this.high+c>this.length){this.high=this.length;this.low=this.high-a}else{this.low+=c;this.high+=c}}});var Track=function(a,b){this.name=a;this.parent_element=b;this.make_container()};$.extend(Track.prototype,{make_container:function(){this.header_div=$("<div class='track-header'>").text(this.name);this.content_div=$("<div class='track-content'>");this.container_div=$("<div class='track'></div>").append(this.header_div).append(this.content_div);this.parent_element.append(this.container_div)}});var TiledTrack=function(){this.last_resolution=null;this.last_w_scale=null;this.tile_cache={}};$.extend(TiledTrack.prototype,Track.prototype,{draw:function(){var k=this.view.low,c=this.view.high,e=c-k;var b=Math.pow(10,Math.ceil(Math.log(e/DENSITY)/Math.log(10)));b=Math.max(b,1);b=Math.min(b,100000);var o=$("<div style='position: relative;'></div>");this.content_div.children(":first").remove();this.content_div.append(o);var m=this.content_div.width(),d=this.content_div.height(),p=m/e,l={},n={};if(this.last_resolution==b&&this.last_w_scale==p){l=this.tile_cache}var g;var a=Math.floor(k/b/DENSITY);var i=0;while((a*1000*b)<c){if(a in l){g=l[a];var f=a*DENSITY*b;g.css({left:(f-this.view.low)*p});o.append(g)}else{g=this.draw_tile(b,a,o,p,d)}if(g){n[a]=g;i=Math.max(i,g.height())}a+=1}o.css("height",i);this.last_resolution=b;this.last_w_scale=p;this.tile_cache=n}});var LineTrack=function(c,b,a){Track.call(this,c,$("#viewport"));this.track_type="line";this.height_px=(a?a:100);this.container_div.addClass("line-track");this.dataset_id=b;this.cache=new DataCache("",this)};$.extend(LineTrack.prototype,TiledTrack.prototype,{make_container:function(){Track.prototype.make_container.call(this);this.content_div.css("height",this.height_px)},init:function(){track=this;$.getJSON(data_url,{stats:true,track_type:track.track_type,chrom:this.view.chrom,low:null,high:null,dataset_id:this.dataset_id},function(a){if(a){track.min_value=a.min;track.max_value=a.max;track.vertical_range=track.max_value-track.min_value;track.view.redraw()}})},draw_tile:function(d,a,o,s,p){if(!this.vertical_range){return}var k=a*DENSITY*d,r=(a+1)*DENSITY*d,c=DENSITY*d;var n=this.cache.get(d,a);var h;if(n.state=="loading"){h=$("<div class='loading tile'></div>")}else{h=$("<canvas class='tile'></canvas>")}h.css({position:"absolute",top:0,left:(k-this.view.low)*s,});o.append(h);if(n.state=="loading"){e=false;return null}var b=h;b.get(0).width=Math.ceil(c*s);b.get(0).height=this.height_px;var q=b.get(0).getContext("2d");var e=false;q.beginPath();var g=n.values;if(!g){return}for(var f=0;f<g.length-1;f++){var m=g[f][0]-k;var l=g[f][1];if(isNaN(l)){e=false}else{m=m*s;y_above_min=l-this.min_value;l=y_above_min/this.vertical_range*this.height_px;if(e){q.lineTo(m,l)}else{q.moveTo(m,l);e=true}}}q.stroke();return h}});var LabelTrack=function(a){Track.call(this,null,a);this.container_div.addClass("label-track")};$.extend(LabelTrack.prototype,Track.prototype,{draw:function(){var c=this.view,d=c.high-c.low,g=Math.floor(Math.pow(10,Math.floor(Math.log(d)/Math.log(10)))),a=Math.floor(c.low/g)*g,e=this.content_div.width(),b=$("<div style='position: relative; height: 1.3em;'></div>");while(a<c.high){var f=(a-c.low)/d*e;b.append($("<div class='label'>"+a+"</div>").css({position:"absolute",left:f-1}));a+=g}this.content_div.children(":first").remove();this.content_div.append(b)}});var itemHeight=13,itemPad=3,thinHeight=7,thinOffset=3;var FeatureTrack=function(b,a){Track.call(this,b,$("#viewport"));this.track_type="feature";this.container_div.addClass("feature-track");this.dataset_id=a;this.zo_slots=new Object();this.show_labels_scale=0.01;this.showing_labels=false};$.extend(FeatureTrack.prototype,TiledTrack.prototype,{calc_slots:function(d){end_ary=new Array();var c=this.container_div.width()/(this.view.high-this.view.low);if(d){this.zi_slots=new Object()}var b=$("<canvas></canvas>").get(0).getContext("2d");for(var a in this.values){feature=this.values[a];f_start=Math.floor(Math.max(this.view.max_low,(feature.start-this.view.max_low)*c));if(d){f_start-=b.measureText(feature.name).width}f_end=Math.ceil(Math.min(this.view.max_high,(feature.end-this.view.max_low)*c));j=0;while(true){if(end_ary[j]==undefined||end_ary[j]<f_start){end_ary[j]=f_end;if(d){this.zi_slots[feature.name]=j}else{this.zo_slots[feature.name]=j}break}j++}}},init:function(){var a=this;$.getJSON(data_url,{track_type:a.track_type,low:a.view.max_low,high:a.view.max_high,dataset_id:a.dataset_id,chrom:a.view.chrom},function(b){a.values=b;a.calc_slots();a.slots=a.zo_slots;a.draw()})},draw_tile:function(q,t,e,g,f){if(!this.values){return null}if(g>this.show_labels_scale&&!this.showing_labels){this.showing_labels=true;if(!this.zi_slots){this.calc_slots(true)}this.slots=this.zi_slots}else{if(g<=this.show_labels_scale&&this.showing_labels){this.showing_labels=false;this.slots=this.zo_slots}}var u=t*DENSITY*q,c=(t+1)*DENSITY*q,b=DENSITY*q;var k=this.view,m=k.high-k.low,o=Math.ceil(b*g),h=new Array(),n=200,l=$("<canvas class='tile'></canvas>");l.css({position:"absolute",top:0,left:(u-this.view.low)*g,});l.get(0).width=o;l.get(0).height=n;var p=l.get(0).getContext("2d");var r=0;for(var s in this.values){feature=this.values[s];if(feature.start<=c&&feature.end>=u){f_start=Math.floor(Math.max(0,(feature.start-u)*g));f_end=Math.ceil(Math.min(o,(feature.end-u)*g));p.fillStyle="#000";p.fillRect(f_start,this.slots[feature.name]*10+5,f_end-f_start,1);if(this.showing_labels&&p.fillText){p.font="10px monospace";p.textAlign="right";p.fillText(feature.name,f_start,this.slots[feature.name]*10+8)}if(feature.exon_start&&feature.exon_end){var d=Math.floor(Math.max(0,(feature.exon_start-u)*g));var w=Math.ceil(Math.min(o,(feature.exon_end-u)*g))}for(var s in feature.blocks){block=feature.blocks[s];block_start=Math.floor(Math.max(0,(block[0]-u)*g));block_end=Math.ceil(Math.min(o,(block[1]-u)*g));var a=3,v=4;if(d&&block_start>=d&&block_end<=w){a=5,v=3}p.fillRect(d,this.slots[feature.name]*10+v,block_end-block_start,a)}r++}}e.append(l);return l},});