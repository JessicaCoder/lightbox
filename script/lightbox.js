;(function($){
//	alert(1)
	var LightBox = function (settings){
		var self = this;
		console.log(self);
		this.settings={
			speed:500
		};
		$.extend(this.settings,settings||{});
		//创建遮罩和弹出框
		this.popupMask = $('<div id="G-lightbox-mask">');
		this.popupWin = $('<div id="G-lightbox-popup">');
		
		//保存BODY
		this.bodyNode = $(document.body);
		
		//渲染剩余DOM,并且插入到BODY
		this.renderDOM();
		
		this.picViewArea = this.popupWin.find("div.lightbox-pic-view"); //图片预览区域
		this.popupPic = this.popupWin.find("img.lightbox-image"); //图片
		this.picCaptionArea = this.popupWin.find("div.lightbox-pic-caption"); //图片描述区域
		this.nextBtn = this.popupWin.find("span.lightbox-next-btn"); //prev btn
		this.prevBtn = this.popupWin.find("span.lightbox-prev-btn"); //next btn
		this.captionText = this.popupWin.find("p.lightbox-pic-desc"); //desc
		this.currentIndex = this.popupWin.find("span.lightbox-of-index"); //index
		this.closeBtn = this.popupWin.find(".lightbox-close-btn"); //close btn
		//准备开发事件委托,获取组数据
		this.groupName = null ;
		this.groupData = [];
		this.bodyNode.delegate(".js-lightbox,*[data-role=lightbox]","click",function(e){
			//阻止事件冒泡
			e.stopPropagation();
			var currentGroupName = $(this).attr("data-group");
			if(currentGroupName != self.groupName){
				console.log(self.groupName ,currentGroupName);
				self.groupName = currentGroupName;
				self.getGroup();
			}
			//初始化弹出
			self.initPopup($(this));
		});
		
		//关闭弹出
		this.popupMask.click(function(){
			$(this).fadeOut();
			self.popupWin.fadeOut();
			self.clear=false;
		});
		this.closeBtn.click(function(){
			self.popupWin.fadeOut();
			self.popupMask.fadeOut();
			self.clear=false;
		})
		this.flagIndex=true;
		//绑定上下切换按钮事件
		this.nextBtn.hover(function(){
			console.log(self.index)
			if(!$(this).hasClass("disabled")&&self.groupData.length>1){
				$(this).addClass("lightbox-next-btn-show");
			}
		},function(){
			if(!$(this).hasClass("disabled")&&self.groupData.length>1){
				$(this).removeClass("lightbox-next-btn-show");
			}
		}).click(function(e){
			if(!$(this).hasClass("disabled")&&self.flagIndex){
				e.stopPropagation();
				self.flagIndex=false;
				self.goto('next');
			}
		});
		
		this.prevBtn.hover(function(){
			if(!$(this).hasClass("disabled")&&self.groupData.length>1){
				$(this).addClass("lightbox-prev-btn-show");
			}
		},function(){
			if(!$(this).hasClass("disabled")&&self.groupData.length>1){
				$(this).removeClass("lightbox-prev-btn-show");
			}
		}).click(function(e){
			if(!$(this).hasClass("disabled")&&self.flagIndex){
				e.stopPropagation();
				self.flagIndex=false;
				self.goto('prev');
			}
		});
		//判断是否是IE6
//		this.isIE6 = /MSIE 6.0/gi.test(window.navigator.userAgent);
		//绑定窗口调整事件
		var timer = null;
		this.clear =false;
		$(window).resize(function(){
			if(self.clear){
				window.clearTimeout(timer);
				timer =window.setTimeout(function(){
					self.loadPicSize(self.groupData[self.index].src);
				},500);
			}
		}).keyup(function(e){
			var keyVal = e.which;
			console.log(keyVal)
			if(self.clear){
				if(keyVal == '37' ||keyVal == '38'){
					self.prevBtn.click();
				}else if(keyVal == '39' ||keyVal == '40'){
					self.nextBtn.click();
				}
			}
		});
	};
		
	 LightBox.prototype = {
	 	goto:function(dir){
	 		//后一个，前一个
	 		if(dir==='next'){
	 			this.index++;

	 			if(this.index>=this.groupData.length-1){
	 				this.nextBtn.addClass("disabled").removeClass("lightbox-next-btn-show");
	 				
	 			}
	 			if(this.index!=0){
	 				this.prevBtn.removeClass("disabled");
	 			}
	 			var src = this.groupData[this.index].src;
	 			this.loadPicSize(src);
	 		}else if(dir === 'prev'){
	 			this.index--;
	 			if(this.index<=0){
	 				this.prevBtn.addClass("disabled").removeClass("lightbox-prev-btn-show");
	 			}
	 			if(this.index!=this.groupData.length-1){
	 				this.nextBtn.removeClass("disabled");
	 			}
	 			
	 			var src = this.groupData[this.index].src;
	 			this.loadPicSize(src);
	 		}
	 			 			console.warn(this.index,this.groupData.length);
	 			console.warn(this.index>=this.groupData.length-1);
	 	},
	 	loadPicSize:function(sourceSrc){
			//加载图片 尺寸
	 		var self = this;
	 		self.popupPic.css({width:"auto",height:"auto"}).hide();
	 		this.picCaptionArea.hide();
	 		this.preLoadImg(sourceSrc,function(){
	 			self.popupPic.attr("src",sourceSrc);
	 			var picWidth = self.popupPic.width(),
	 			    picHeight = self.popupPic.height();
	 			    self.changePic(picWidth,picHeight);
	 			    
	 		});
	 	},
	 	changePic:function(width,height){
	 		//改变图片重新计算位置长宽，以及动画 -设置描述文字和当前索引
	 		var self = this,
	 		winWidth = $(window).width(),
	 		winHeight = $(window).height();
	 		
	 		//如果图片宽高大于浏览器视口的宽高比例，检查一下是否溢出
	 		var scale = Math.min(winWidth/(width+10),winHeight/(height+10),1); 
	 		width = width*scale;
	 		height = height*scale;
	 		//图片视口
	 		console.log(width,"width");
	 		this.picViewArea.animate({
	 			width:width-10,
	 			height:height-10
	 		},self.settings.speed);
//	 		if(this.isIE6){
//	 			this.popupMask.css({
//	 				width:winWidth,
//	 				height:winHeight
//	 			});
//	 		}
	 		//弹窗动画
	 		this.popupWin.animate({
	 			marginLeft:-width/2,
	 			top:(winHeight-height)/2,
	 			width:width,
	 			height:height,
	 		},self.settings.speed,function(){
	 			self.popupPic.css({
	 				width:width-10,
	 				height:height-10
	 			}).fadeIn();
	 			self.picCaptionArea.fadeIn();
	 			self.flagIndex=true;
	 			self.clear=true;
	 		});
	 		
	 		//设置描述文字和当前索引
	 		this.captionText.text(this.groupData[this.index].caption);
	 		this.currentIndex.text("当前索引： "+(this.index+1)+" of "+this.groupData.length);
			
	 	},
	 	preLoadImg:function(src,callback){
	 		//加载图片
	 		var img = new Image();
	 		if(!!window.ActiveXObject){
	 			img.onreadystatechange = function(){
	 				if(this.readyState == "complete"){
	 					callback();
	 				};
	 			};
	 		}else{
	 			img.onload=function(){
	 				callback();
	 			}
	 		}
	 		img.src=src;
	 	},
	 	showMaskAndPopup:function(sourceSrc,currentId){
	 		/*
	 		 * 展示弹窗过渡动画
	 		 */
	 		var self = this;
	 		
	 		this.popupPic.hide();
	 		this.picCaptionArea.hide();
	 		
	 		this.popupMask.fadeIn();
	 		
	 		var winWidth = $(window).width(),
	 			winHeight = $(window).height();
	 			
	 		this.picViewArea.css({
	 			width:winWidth/2,
	 			width:winHeight/2
	 		});
	 		
	 		this.popupWin.show();
	 		var viewHeight = winHeight/2+10;
	 		
	 		this.popupWin.css({
	 			width:winWidth/2+10,
	 			height:winHeight/2+10,
	 			marginLeft:-(winWidth/2+10)/2,
//	 			width:200,
//	 			height:200,
//	 			marginLeft:-100,
	 			top:-viewHeight
	 		}).animate({
	 			top:(winHeight-viewHeight)/2
	 		},self.settings.speed,function(){
	 			//加载图片
	 			self.loadPicSize(sourceSrc);
	 		});
	 		
	 		//根据当前点击的元素ID获取在当前组别里面的索引
	 		this.index = this.getIndexOf(currentId);
	 		console.log(this.index);
	 		
	 		var groupDataLength = this.groupData.length;
	 		if(groupDataLength>1){
	 			if(this.index === 0){
	 				this.prevBtn.addClass("disabled");
	 				this.nextBtn.removeClass("disabled");
	 			}else if(this.index==groupDataLength-1){
	 				this.prevBtn.removeClass("disabled");
	 				this.nextBtn.addClass("disabled");
	 			}else{
	 				this.prevBtn.removeClass("disabled");
	 				this.nextBtn.removeClass("disabled");
	 			}
	 		}else{
	 			this.prevBtn.addClass("disabled");
	 			this.nextBtn.addClass("disabled");
	 		}
	 		
	 	},
	 	getIndexOf:function(currentId){
	 		//获取索引
	 		
	 		var index=0;
	 		$(this.groupData).each(function(i){
	 			index=i;
	 			if(this.id === currentId ){
	 				return false;
	 			}
	 		});
	 		return index;
	 	},
	 	initPopup:function(currentObj){
	 		/*
	 		 * 初始化弹窗
	 		 * @param 当前点击对象
	 		 */
	 		
	 		var self = this,
	 		sourceSrc = currentObj.attr("data-source");
	 		currentId = currentObj.attr("data-id");
	 		
	 		this.showMaskAndPopup(sourceSrc,currentId);
	 		
	 	},
	 	getGroup:function(){
	 		//获取数据组
	 		var self = this,groupList=[];
	 		self.groupData.length=0;
	 		console.log(groupList);
	 		groupList = this.bodyNode.find("*[data-group = "+self.groupName+"]");
	 		console.info(groupList);
	 		groupList.each(function(){
	 			self.groupData.push({
	 				src:$(this).attr("data-source"),
	 				id:$(this).attr("data-id"),
	 				caption:$(this).data("caption")
	 			});
	 		});
	 		console.warn(self.groupData);
	 		console.log(groupList);
	 	},
		renderDOM:function(){
//			渲染DOM
			var strDom=	'<div class="lightbox-pic-view">'+
							'<span class="lightbox-btn lightbox-prev-btn"></span>'+
							'<img src="" class="lightbox-image"/>'+
							'<span class="lightbox-btn lightbox-next-btn"></span>'+
						'</div>'+
						'<div class="lightbox-pic-caption">'+
							'<div class="lightbox-caption-area">'+
								'<p class="lightbox-pic-desc"></p>'+
								'<span class="lightbox-of-index">当前索引：0 of 0</span>'+
							'</div>'+
							'<span class="lightbox-close-btn"></span>'+
						'</div>';
			//插入到this.popupWin
			this.popupWin.html(strDom);
			//把遮罩和弹出框插入到body
			this.bodyNode.append(this.popupMask,this.popupWin);
			
			
			
			
		}
	};
	window['LightBox'] = LightBox;
})(jQuery);
