/*Usage:

var board = new BigBoard({
	id:""       // Div id to be transform to a bigBoard
});

*/

function BigBoard(param){

	function Coordinate(x, y) {
        this.x = x;
        this.y = y;
    }

    function Context(position, width, height){
    	this.position = position;
    	this.width = width;
    	this.height = height;
    }
	

	var createHTMLElement = function(context, dataItem){


		var item = $('<div class="item" draggable="true"><div class="itemContent" contenteditable="false"></div><div class="deleteButton" /></div>');
		//UIItem.css({top:e.clientY,left:e.clientX});
		//UIItem.attr('id', id);

		//var item = document.createElement("div");
		$(item).attr("id", dataItem.id);
		//$(item).addClass("item");
		//$(item).attr("draggable","true");
		$(item).css({cursor:"move"});

		// var itemContent = document.createElement("div");
		// $(itemContent).addClass("itemContent");
		// $(itemContent).attr("contenteditable","false");
		$(item).children(":first").html(dataItem.content);

		//item.appendChild(itemContent);
		$(item).css({top:(dataItem.position.y-context.position.y), 
					 left:(dataItem.position.x-context.position.x)});
		//item.style.left = ;
		return $(item)[0];
	};

	var init = function(boardElement){
		load(boardElement);

	};

	var load = function(boardElement){

		$.getJSON("/context",function(result){
			//console.log(result);
			t.context = result;
			$.getJSON("/data",function(result){
				$.each(result, function(i, dataItem){
					boardElement.appendChild(createHTMLElement(t.context,dataItem));
				});

			});
			var ind = document.createElement("div");
			$(ind).addClass("indicator");
			$(ind).attr("id", "indicator");
			ind.x = t.context.position.x;
			ind.y = t.context.position.y;
			ind.innerText = ind.x + "," + ind.y;
			ind.draggable = true;
			ind.style.cursor="move";
			t.board.appendChild(ind);
			
		});

	};

	var t = this;
	t.board = document.getElementById(param.id);
	t.dataItems = new Array();
	t.context = {};
	init(t.board);

	t.mousePosition = new Coordinate;
	t.lastMouseDownPosition = new Coordinate;

	t.updateItem = function(id, newContent){
		$.ajax({
			type: 'PUT',
			url: "/data/"+id,
			data: {content:newContent},
			success: function(result){
				//console.log('Updated item:'+id);
			},
			dataType: 'json'
		});
	};

	t.deleteItem = function(id){
		$.ajax({
			type: 'DELETE',
			url: "/data/"+id,
			//data: {content:newContent},
			success: function(result){
				console.log('Deleted item:'+id);
			},
			dataType: 'json'
		});
	};

	t.createItem = function(absPosition, content){
		//TBD
		//console.log(absPosition);
		var id = new Date().getTime();
		var dataItem = {id:id, position:absPosition, content:content, status:"NEW"};
		$.post("/data", dataItem, function(result){});
		return id;
	};

	t.moveItem = function(id, offset){
		$.ajax({
			type: 'PUT',
			url: "/data/"+id,
			data: {offset:offset},
			success: function(result){
				console.log('Updated item:'+id);
			},
			dataType: 'json'
		});
	};

	t.moveBoard = function(offset){
        t.context.position.x += offset.x;
        t.context.position.y += offset.y;
		$.ajax({
			type: 'PUT',
			url: "/context/",
			data: {offset:offset},
			success: function(result){
				console.log('Context updated');
			},
			dataType: 'json'
		});

	};


	/**
     * Name:        AddListener()
     * Description: Adds an event listener to the specified element.
     * Parameters:  element - The element for which the listener is being added
     *              event - The event for which the listener is being added
     *              f - The function being called each time that the event occurs
     */
    var AddListener = function(element, event, f) {
        if(element.attachEvent) {
            element["e" + event + f] = f;
            element[event + f] = function () {
                element["e" + event + f](window.event)
            };
            element.attachEvent("on" + event, element[event + f])
        } else element.addEventListener(event, f, false)
    };

//    var AddListeners = function(element, events, f) {
//        for (var i in events){
//            AddListener(element, events[i], f);
//        }
//    };

    var RemoveListener = function(element, event, f){
        if(element.detachEvent) {
            element.detachEvent("on" + event, element[event + f]);
            element[event + f] = null;
        } else {
            element.removeEventListener(event, f, false);
        }
    };





	//// ================  Big Board Item Event Hander ======================

	$(document).on('dblclick','.item',function(e){
		//todo add edit function
		
		$(this).attr('draggable','false');
		$(this).children(":first").attr("contenteditable","true");
		$(this).css({cursor:"auto"});
		$(this).children(":first").focus();

		e.stopPropagation();
		return false;

	});


	$(document).on('focus','.itemContent', function(){
		//console.log("focused");
	});

	$(document).on('click','.deleteButton', function(){
	
		var parentNode = this.parentNode;
		parentNode.parentNode.removeChild(parentNode);
		t.deleteItem(parentNode.id);

	});

	$(document).on('blur','.itemContent', function(){
		//console.log("blurred");
		$(this).attr("contenteditable","false");
		$(this).parent().attr("draggable","true");
		$(this).parent().css({cursor:"move"});
		var id = $(this).parent().attr("id");
		var newContent = $(this).html();
		//console.log("newContent is:" + newContent);
		if (newContent == ""){
			var parentNode = this.parentNode;
			parentNode.parentNode.removeChild(parentNode);
			t.deleteItem(parentNode.id);	
		} else {
			t.updateItem(id, newContent);	
		}
		

	});


	//// ==================== Big Board Move Event-Handler ==================

    AddListener(t.board,'dragstart',function(e){

		var realTarget = e ? e.target : window.event.srcElement;
		//console.log('dragstart:'+e.clientX+','+e.clientY);

		if ($(realTarget).hasClass('item')){
			var style = window.getComputedStyle(realTarget, null);
   				e.dataTransfer.setData("text/plain",
   				(parseInt(style.getPropertyValue("left"),10) - e.clientX) + ',' + 
   				(parseInt(style.getPropertyValue("top"),10) - e.clientY) + ',' + 
   				realTarget.id + ',' +
   				e.clientX + ',' +
   				e.clientY
   			);	
		}
	});

	AddListener(t.board,'dragover',function(e){
		e.dataTransfer.dropEffect = 'move';
		e.preventDefault();
	});

	AddListener(t.board,'dragenter',function(e){
   		this.classList.add('over');
	}); 

	AddListener(t.board,'dragleave',function(e){
		this.classList.remove('over');
	});

	AddListener(t.board,'drop',function(e){ 
			console.log("drop called.");
			//console.log('drop:'+e.clientX+','+e.clientY);
   			var offset = e.dataTransfer.getData("text/plain").split(',');
   			var id = offset[2];
   			var moveItem = document.getElementById(id);
   			
   			moveItem.style.left = (e.clientX + parseInt(offset[0],10)) + 'px';
   			moveItem.style.top = (e.clientY + parseInt(offset[1],10)) + 'px';

   			var startX = parseInt(offset[3],10);
			var startY = parseInt(offset[4],10);
			var offset = {x:(e.clientX - startX),y:e.clientY - startY};

   			t.moveItem(id, offset);
   			
   			e.preventDefault();
   			return false;
		});

	AddListener(t.board,'dblclick',function(e){

		var realTarget = e ? e.target : window.event.srcElement;
		if (!$(realTarget).hasClass('board')) {
			return;
		}

		//console.log(t.context);
		var boardPosition = t.context.position;
		var absPosition = {x:e.clientX + boardPosition.x, y:e.clientY + boardPosition.y};

		var id = t.createItem(absPosition, "");

		var UIItem = $('<div class="item"><div class="itemContent" contenteditable="true"></div><div class="deleteButton" /></div>');
		UIItem.css({top:e.clientY,left:e.clientX});
		UIItem.attr('id', id);
		$(this).append(UIItem);
		UIItem.children(".itemContent").focus();
		//UIItem.children(".deleteButton").css({opacity:0});

	});


	/**
	 *
	 */
	var onBoardMove = function(offsetX, offsetY){
		//move existing elements
		var children = t.board.childNodes;
		//console.log("children length:"+children.length);
		for (var i = 0; i < children.length; i++){
			if ($(children[i]).hasClass('item')){
				//console.log("item found");
				children[i].style.left = (children[i].offsetLeft + offsetX) + "px";
				children[i].style.top = (children[i].offsetTop + offsetY) + "px";
			}
		}

		//update indicator
		var i = document.getElementById('indicator');
		i.x -= offsetX;
		i.y -= offsetY;
		i.innerText = i.x + "," + i.y;

		//TBD:check for new elements to render

		//TBD:remove element invisible if nescessary
	};


	/**
     * Name:        MouseMove()
     * Description: Function called every time that the mouse moves
     */
    var MouseMove = function (b) {
    	//console.log("MouseMove called,x:"+b.clientX+" y:"+b.clientY);
        var offsetX = b.clientX - t.mousePosition.x;
        var offsetY = b.clientY - t.mousePosition.y;
        //console.log("offsetX:"+offsetX+" offsetY:"+offsetY);    
        onBoardMove(offsetX, offsetY);
        t.mousePosition.x = b.clientX;
        t.mousePosition.y = b.clientY;
    };

	/**
     * mousedown event handler
     */
    AddListener(t.board, "mousedown", function (e) {
    	

    	var realTarget = e ? e.target : window.event.srcElement;
		if (!$(realTarget).hasClass('board')) {
			return;
		}

        //console.log("board drag begin");

        t.board.style.cursor = "url(data:image/x-win-bitmap;base64,AAACAAEAICACAAcABQAwAQAAFgAAACgAAAAgAAAAQAAAAAEAAQAAAAAAAAEAAAAAAAAAAAAAAgAAAAAAAAAAAAAA////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8AAAA/AAAAfwAAAP+AAAH/gAAB/8AAAH/AAAB/wAAA/0AAANsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//////////////////////////////////////////////////////////////////////////////////////gH///4B///8Af//+AD///AA///wAH//+AB///wAf//4AH//+AD///yT/////////////////////////////8=), default";

        // Save the current mouse position so we can later find how far the
        // mouse has moved in order to scroll that distance
        t.mousePosition.x = e.clientX;
        t.mousePosition.y = e.clientY;
        t.lastMouseDownPosition.x = e.clientX;
        t.lastMouseDownPosition.y = e.clientY;


        // Start paying attention to when the mouse moves
        AddListener(document, "mousemove", MouseMove);
        t.mouseDown = true;

    }); 

	/**
     * mouseup event handler
     */
    AddListener(document, "mouseup", function (e) {
    	

//    	var realTarget = e ? e.target : window.event.srcElement;
//		if (!$(realTarget).hasClass('board')) {
//			return;
//		}

        if(t.mouseDown) {
            //console.log("board drag end");
            var handler = MouseMove;

            RemoveListener(document,"mousemove",handler);
            //RemoveListener(document,"touchmove",handler);
//            if(document.detachEvent) {
//                document.detachEvent("onmousemove", document["mousemove" + handler]);
//                document["mousemove" + handler] = null;
//            } else {
//                document.removeEventListener("mousemove", handler, false);
//            }
            
            t.mouseDown = false;

            var offsetX = t.lastMouseDownPosition.x - e.clientX;
            var offsetY = t.lastMouseDownPosition.y - e.clientY;

            if (offsetX != 0 && offsetY != 0){
                //console.log("update board position");
                MouseMove(e);
            	t.moveBoard({x:offsetX,y:offsetY});	
            }

        }
        
        t.board.style.cursor = "auto";
    });

    //// ==================== mobile touch event support ==========================
//    var touchHandler = function(e){
//        switch(e.type){
//            case "touchstart":
//                console.log("touch start");
//                break;
//            case "touchmove":
//                console.log("touch move");
//                break;
//            case "touchend":
//                console.log("touch end");
//                break;
//        }
//
//    };
//
//    AddListener(t.board, "touchstart", touchHandler);
//    AddListener(t.board, "touchmove", touchHandler);
//    AddListener(t.board, "touchend", touchHandler);




}

$(document).ready(function(){

	var board = new BigBoard({id:"id_board"});
	
});


